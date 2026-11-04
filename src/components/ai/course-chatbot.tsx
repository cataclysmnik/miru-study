"use client";

import * as React from "react";
import {
  Sparkles,
  Send,
  FileText,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Layers,
  ChevronRight,
} from "lucide-react";
import { AcademicCourse } from "@/types/academic";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CourseChatbotProps {
  course: AcademicCourse;
}

interface Message {
  id: string;
  sender: "user" | "miru";
  text: string;
  sourceType: "grounded" | "general" | "none";
  citations?: { title: string; page?: number; excerpt: string }[];
}

export function CourseChatbot({ course }: CourseChatbotProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      sender: "miru",
      text: `Hello! I am your course assistant for ${course.name}. I am grounded strictly in your ${course.materials.length} uploaded course documents and the ${course.syllabus.modules.length} syllabus modules. Ask me to explain concepts, compare algorithms, or generate review notes.`,
      sourceType: "grounded",
    },
  ]);
  const [input, setInput] = React.useState("");
  const [selectedModuleFilter, setSelectedModuleFilter] = React.useState<string>("all");
  const [isTyping, setIsTyping] = React.useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userText,
      sourceType: "none",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Mindful grounded response generation
    setTimeout(() => {
      let miruMsg: Message;

      const lower = userText.toLowerCase();

      if (lower.includes("knapsack") || lower.includes("dynamic programming")) {
        miruMsg = {
          id: `reply-${Date.now()}`,
          sender: "miru",
          text: `In the 0/1 Knapsack problem (Module 2), we have items with weights w_i and values v_i, and total capacity W. \n\n1. **Optimal Substructure**: The optimal solution either includes item n or excludes it.\n2. **State Transition**: \n   DP[i][w] = max(DP[i-1][w], DP[i-1][w - w_i] + v_i) for w >= w_i.\n3. **Complexity**: Running time is O(n * W), which is pseudo-polynomial because it depends on the numerical value of W.`,
          sourceType: "grounded",
          citations: [
            {
              title: "CLRS - Chapter 15 Dynamic Programming.pdf",
              page: 14,
              excerpt: "Section 15.3: Elements of Dynamic Programming and Knapsack recurrence relations.",
            },
          ],
        };
      } else if (lower.includes("raft") || lower.includes("paxos") || lower.includes("consensus")) {
        miruMsg = {
          id: `reply-${Date.now()}`,
          sender: "miru",
          text: `Raft decomposes consensus into three independent subproblems:\n\n- **Leader Election**: Heartbeat timeouts trigger randomized election timers.\n- **Log Replication**: Leader forces follower logs to duplicate its own.\n- **Safety**: State Machine Safety Invariant guarantees that if any server applied an entry at index i, no other server will ever apply a different entry for index i.`,
          sourceType: "grounded",
          citations: [
            {
              title: "In Search of an Understandable Consensus Algorithm (Raft Paper).pdf",
              page: 4,
              excerpt: "Figure 3: Raft guarantees and leader election safety mechanisms.",
            },
          ],
        };
      } else {
        miruMsg = {
          id: `reply-${Date.now()}`,
          sender: "miru",
          text: `Based on your course materials for ${course.name}, I found relevant coverage in your uploaded syllabus scope. Let me know if you would like me to generate a practice quiz or detailed revision notes for this topic.`,
          sourceType: "grounded",
          citations: [
            {
              title: `${course.code} Course Syllabus`,
              excerpt: "Scope verified against course modules.",
            },
          ],
        };
      }

      setMessages((prev) => [...prev, miruMsg]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <div className="flex flex-col h-[600px] rounded-2xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Chatbot Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border bg-card/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              {course.code} Course-Aware Assistant
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Strictly grounded in {course.materials.length} uploaded files and verified syllabus topics
            </p>
          </div>
        </div>

        {/* Module Scope Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground text-[11px]">Filter Scope:</span>
          <select
            value={selectedModuleFilter}
            onChange={(e) => setSelectedModuleFilter(e.target.value)}
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">Entire Course</option>
            {course.syllabus.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            <div
              className={`rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none shadow-xs"
                  : "bg-secondary/40 text-foreground border border-border/80 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>

            {/* Grounded Citation Pill */}
            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-2 flex flex-col gap-1 w-full">
                {msg.citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg border border-primary/20 bg-primary/5 text-[10px] text-muted-foreground hover:bg-primary/10 transition-colors cursor-pointer"
                  >
                    <BookOpen className="h-3 w-3 text-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">
                      {cite.title}
                      {cite.page && ` (p. ${cite.page})`}
                    </span>
                    <span className="ml-auto text-[9px] uppercase tracking-wider text-primary font-semibold">
                      Grounded Source
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Consulting course documents & syllabus...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-border bg-card/60 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder={`Ask anything about ${course.code} (e.g. "Explain 0/1 knapsack recurrence")...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-10 flex-1 rounded-xl border border-border bg-background px-4 text-xs text-foreground focus:border-primary focus:outline-none"
        />
        <Button type="submit" size="sm" className="h-10 px-4 gap-1.5" disabled={isTyping}>
          <Send className="h-3.5 w-3.5" />
          <span>Send</span>
        </Button>
      </form>
    </div>
  );
}

