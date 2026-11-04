export type GenerationResourceType =
  | "detailed_notes"
  | "revision_notes"
  | "exam_notes"
  | "summary"
  | "mcq_quiz"
  | "flashcards"
  | "cheat_sheet"
  | "formula_sheet";

export type AIProvider = "gemini" | "openai" | "platform";

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  isBYOK: boolean;
  hasKey: boolean;
}

export interface GeneratedResourceItem {
  id: string;
  courseId: string;
  courseCode: string;
  moduleId?: string;
  moduleName?: string;
  topicId?: string;
  topicName?: string;
  title: string;
  resourceType: GenerationResourceType;
  contentMarkdown: string;
  citations: Array<{ title: string; page?: number; excerpt: string }>;
  createdAt: string;
  isFavorite?: boolean;
}

