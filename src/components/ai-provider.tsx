"use client";

import * as React from "react";
import { GeneratedResourceItem, GenerationResourceType, AIProviderConfig } from "@/types/ai";
import { INITIAL_GENERATED_RESOURCES } from "@/lib/mock-resources";

interface AIContextType {
  resources: GeneratedResourceItem[];
  providerConfig: AIProviderConfig;
  setProviderConfig: (config: AIProviderConfig) => void;
  saveBYOKKey: (provider: "gemini" | "openai", key: string, model: string) => void;
  removeBYOKKey: () => void;
  generateResource: (params: {
    courseId: string;
    courseCode: string;
    moduleId?: string;
    moduleName?: string;
    topicId?: string;
    topicName?: string;
    resourceType: GenerationResourceType;
    customPrompt?: string;
  }) => Promise<GeneratedResourceItem>;
}

const AIContext = React.createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [resources, setResources] = React.useState<GeneratedResourceItem[]>(
    INITIAL_GENERATED_RESOURCES
  );

  const [providerConfig, setProviderConfig] = React.useState<AIProviderConfig>({
    provider: "platform",
    model: "gemini-1.5-flash",
    isBYOK: false,
    hasKey: false,
  });

  const saveBYOKKey = (provider: "gemini" | "openai", key: string, model: string) => {
    // In local client state, register key usage flag (never logged or exposed)
    setProviderConfig({
      provider,
      model,
      isBYOK: true,
      hasKey: true,
    });
  };

  const removeBYOKKey = () => {
    setProviderConfig({
      provider: "platform",
      model: "gemini-1.5-flash",
      isBYOK: false,
      hasKey: false,
    });
  };

  const generateResource = async (params: {
    courseId: string;
    courseCode: string;
    moduleId?: string;
    moduleName?: string;
    topicId?: string;
    topicName?: string;
    resourceType: GenerationResourceType;
    customPrompt?: string;
  }): Promise<GeneratedResourceItem> => {
    // Simulate grounded generation pipeline
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const titlePrefix: Record<GenerationResourceType, string> = {
      detailed_notes: "Comprehensive Study Notes",
      revision_notes: "High-Yield Revision Brief",
      exam_notes: "Exam Preparation Digest",
      summary: "Executive Syllabus Summary",
      mcq_quiz: "Targeted MCQ Mastery Set",
      flashcards: "Key Definitions & Invariants Flashcards",
      cheat_sheet: "Quick Reference Cheat Sheet",
      formula_sheet: "Essential Equations & Complexity Bounds",
    };

    const targetTopic = params.topicName || params.moduleName || "Course Scope";
    const title = `${titlePrefix[params.resourceType]} — ${targetTopic}`;

    const newRes: GeneratedResourceItem = {
      id: `gen-${Date.now()}`,
      courseId: params.courseId,
      courseCode: params.courseCode,
      moduleId: params.moduleId,
      moduleName: params.moduleName,
      topicId: params.topicId,
      topicName: params.topicName,
      title,
      resourceType: params.resourceType,
      contentMarkdown: `# ${title}

## Scope & Syllabus Context
- **Course**: ${params.courseCode}
- **Module**: ${params.moduleName || "General Course"}
- **Specific Topic**: ${targetTopic}

---

## 1. Core Principles & Theoretical Grounding
Based on your uploaded course slides and textbook chapters, this unit examines the foundational properties of **${targetTopic}**. 

1. **Key Concept**: The primary objective is establishing optimal sub-structure and maintaining consistency invariants across states.
2. **Analytical Rigor**: Every transition adheres to mathematical recurrence constraints verified in your curriculum.

---

## 2. In-Depth Technical Breakdown
\`\`\`text
[Input Scope] -> [State Definition] -> [Transition Function] -> [Validated Output]
\`\`\`

- **Primary Formulation**:
  $$f(x) = \\sum_{i=1}^k w_i \\cdot \\phi(s_i)$$

- **Practical Implication**: When revising for your upcoming examination, focus especially on trade-offs between asymptotic efficiency and memory footprint.

---

## 3. Grounded Academic Citations
The above analysis was synthesized directly from your uploaded materials for **${params.courseCode}**.
`,
      citations: [
        {
          title: `${params.courseCode} Official Lecture Documents`,
          page: 12,
          excerpt: `Verified grounding against ${targetTopic} in syllabus.`,
        },
      ],
      createdAt: "Just now",
      isFavorite: false,
    };

    setResources((prev) => [newRes, ...prev]);
    return newRes;
  };

  return (
    <AIContext.Provider
      value={{
        resources,
        providerConfig,
        setProviderConfig,
        saveBYOKKey,
        removeBYOKKey,
        generateResource,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const ctx = React.useContext(AIContext);
  if (!ctx) throw new Error("useAI must be used within an AIProvider");
  return ctx;
}

