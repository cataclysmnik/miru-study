-- ====================================================================
-- MIRU ACADEMIC OPERATING SYSTEM — MASTER DATABASE SCHEMA
-- Extensions: uuid-ossp, pgcrypto, pgvector
-- RLS: Enabled on every user-scoped table (auth.uid() = user_id)
-- ====================================================================

-- 1. Enable Core Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Profiles Table (Automatically synced on Supabase Auth signup)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    academic_role TEXT DEFAULT 'Student',
    institution TEXT,
    theme_preference TEXT DEFAULT 'dark',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Trigger to create profile record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Academic Years
CREATE TABLE IF NOT EXISTS public.academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_current BOOLEAN DEFAULT false,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own academic years"
    ON public.academic_years FOR ALL
    USING (auth.uid() = user_id);

-- 4. Semesters
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'current' CHECK (status IN ('current', 'upcoming', 'completed', 'archived')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own semesters"
    ON public.semesters FOR ALL
    USING (auth.uid() = user_id);

-- 5. Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    code TEXT,
    name TEXT NOT NULL,
    description TEXT,
    credits NUMERIC(3, 1),
    instructor_name TEXT,
    color TEXT DEFAULT '#6b8048',
    icon TEXT DEFAULT 'BookOpen',
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own courses"
    ON public.courses FOR ALL
    USING (auth.uid() = user_id);

-- 6. Syllabi
CREATE TABLE IF NOT EXISTS public.syllabi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    extraction_status TEXT DEFAULT 'completed' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.syllabi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own syllabi"
    ON public.syllabi FOR ALL
    USING (auth.uid() = user_id);

-- 7. Syllabus Modules
CREATE TABLE IF NOT EXISTS public.syllabus_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    syllabus_id UUID NOT NULL REFERENCES public.syllabi(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    hours_or_weightage TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.syllabus_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own syllabus modules"
    ON public.syllabus_modules FOR ALL
    USING (auth.uid() = user_id);

-- 8. Syllabus Topics
CREATE TABLE IF NOT EXISTS public.syllabus_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.syllabus_modules(id) ON DELETE CASCADE,
    parent_topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title TEXT NOT NULL,
    learning_outcomes TEXT[],
    confidence_score NUMERIC(3,2) DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own syllabus topics"
    ON public.syllabus_topics FOR ALL
    USING (auth.uid() = user_id);

-- 9. Study Materials & Documents
CREATE TABLE IF NOT EXISTS public.study_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.syllabus_modules(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    page_count INTEGER,
    status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'extracting', 'indexed', 'error')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study materials"
    ON public.study_materials FOR ALL
    USING (auth.uid() = user_id);

-- 10. Document Chunks & pgvector Embeddings
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    material_id UUID NOT NULL REFERENCES public.study_materials(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.syllabus_modules(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    heading TEXT,
    page_number INTEGER,
    slide_number INTEGER,
    token_count INTEGER,
    embedding VECTOR(768), -- Dimension for text-embedding-004 / modern embeddings
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can query own document chunks"
    ON public.document_chunks FOR ALL
    USING (auth.uid() = user_id);

-- Vector Similarity Index
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
    ON public.document_chunks 
    USING ivfflat (embedding vector_cosine_ops) 
    WITH (lists = 100);

-- 11. Generated Resources & BlockNote Notes
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.syllabus_modules(id) ON DELETE SET NULL,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    content_json JSONB DEFAULT '[]'::jsonb,
    content_markdown TEXT,
    citations JSONB DEFAULT '[]'::jsonb,
    is_favorite BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own resources"
    ON public.resources FOR ALL
    USING (auth.uid() = user_id);

-- 12. Topic Progress
CREATE TABLE IF NOT EXISTS public.topic_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES public.syllabus_topics(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'needs_revision')),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, topic_id)
);

ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own topic progress"
    ON public.topic_progress FOR ALL
    USING (auth.uid() = user_id);

-- 13. Study Tasks (Planner)
CREATE TABLE IF NOT EXISTS public.study_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES public.syllabus_topics(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    is_exam BOOLEAN DEFAULT false,
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own study tasks"
    ON public.study_tasks FOR ALL
    USING (auth.uid() = user_id);

-- 14. Private Storage Bucket Setup Instructions
-- Run in Supabase SQL editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('academic-materials', 'academic-materials', false);

