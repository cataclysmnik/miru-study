# Miru — Personal Academic Workspace & AI-Powered Learning Operating System

Miru is a student-first personal academic operating system and AI-powered learning management platform crafted for university students. Miru embraces a mindful Japanese wabi-sabi design philosophy (earthy neutrals, warm beige, matcha green accents) that prioritises quiet focus over institutional clutter.

---

## Key Capabilities

- **Academic Hierarchy**: Customisable Academic Years, Semesters, Courses, Modules, and Topics.
- **Syllabus & Material Management**: Grounded in your actual uploaded notes, slides, and syllabi.
- **Syllabus-Aware AI Studio**: Generates grounded notes, revision summaries, flashcards, and exam-style questions with verifiable citations.
- **Rich Block Editor**: BlockNote-powered document editing with inline AI assistance.
- **Offline-First PWA**: Study, revise, and review cached materials with seamless sync upon reconnection.
- **BYOK & Built-in AI**: Secure encrypted storage for personal OpenAI / Google Gemini API keys.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling**: Tailwind CSS v4, Lucide Icons, Radix UI primitives
- **Auth & Database**: Supabase Auth (Google OAuth), PostgreSQL with Row Level Security (RLS) & `pgvector`
- **Editor**: BlockNote (TipTap / ProseMirror)
- **Offline & State**: Service Workers, IndexedDB (Dexie), TanStack Query

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PLATFORM_AI_PROVIDER=gemini
PLATFORM_AI_API_KEY=your_gemini_api_key
CREDENTIAL_ENCRYPTION_KEY=32_byte_hex_encryption_key
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the workspace.
