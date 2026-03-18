export interface ApiUser {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_verified: boolean;
  photo_url: string | null;
}

export interface ApiAuthResponse {
  user: ApiUser;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface ApiError {
  success: false;
  detail: string;
  code?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiSuccessResponse<T = unknown> {
  data: T;
  success: true;
}

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  emotion?: string | null;
}

export interface TranscribeResponse {
  transcript: string;
  duration_seconds: number;
  language: string;
}

export interface ChatResponse {
  reply: string;
  conversation_id: string;
  emotion: string | null;
  confidence: number | null;
}

export interface EmotionCounts {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  surprise: number;
  disgust: number;
  neutral: number;
}

export interface EmotionStatsResponse {
  total_messages: number;
  top_emotion: string | null;
  emotion_counts: EmotionCounts;
}
