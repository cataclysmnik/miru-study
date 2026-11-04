"use client";

import * as React from "react";
import { AcademicCourse, Semester, AcademicYear } from "@/types/academic";
import { INITIAL_COURSES, INITIAL_ACADEMIC_YEARS } from "@/lib/academic-store";

interface AcademicContextType {
  years: AcademicYear[];
  courses: AcademicCourse[];
  activeSemester: Semester | null;
  setActiveSemester: (sem: Semester) => void;
  addCourse: (course: Omit<AcademicCourse, "id" | "progressPercent" | "syllabus" | "materials">) => void;
  addAcademicYear: (name: string) => void;
  addSemester: (yearId: string, name: string, status?: Semester["status"]) => void;
  updateTopicStatus: (courseId: string, moduleId: string, topicId: string, status: "not_started" | "in_progress" | "completed" | "needs_revision") => void;
  addSyllabusModule: (courseId: string, title: string, hours?: string) => void;
  addSyllabusTopic: (courseId: string, moduleId: string, title: string) => void;
  addStudyMaterial: (courseId: string, file: { title: string; fileName: string; fileType: "pdf" | "docx" | "pptx" | "txt" | "markdown" | "image"; fileSizeBytes: number; moduleId?: string }) => void;
}

const AcademicContext = React.createContext<AcademicContextType | null>(null);

export function AcademicProvider({ children }: { children: React.ReactNode }) {
  const [years, setYears] = React.useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [courses, setCourses] = React.useState<AcademicCourse[]>(INITIAL_COURSES);
  const [activeSemester, setActiveSemester] = React.useState<Semester | null>(
    INITIAL_ACADEMIC_YEARS[0]?.semesters[0] || null
  );

  const addCourse = (
    newCourseData: Omit<AcademicCourse, "id" | "progressPercent" | "syllabus" | "materials">
  ) => {
    const newCourse: AcademicCourse = {
      ...newCourseData,
      id: `course-${Date.now()}`,
      progressPercent: 0,
      syllabus: {
        id: `syl-${Date.now()}`,
        version: 1,
        isActive: true,
        extractionStatus: "completed",
        modules: [],
      },
      materials: [],
    };
    setCourses((prev) => [newCourse, ...prev]);
  };

  const addAcademicYear = (name: string) => {
    const newYear: AcademicYear = {
      id: `ay-${Date.now()}`,
      name,
      isCurrent: false,
      semesters: [],
    };
    setYears((prev) => [...prev, newYear]);
  };

  const addSemester = (yearId: string, name: string, status: Semester["status"] = "upcoming") => {
    const newSem: Semester = {
      id: `sem-${Date.now()}`,
      academicYearId: yearId,
      name,
      status,
    };
    setYears((prev) =>
      prev.map((year) =>
        year.id === yearId ? { ...year, semesters: [...year.semesters, newSem] } : year
      )
    );
  };

  const updateTopicStatus = (
    courseId: string,
    moduleId: string,
    topicId: string,
    status: "not_started" | "in_progress" | "completed" | "needs_revision"
  ) => {
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
              const updatedTopic = { ...t, status };
              totalTopics++;
              if (status === "completed") completedTopics++;
              return updatedTopic;
            }
            totalTopics++;
            if (t.status === "completed") completedTopics++;
            return t;
          });

          return { ...mod, topics: updatedTopics };
        });

        const newProgress =
          totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

        return {
          ...course,
          progressPercent: newProgress,
          syllabus: { ...course.syllabus, modules: updatedModules },
        };
      })
    );
  };

  const addSyllabusModule = (courseId: string, title: string, hours?: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const newModule = {
          id: `mod-${Date.now()}`,
          orderIndex: c.syllabus.modules.length + 1,
          title,
          hoursOrWeightage: hours || "10 Hours",
          topics: [],
        };
        return {
          ...c,
          syllabus: {
            ...c.syllabus,
            modules: [...c.syllabus.modules, newModule],
          },
        };
      })
    );
  };

  const addSyllabusTopic = (courseId: string, moduleId: string, title: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const updatedModules = c.syllabus.modules.map((m) => {
          if (m.id !== moduleId) return m;
          const newTopic = {
            id: `top-${Date.now()}`,
            title,
            status: "not_started" as const,
          };
          return { ...m, topics: [...m.topics, newTopic] };
        });
        return {
          ...c,
          syllabus: { ...c.syllabus, modules: updatedModules },
        };
      })
    );
  };

  const addStudyMaterial = (
    courseId: string,
    file: {
      title: string;
      fileName: string;
      fileType: "pdf" | "docx" | "pptx" | "txt" | "markdown" | "image";
      fileSizeBytes: number;
      moduleId?: string;
    }
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        const newMat = {
          ...file,
          id: `mat-${Date.now()}`,
          status: "indexed" as const,
          uploadedAt: "Just now",
        };
        return {
          ...c,
          materials: [newMat, ...c.materials],
        };
      })
    );
  };

  return (
    <AcademicContext.Provider
      value={{
        years,
        courses,
        activeSemester,
        setActiveSemester,
        addCourse,
        addAcademicYear,
        addSemester,
        updateTopicStatus,
        addSyllabusModule,
        addSyllabusTopic,
        addStudyMaterial,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
}

export function useAcademic() {
  const ctx = React.useContext(AcademicContext);
  if (!ctx) {
    throw new Error("useAcademic must be used within an AcademicProvider");
  }
  return ctx;
}

