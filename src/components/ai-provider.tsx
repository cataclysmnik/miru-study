"use client";

import * as React from "react";
import { GeneratedResourceItem, GenerationResourceType, AIProviderConfig } from "@/types/ai";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

interface AIContextType {
  resources: GeneratedResourceItem[];
  isLoading: boolean;
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
  refreshResources: () => Promise<void>;
}

const AIContext = React.createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [resources, setResources] = React.useState<GeneratedResourceItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [providerConfig, setProviderConfig] = React.useState<AIProviderConfig>({
    provider: "platform",
    model: "gemini-1.5-flash",
    isBYOK: false,
    hasKey: false,
  });

  const [storedBYOKKey, setStoredBYOKKey] = React.useState<string>("");

  // Load real resources from Supabase
  const loadResources = async () => {
    if (!user) {
      setResources([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("resources")
        .select(`
          id,
          course_id,
          module_id,
          topic_id,
          title,
          resource_type,
          content_markdown,
          citations,
          created_at,
          is_favorite,
          courses (
            code
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        const mapped: GeneratedResourceItem[] = data.map((r: any) => ({
          id: r.id,
          courseId: r.course_id,
          courseCode: r.courses?.code || "COURSE",
          moduleId: r.module_id,
          topicId: r.topic_id,
          title: r.title,
          resourceType: r.resource_type,
          contentMarkdown: r.content_markdown || "",
          citations: r.citations || [],
          createdAt: new Date(r.created_at).toLocaleDateString(),
          isFavorite: r.is_favorite,
        }));
        setResources(mapped);
      }
    } catch (e) {
      console.error("Error loading resources from database:", e);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadResources();
  }, [user]);

  const saveBYOKKey = (provider: "gemini" | "openai", key: string, model: string) => {
    setStoredBYOKKey(key);
    setProviderConfig({
      provider,
      model,
      isBYOK: true,
      hasKey: true,
    });
  };

  const removeBYOKKey = () => {
    setStoredBYOKKey("");
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
    // 1. Call real generation route
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseId: params.courseId,
        courseCode: params.courseCode,
        moduleId: params.moduleId,
        topicName: params.topicName || params.moduleName,
        resourceType: params.resourceType,
        customPrompt: params.customPrompt,
        byokProvider: providerConfig.isBYOK ? providerConfig.provider : undefined,
        byokKey: providerConfig.isBYOK ? storedBYOKKey : undefined,
        byokModel: providerConfig.isBYOK ? providerConfig.model : undefined,
        userId: user?.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Generation failed");
    }

    // 2. Persist real resource to Supabase resources table
    let savedId = `res-${Date.now()}`;
    if (user) {
      try {
        const { data: insertedRecord } = await supabase
          .from("resources")
          .insert({
            user_id: user.id,
            course_id: params.courseId,
            module_id: params.moduleId && params.moduleId !== "all" ? params.moduleId : null,
            topic_id: params.topicId && params.topicId !== "all" ? params.topicId : null,
            title: data.title,
            resource_type: params.resourceType,
            content_markdown: data.contentMarkdown,
            citations: data.citations || [],
          })
          .select("id")
          .single();

        if (insertedRecord) {
          savedId = insertedRecord.id;
        }
      } catch (err) {
        console.error("Error saving resource to database:", err);
      }
    }

    const newRes: GeneratedResourceItem = {
      id: savedId,
      courseId: params.courseId,
      courseCode: params.courseCode,
      moduleId: params.moduleId,
      moduleName: params.moduleName,
      topicId: params.topicId,
      topicName: params.topicName,
      title: data.title,
      resourceType: params.resourceType,
      contentMarkdown: data.contentMarkdown,
      citations: data.citations || [],
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
        isLoading,
        providerConfig,
        setProviderConfig,
        saveBYOKKey,
        removeBYOKKey,
        generateResource,
        refreshResources: loadResources,
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
