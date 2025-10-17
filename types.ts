import type { GroundingChunk } from "@google/genai";

export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
}

export enum Personality {
  FRIENDLY = 'Friendly',
  PROFESSIONAL = 'Professional',
  HUMOROUS = 'Humorous',
}

export interface Message {
  id: string;
  role: ChatRole;
  text: string;
  image?: string; // base64 encoded image with data URI
  citations?: GroundingChunk[];
  language?: string; // The language of the message text
  status?: 'generating_text' | 'generating_image' | 'editing_image';
  error?: string; // To hold error messages for display
}

export interface User {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  password?: string; // Hashed/obfuscated password
  profilePicture?: string; // base64 encoded image with data URI
  bio?: string;
  preferredLanguage?: string;
  theme?: 'light' | 'dark';
}

export type { GroundingChunk };