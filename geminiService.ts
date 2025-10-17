import {
  GoogleGenAI,
  Chat,
  GenerateContentResponse,
  Modality,
  Content,
  Part,
} from "@google/genai";
import { Personality, Message } from "../types";

const apiKey = process.env.API_KEY;
if (!apiKey) throw new Error("API_KEY environment variable not set.");

const ai = new GoogleGenAI({ apiKey });

const getSystemInstruction = (personality: Personality): string => {
  const base = `You are VSAI, a multimodal AI assistant. Respond in the user's language. You can write and simulate Python code.`;
  const styles = {
    [Personality.PROFESSIONAL]: "Formal, concise, accurate.",
    [Personality.HUMOROUS]: "Witty and clever.",
    [Personality.FRIENDLY]: "Warm and encouraging.",
  };
  // FIX: Use bracket notation with the enum member for the fallback style to match the object's key definition.
  return `${base}\nStyle: ${styles[personality] || styles[Personality.FRIENDLY]}`;
};

export const initializeChat = (
  history: Message[],
  personality: Personality,
  isSearchEnabled: boolean
): Chat => {
  const geminiHistory: Content[] = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: getSystemInstruction(personality),
      ...(isSearchEnabled && { tools: [{ googleSearch: {} }] }),
    },
    history: geminiHistory,
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: { text: string; image?: string }
): Promise<AsyncGenerator<GenerateContentResponse>> => {
  const parts: Part[] = [{ text: message.text }];
  if (message.image) {
    const match = message.image.match(/^data:(image\/\w+);base64,(.*)$/);
    if (match) {
      parts.unshift({
        inlineData: { mimeType: match[1], data: match[2] },
      });
    }
  }
  // FIX: Pass a `SendMessageParameters` object with the `message` property set to the parts array.
  return await chat.sendMessageStream({ message: parts });
};

export const isImageGenerationIntent = (prompt: string): boolean => {
    if (!prompt) return false;
    const keywords = [
        'draw', 'illustrate', 'image of', 'picture of', 'photo of',
        'generate image', 'create image', 'make an image', 'render an image'
    ];
    const lowerCasePrompt = prompt.toLowerCase();
    return keywords.some(kw => lowerCasePrompt.includes(kw));
};

export const isImageEditIntent = (prompt: string): boolean => {
    if (!prompt) return false;
    const keywords = [
        'edit', 'change', 'add', 'remove', 'modify', 'replace', 'put', 'make it',
        'turn it', 'alter', 'insert', 'delete', 'substitute', 'give it', 'draw on'
    ];
    const lowerCasePrompt = prompt.toLowerCase();
    return keywords.some(kw => lowerCasePrompt.includes(kw));
};

export const detectLanguage = async (text: string): Promise<string> => {
  if (!text.trim()) return "en-US";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Detect the language of this text and return only its BCP-47 code: "${text}"`,
      config: { temperature: 0 },
    });
    const code = response.text?.trim();
    return /^[a-z]{2,3}(-[A-Z]{2,4})?$/.test(code || "") ? code! : "en-US";
  } catch {
    return "en-US";
  }
};

export const generateImage = async (
  prompt: string
): Promise<{ text: string; image: string }> => {
  const instruction = `Generate an image for: "${prompt}"`;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: { parts: [{ text: instruction }] },
    config: { responseModalities: [Modality.IMAGE] },
  });

  const imagePart = response.candidates?.[0]?.content.parts.find((p) => p.inlineData);
  const textPart = response.candidates?.[0]?.content.parts.find((p) => p.text);
  if (!imagePart?.inlineData?.data) throw new Error("No image returned");

  return {
    text: textPart?.text || "Here is your image.",
    image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
  };
};

export const editImage = async (
  prompt: string,
  imageUri: string
): Promise<{ text: string; image: string }> => {
  const match = imageUri.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!match) throw new Error("Invalid image format");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        { inlineData: { mimeType: match[1], data: match[2] } },
        { text: `Edit image: "${prompt}"` },
      ],
    },
    config: { responseModalities: [Modality.IMAGE] },
  });

  const imagePart = response.candidates?.[0]?.content.parts.find((p) => p.inlineData);
  const textPart = response.candidates?.[0]?.content.parts.find((p) => p.text);
  if (!imagePart?.inlineData?.data) throw new Error("No edited image returned");

  return {
    text: textPart?.text || "Here is the edited image.",
    image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
  };
};

export const generateSpeech = async (
  text: string,
  voice: string = "Kore"
): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
    },
  });

  const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audio) throw new Error("No audio returned");
  return audio;
};