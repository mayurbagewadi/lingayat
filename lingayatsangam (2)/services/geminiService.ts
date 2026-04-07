
import { GoogleGenAI } from "@google/genai";
import { BioFormData } from "../types";

// The Google GenAI SDK can be used to call Gemini models.
// Always use the API key exclusively from the environment variable process.env.API_KEY.
export const generateMatrimonialBio = async (data: BioFormData): Promise<string> => {
  const prompt = `
    You are a professional matrimonial profile writer for the Lingayat community in India.
    Write a respectful, elegant, and culturally appropriate matrimonial bio (about 100-150 words) based on the following details.
    
    Name: ${data.name}
    Gender: ${data.gender}
    Age: ${data.age}
    Education: ${data.education}
    Profession: ${data.profession}
    Location: ${data.location}
    Core Values/Family Background: ${data.values}
    Hobbies: ${data.hobbies}

    Tone: Traditional yet modern, emphasizing family values, education, and the principles of Basavanna if appropriate.
    The output should be ready to paste into a matrimonial profile 'About Me' section.
  `;

  // Create a new GoogleGenAI instance right before making an API call to ensure it uses the correct key.
  // Standardized initialization using process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Using gemini-3-flash-preview for basic text generation tasks as recommended for general text tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Directly access the .text property from the response object.
    return response.text || "Could not generate bio. Please try again.";
  } catch (error) {
    console.error("Error generating bio:", error);
    throw new Error("Failed to generate bio. Please check your connection and try again.");
  }
};
