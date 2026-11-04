"use client";

import * as React from "react";
import { AcademicCourse, Semester, AcademicYear } from "@/types/academic";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

interface AcademicContextType {
  years: AcademicYear[];
  courses: AcademicCourse[];
  activeSemester: Semester | null;
  isLoading: boolean;
  setActiveSemester: (sem: Semester) => void;
  addCourse: (course: {
    name: string;
    code?: string;
    description?: string;
    credits?: number;
    instructorName?: string;
    semesterId: string;
    semesterName?: string;
    color?: string;
  }) => Promise<void>;
  addAcademicYear: (name: string) => Promise<void>;
  addSemester: (yearId: string, name: string, status?: Semester["status"]) => Promise<void>;
  updateTopicStatus: (courseId: string, moduleId: string, topicId: string, status: "not_started" | "in_progress" | "completed" | "needs_revision") => Promise<void>;
  addSyllabusModule: (courseId: string, title: string, hours?: string) => Promise<void>;
  addSyllabusTopic: (courseId: string, moduleId: string, title: string) => Promise<void>;
  addStudyMaterial: (courseId: string, file: { title: string; fileName: string; fileType: "pdf" | "docx" | "pptx" | "txt" | "markdown" | "image"; fileSizeBytes: number; moduleId?: string }) => void;
  refreshData: () => Promise<void>;
}

const AcademicContext = React.createContext<AcademicContextType | null>(null);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [years, setYears] = React.useState<AcademicYear[]>([]);
  const [courses, setCourses] = React.useState<AcademicCourse[]>([]);
  const [activeSemester, setActiveSemester] = React.useState<Semester | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  // Initialize or load user's real academic structure from Supabase
  const loadWorkspaceData = async () => {
    if (!user) {
      setYears([]);
      setCourses([]);
      setActiveSemester(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Fetch Academic Years & Semesters
      const { data: yearsData, error: yearsErr } = await supabase
        .from("academic_years")
        .select(`
          id,
          name,
          is_current,
          semesters (
            id,
            academic_year_id,
            name,
            status,
            start_date,
            end_date
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      let loadedYears: AcademicYear[] = (yearsData as any) || [];

      // If user has zero academic years, automatically create their first academic year and semester
      if (loadedYears.length === 0) {
        const { data: newYear } = await supabase
          .from("academic_years")
          .insert({
            user_id: user.id,
            name: "Academic Year 2025–2026",
            is_current: true,
          })
          .select()
          .single();

        if (newYear) {
          const { data: newSem } = await supabase
            .from("semesters")
            .insert({
              user_id: user.id,
              academic_year_id: newYear.id,
              name: "Spring Semester 2026",
              status: "current",
            })
            .select()
            .single();

          loadedYears = [
            {
              id: newYear.id,
              name: newYear.name,
              isCurrent: true,
              semesters: newSem ? [newSem] : [],
            },
          ];
        }
      }

      setYears(loadedYears);
      const currentYear = loadedYears.find((y) => y.isCurrent) || loadedYears[0];
      const activeSem = currentYear?.semesters?.find((s) => s.status === "current") || currentYear?.semesters?.[0] || null;
      setActiveSemester(activeSem);

      // 2. Fetch User's Real Courses with Syllabi, Modules, Topics, and Study Materials
      const { data: coursesData, error: coursesErr } = await supabase
        .from("courses")
        .select(`
          id,
          code,
          name,
          description,
          credits,
          instructor_name,
          semester_id,
          color,
          icon,
          syllabi (
            id,
            version,
            is_active,
            extraction_status,
            syllabus_modules (
              id,
              order_index,
              title,
              description,
              hours_or_weightage,
              syllabus_topics (
                id,
                order_index,
                title,
                confidence_score
              )
            )
          ),
          study_materials (
            id,
            title,
            storage_path,
            file_type,
            file_size_bytes,
            page_count,
            status,
            module_id,
            created_at
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (coursesData) {
        // Fetch topic mastery progress
        const { data: progressData } = await supabase
          .from("topic_progress")
          .select("topic_id, status")
          .eq("user_id", user.id);

        const progressMap = new Map(progressData?.map((p) => [p.topic_id, p.status]) || []);

        const mappedCourses: AcademicCourse[] = coursesData.map((c: any) => {
          const activeSyllabus = c.syllabi?.[0] || {
            id: `syl-${c.id}`,
            version: 1,
            isActive: true,
            extraction_status: "completed",
            syllabus_modules: [],
          };

          const rawModules = activeSyllabus.syllabus_modules || [];
          rawModules.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

          let totalTopics = 0;
          let completedTopics = 0;

          const modules = rawModules.map((m: any) => {
            const rawTopics = m.syllabus_topics || [];
            rawTopics.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0));

            const topics = rawTopics.map((t: any) => {
              const status = progressMap.get(t.id) || "not_started";
              totalTopics++;
              if (status === "completed") completedTopics++;
              return {
                id: t.id,
                title: t.title,
                confidenceScore: t.confidence_score,
                status,
              };
            });

            return {
              id: m.id,
              orderIndex: m.order_index,
              title: m.title,
              description: m.description,
              hoursOrWeightage: m.hours_or_weightage,
              topics,
            };
          });

          const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          const materials = (c.study_materials || []).map((mat: any) => ({
            id: mat.id,
            title: mat.title,
            fileName: mat.storage_path?.split("/").pop() || mat.title,
            fileType: mat.file_type || "pdf",
            fileSizeBytes: mat.file_size_bytes || 0,
            pageCount: mat.page_count || 1,
            status: mat.status || "indexed",
            moduleId: mat.module_id,
            uploadedAt: new Date(mat.created_at).toLocaleDateString(),
          }));

          return {
            id: c.id,
            code: c.code || "",
            name: c.name,
            description: c.description || "",
            credits: c.credits,
            instructorName: c.instructor_name,
            semesterId: c.semester_id,
            semesterName: activeSem?.name || "Current Semester",
            color: c.color || "#6b8048",
            progressPercent,
            syllabus: {
              id: activeSyllabus.id,
              version: activeSyllabus.version || 1,
              isActive: true,
              extractionStatus: activeSyllabus.extraction_status || "completed",
              modules,
            },
            materials,
          };
        });

        setCourses(mappedCourses);
      }
    } catch (err) {
      console.error("Error loading workspace data from Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadWorkspaceData();
  }, [user]);

  // Real Database Insert: Course
  const addCourse = async (newCourseData: {
    name: string;
    code?: string;
    description?: string;
    credits?: number;
    instructorName?: string;
    semesterId: string;
    color?: string;
  }) => {
    if (!user) return;

    try {
      const { data: newCourse, error } = await supabase
        .from("courses")
        .insert({
          user_id: user.id,
          name: newCourseData.name,
          code: newCourseData.code || null,
          description: newCourseData.description || null,
          credits: newCourseData.credits || null,
          instructor_name: newCourseData.instructorName || null,
          semester_id: newCourseData.semesterId,
          color: newCourseData.color || "#6b8048",
        })
        .select()
        .single();

      if (newCourse) {
        // Automatically create active syllabus record
        await supabase.from("syllabi").insert({
          user_id: user.id,
          course_id: newCourse.id,
          version: 1,
          is_active: true,
          extraction_status: "completed",
        });

        await loadWorkspaceData();
      }
    } catch (err) {
      console.error("Error inserting course:", err);
    }
  };

  const addAcademicYear = async (name: string) => {
    if (!user) return;
    await supabase.from("academic_years").insert({ user_id: user.id, name });
    await loadWorkspaceData();
  };

  const addSemester = async (yearId: string, name: string, status: Semester["status"] = "upcoming") => {
    if (!user) return;
    await supabase.from("semesters").insert({ user_id: user.id, academic_year_id: yearId, name, status });
    await loadWorkspaceData();
  };

  // Real Database Update: Topic Status Mastery
  const updateTopicStatus = async (
    courseId: string,
    moduleId: string,
    topicId: string,
    status: "not_started" | "in_progress" | "completed" | "needs_revision"
  ) => {
    if (!user) return;

    // Optimistically update client state
    setCourses((prevCourses) =>
      prevCourses.map((course) => {
        if (course.id !== courseId) return course;

        let totalTopics = 0;
        let completedTopics = 0;

        const updatedModules = course.syllabus.modules.map((mod) => {
          if (mod.id !== moduleId) {
            mod.topics.forEach((t) => {
              totalTopics++;
              if (t.status === "completed") completedTopics++;
            });
            return mod;
          }

          const updatedTopics = mod.topics.map((t) => {
            if (t.id === topicId) {
              totalTopics++;
              if (status === "completed") completedTopics++;
              return { ...t, status };
            }
            totalTopics++;
            if (t.status === "completed") completedTopics++;
            return t;
          });

          return { ...mod, topics: updatedTopics };
        });

        const newProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
        return { ...course, progressPercent: newProgress, syllabus: { ...course.syllabus, modules: updatedModules } };
      })
    );

    // Persist to Supabase topic_progress table
    await supabase
      .from("topic_progress")
      .upsert({
        user_id: user.id,
        topic_id: topicId,
        status,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id,topic_id" });
  };

  // Real Database Insert: Syllabus Module
  const addSyllabusModule = async (courseId: string, title: string, hours?: string) => {
    if (!user) return;

    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const { data: newMod } = await supabase
      .from("syllabus_modules")
      .insert({
        user_id: user.id,
        syllabus_id: course.syllabus.id,
        order_index: course.syllabus.modules.length + 1,
        title,
        hours_or_weightage: hours || "10 Hours",
      })
      .select()
      .single();

    if (newMod) {
      await loadWorkspaceData();
    }
  };

  // Real Database Insert: Syllabus Topic
  const addSyllabusTopic = async (courseId: string, moduleId: string, title: string) => {
    if (!user) return;

    const course = courses.find((c) => c.id === courseId);
    const mod = course?.syllabus.modules.find((m) => m.id === moduleId);

    const { data: newTopic } = await supabase
      .from("syllabus_topics")
      .insert({
        user_id: user.id,
        module_id: moduleId,
        order_index: (mod?.topics.length || 0) + 1,
        title,
      })
      .select()
      .single();

    if (newTopic) {
      await loadWorkspaceData();
    }
  };

  const addStudyMaterial = (courseId: string, file: any) => {
    loadWorkspaceData();
  };

  return (
    <AcademicContext.Provider
      value={{
        years,
        courses,
        activeSemester,
        isLoading,
        setActiveSemester,
        addCourse,
        addAcademicYear,
        addSemester,
        updateTopicStatus,
        addSyllabusModule,
        addSyllabusTopic,
        addStudyMaterial,
        refreshData: loadWorkspaceData,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = React.useContext(AcademicContext);
  if (!ctx) throw new Error("useAcademic must be used within an AcademicProvider");
  return ctx;
}
