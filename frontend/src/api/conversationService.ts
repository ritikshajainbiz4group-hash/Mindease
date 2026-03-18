import apiClient from './client';
import { ChatResponse, TranscribeResponse } from './types';

const CONVERSATION = '/api/v1/conversation';

const conversationService = {
  transcribeAudio: async (audioUri: string): Promise<TranscribeResponse> => {
    const formData = new FormData();

    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as unknown as Blob);

    const { data } = await apiClient.post<TranscribeResponse>(
      `${CONVERSATION}/transcribe`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    );

    return data;
  },

  chatMessage: async (
    message: string,
    conversationId?: string,
  ): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>(`${CONVERSATION}/chat`, {
      message,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
    return data;
  },
};

export default conversationService;
