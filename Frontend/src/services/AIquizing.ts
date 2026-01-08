import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

// --- Configuration ---
// Note: In a real production app, call a backend endpoint instead of exposing the key here.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; 
const genAI = new GoogleGenerativeAI(API_KEY);

// --- Zod Schema ---
export const QuizSchema = z.object({
  bookTitle: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
    explanation: z.string()
  })).min(1)
});

export type QuizData = z.infer<typeof QuizSchema>;

// --- Generation Function ---
export async function generateBookQuiz(title: string, author: string): Promise<QuizData | null> {
  if (!API_KEY) {
    console.error("Gemini API Key is missing");
    return null;
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          bookTitle: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                question: { type: SchemaType.STRING },
                options: { 
                    type: SchemaType.ARRAY, 
                    items: { type: SchemaType.STRING } 
                },
                correctAnswer: { type: SchemaType.STRING },
                explanation: { type: SchemaType.STRING },
              },
              required: ["question", "options", "correctAnswer", "explanation"],
            },
          },
        },
        required: ["bookTitle", "questions"],
      },
    },
  });

  const prompt = `Generate a 5-question multiple choice quiz for the book "${title}" by ${author}. 
  The tone should be scholarly yet accessible. Ensure the correct answer is in the options list.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error("No response text");
    
    const json = JSON.parse(text);
    return QuizSchema.parse(json);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return null;
  }
}