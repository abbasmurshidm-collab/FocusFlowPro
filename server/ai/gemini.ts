import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// This uses Gemini AI with the GEMINI_API_KEY from environment variables
// The newest Gemini model is "gemini-2.5-flash" which is fast and free

if (!process.env.GEMINI_API_KEY) {
  console.error("WARNING: GEMINI_API_KEY not configured. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateTasks(goal: string): Promise<any[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI features are not configured. Please add GEMINI_API_KEY.");
  }

  try {
    const prompt = `Break down the following goal into 5-7 specific, actionable tasks.
Return ONLY a valid JSON array of task objects with this exact structure:
[{"title": "Task title", "description": "Brief description", "estimatedMinutes": 60, "priority": "high", "category": "Work"}]

Goal: ${goal}

Requirements:
- Each task should be specific and actionable
- Include realistic time estimates (30-120 minutes each)
- Assign appropriate priorities (high, medium, or low)
- Tasks should be in logical order
- Add relevant categories (Work, Personal, Learning, etc.)
- Provide brief descriptions`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              description: { type: "string" },
              estimatedMinutes: { type: "number" },
              priority: { type: "string", enum: ["low", "medium", "high"] },
              category: { type: "string" },
            },
            required: ["title", "description", "estimatedMinutes", "priority", "category"],
          },
        },
      },
      contents: prompt,
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const tasks = JSON.parse(text);
    return Array.isArray(tasks) ? tasks : [];
  } catch (error) {
    console.error("AI task generation error:", error);
    throw new Error("Failed to generate tasks with AI");
  }
}

export async function getCoachAdvice(question: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI features are not configured. Please add GEMINI_API_KEY.");
  }

  try {
    const systemPrompt = `You are an expert productivity coach. Provide helpful, actionable advice to improve productivity, time management, and focus. 
Keep responses concise (2-3 paragraphs), practical, and encouraging.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: question,
    });

    return response.text || "I'm here to help! Could you rephrase your question?";
  } catch (error) {
    console.error("AI coach error:", error);
    throw new Error("Failed to get productivity advice");
  }
}

export async function summarizeNote(content: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("AI features are not configured. Please add GEMINI_API_KEY.");
  }

  try {
    const prompt = `Summarize the following note in 2-3 concise sentences, capturing the key points:

${content}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("AI summarization error:", error);
    throw new Error("Failed to summarize note");
  }
}
