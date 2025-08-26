import Constants from "expo-constants";
import { Entry } from "../data/types";

const GEMINI_API_KEY = (Constants.expoConfig?.extra as any)?.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

interface WeeklySummaryResponse {
  ok: boolean;
  summary?: string;
  focus?: string;
  error?: string;
}

interface TextEnhancementResponse {
  ok: boolean;
  enhancedText?: string;
  originalText?: string;
  error?: string;
}

export class AIService {
  static async enhanceJournalText(
    rawText: string
  ): Promise<TextEnhancementResponse> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
      return {
        ok: false,
        error:
          "Gemini API key not configured. Please add your key to the .env file.",
      };
    }

    if (rawText.trim().length < 10) {
      return {
        ok: false,
        error: "Text too short to enhance",
      };
    }

    try {
      const systemInstruction = `You are a gentle writing assistant for a personal journal app.
Enhance the user's journal entry by:
- Improving clarity and flow while keeping their authentic voice
- Fixing grammar and spelling naturally
- Adding emotional depth where appropriate
- Keeping the same length and meaning
- Being supportive and non-judgmental

Return ONLY the enhanced text, no extra formatting or explanations.
Keep it personal and authentic to the original writer's style.`;

      const prompt = `${systemInstruction}\n\nEnhance this journal entry:\n\n"${rawText}"`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!enhancedText) {
        throw new Error("No response from Gemini API");
      }

      return {
        ok: true,
        enhancedText: enhancedText.trim(),
        originalText: rawText,
      };
    } catch (error) {
      console.error("Text enhancement error:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async aiWeeklySummary(
    entries: Entry[]
  ): Promise<WeeklySummaryResponse> {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-gemini-api-key-here") {
      return {
        ok: false,
        error:
          "Gemini API key not configured. Please add your key to the .env file.",
      };
    }

    if (entries.length < 7) {
      return {
        ok: false,
        error: "Need at least 7 entries for weekly summary",
      };
    }

    try {
      // Prepare entries for AI analysis
      const entriesText = entries
        .slice(0, 7) // Take last 7 entries
        .map(
          (entry) =>
            `Date: ${entry.dateISO}, Mood: ${entry.mood}/10, Entry: "${entry.text}"`
        )
        .join("\n");

      const systemInstruction = `You are a gentle journaling summarizer for a wellness app.
Return STRICT JSON only:
{ "summary": "<=120 words empathetic summary", "focus": "<=18 words weekly focus" }
Be empathetic and non-clinical. Avoid diagnoses, medical or crisis advice.
If entries are heavy, keep language supportive and general. No extra text.`;

      const prompt = `${systemInstruction}\n\nAnalyze these journal entries and provide a gentle weekly summary:\n\n${entriesText}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No response from Gemini API");
      }

      // Try to parse JSON from the response
      try {
        const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!parsed.summary || !parsed.focus) {
          throw new Error("Invalid JSON structure");
        }

        return {
          ok: true,
          summary: parsed.summary,
          focus: parsed.focus,
        };
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        return {
          ok: false,
          error: "AI response was not valid JSON",
        };
      }
    } catch (error) {
      console.error("AI Service error:", error);
      return {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
