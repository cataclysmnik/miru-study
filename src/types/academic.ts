export interface SyllabusSubtopic {
  id: string;
  title: string;
}

export interface SyllabusTopic {
  id: string;
  title: string;
  confidenceScore?: number;
  learningOutcomes?: string[];
  subtopics?: SyllabusSubtopic[];
  status?: "not_started" | "in_progress" | "completed" | "needs_revision";
}

export interface SyllabusModule {
  id: string;
  orderIndex: number;
  title: string;
  description?: string;
  hoursOrWeightage?: string;
  topics: SyllabusTopic[];
}

export interface Syllabus {
  id: string;
  version: number;
  isActive: boolean;
  extractionStatus: "pending" | "processing" | "completed" | "failed";
  modules: SyllabusModule[];
}

export interface StudyMaterialItem {
  id: string;
  title: string;
  fileName: string;
  fileType: "pdf" | "docx" | "pptx" | "txt" | "markdown" | "image";
  fileSizeBytes: number;
  pageCount?: number;
  status: "uploaded" | "extracting" | "indexed" | "error";
  moduleId?: string;
  uploadedAt: string;
}

export interface AcademicCourse {
  id: string;
  code: string;
  name: string;
  description: string;
  credits?: number;
  instructorName?: string;
  semesterId: string;
  semesterName: string;
  color: string;
  icon?: string;
  progressPercent: number;
  syllabus: Syllabus;
  materials: StudyMaterialItem[];
}

export interface Semester {
  id: string;
  academicYearId: string;
  name: string;
  status: "current" | "upcoming" | "completed" | "archived";
  startDate?: string;
  endDate?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
  semesters: Semester[];
}

