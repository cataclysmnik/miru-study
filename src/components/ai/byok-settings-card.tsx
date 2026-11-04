"use client";

import * as React from "react";
import { Key, ShieldCheck, Check, Sparkles, Trash2, Cpu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAI } from "@/components/ai-provider";

export function BYOKSettingsCard() {
  const { providerConfig, saveBYOKKey, removeBYOKKey } = useAI();
  const [provider, setProvider] = React.useState<"gemini" | "openai">("gemini");
  const [apiKey, setApiKey] = React.useState("");
  const [model, setModel] = React.useState("gemini-1.5-pro");
  const [savedSuccess, setSavedSuccess] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    saveBYOKKey(provider, apiKey.trim(), model);
    setApiKey("");
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">AI Engine & BYOK Management</CardTitle>
              <CardDescription>
                Miru is free to use with built-in AI, or you can supply your own API key (OpenAI / Google Gemini).
              </CardDescription>
            </div>
          </div>

          <Badge variant={providerConfig.isBYOK ? "matcha" : "secondary"}>
            {providerConfig.isBYOK ? "Active BYOK" : "Platform Managed"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status banner */}
        <div className="p-4 rounded-xl border border-border/80 bg-background/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-foreground">Current Active Engine: </span>
            <span className="text-primary font-mono font-medium">
              {providerConfig.isBYOK
                ? `${providerConfig.provider.toUpperCase()} (${providerConfig.model})`
                : "Platform Built-in (Gemini 1.5 Flash)"}
            </span>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {providerConfig.isBYOK
                ? "Keys are client-guarded, encrypted at rest, and never logged or exposed."
                : "Platform quota: 100 queries/day remaining."}
            </p>
          </div>

          {providerConfig.isBYOK && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeBYOKKey}
              className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Revert to Platform
            </Button>
          )}
        </div>

        {/* Key Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Provider
              </label>
              <select
                value={provider}
                onChange={(e) => {
                  const p = e.target.value as "gemini" | "openai";
                  setProvider(p);
                  setModel(p === "gemini" ? "gemini-1.5-pro" : "gpt-4o");
                }}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="gemini">Google Gemini API</option>
                <option value="openai">OpenAI API</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Model Choice
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {provider === "gemini" ? (
                  <>
                    <option value="gemini-1.5-pro">gemini-1.5-pro (High Reasoning)</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash (Fast & Concise)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Latest)</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-4o">gpt-4o (Omni High Reasoning)</option>
                    <option value="gpt-4o-mini">gpt-4o-mini (Lightweight)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>API Key</span>
              <span className="text-[10px] text-muted-foreground">Encrypted in browser session</span>
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                placeholder={
                  provider === "gemini"
                    ? "AIzaSy..."
                    : "sk-proj-..."
                }
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Zero telemetry logging. Direct provider dispatch.</span>
            </div>

            <Button type="submit" size="sm" className="gap-1.5">
              {savedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Key Activated</span>
                </>
              ) : (
                <>
                  <Key className="h-3.5 w-3.5" />
                  <span>Save & Connect Key</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

