export interface GeminiMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64
  };
}

export interface GeminiContent {
  parts: GeminiMessagePart[];
  role?: "user" | "model";
}

const MODEL_PRIORITY = [
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-pro-latest",
];

export async function callGemini(
  prompt: string,
  preferredModel: string = "gemini-flash-latest",
  customKey?: string,
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
    responseMimeType?: string;
  },
  inlineFile?: {
    mimeType: string;
    data: string; // base64
  }
): Promise<string> {
  const apiKey =
    customKey ||
    process.env.PLATFORM_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    "";

  if (!apiKey) {
    throw new Error("No Gemini API key found in configuration");
  }

  const modelsToTry = [
    preferredModel,
    ...MODEL_PRIORITY.filter((m) => m !== preferredModel),
  ];

  let lastError = "";

  const parts: any[] = [{ text: prompt }];
  if (inlineFile) {
    parts.unshift({
      inline_data: {
        mime_type: inlineFile.mimeType,
        data: inlineFile.data,
      },
    });
  }

  const requestBody: any = {
    contents: [
      {
        parts,
      },
    ],
    generationConfig: {
      maxOutputTokens: generationConfig?.maxOutputTokens || 8192,
      temperature: generationConfig?.temperature ?? 0.1,
      ...(generationConfig?.responseMimeType ? { responseMimeType: generationConfig.responseMimeType } : {}),
    },
  };

  for (const model of modelsToTry) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`Gemini (${model}) returned status ${response.status}:`, errorText);
        lastError = errorText;
        if (response.status === 503 || response.status === 404) {
          continue;
        }
        throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const text =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        data.candidates?.[0]?.output ||
        "";

      if (text) {
        return text;
      }
    } catch (err: any) {
      lastError = err?.message || String(err);
    }
  }

  throw new Error(`All Gemini model endpoints failed. Last error: ${lastError}`);
}
