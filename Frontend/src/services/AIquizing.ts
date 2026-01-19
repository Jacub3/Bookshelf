import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { z } from "zod";

// --- Configuration ---
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
export async function generateBookQuiz(title: string, author: string, chapters: number): Promise<QuizData | null> {
  if (!API_KEY) {
    console.error("Gemini API Key is missing");
    return null;
  }

  // 1. Calculate Total Questions (2 per chapter, minimum of 2 total)
  // We use Math.max to prevent asking for 0 questions if user enters 0 chapters
  const numQuestions = Math.max(2, chapters * 2);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
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

  const prompt = `
  Create a trivia quiz for the book "${title}" by ${author}.
  
  CRITICAL INSTRUCTIONS:
  - Do NOT use direct excerpts or copyrighted passages from the book.
  - Create ORIGINAL questions based on themes, character motivations, and plot summaries.
  - If the book is very famous, focus on analysis rather than recitation.
  
  - Generate exactly ${numQuestions} questions (${chapters} chapters * 2 questions each).
  
  - Return the output strictly as a JSON object with this format:
  {
    "bookTitle": "${title}",
    "questions": [
       { 
         "question": "...", 
         "options": ["A", "B", "C", "D"], 
         "correctAnswer": "The correct option text",
         "explanation": "Why this is correct..."
       }
    ]
  }
`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (!text) throw new Error("No response text");

    const cleanedText = text.replace(/```json|```/g, '').trim();

    const json = JSON.parse(cleanedText);
    return QuizSchema.parse(json);
  } catch (error) {
    console.error("Quiz generation failed:", error);
    return null;
  }
}