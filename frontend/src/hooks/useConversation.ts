import { useCallback, useEffect, useRef, useState } from 'react';
import conversationService from '../api/conversationService';
import { ChatMessage } from '../api/types';
import { formatErrorMessage } from '../utils';
import useAudioRecorder from './useAudioRecorder';

export interface UseConversationReturn {
  messages: ChatMessage[];
  isRecording: boolean;
  isTranscribing: boolean;
  isChatting: boolean;
  durationMs: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  clearError: () => void;
}

let messageCounter = 0;
const generateId = (): string => `msg-${Date.now()}-${++messageCounter}`;

const useConversation = (): UseConversationReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recorder = useAudioRecorder();
  const lastTranscribedUri = useRef<string | null>(null);
  const conversationIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const uri = recorder.audioUri;
    if (!uri || uri === lastTranscribedUri.current) return;

    lastTranscribedUri.current = uri;

    const handleAudio = async () => {
      setError(null);

      // ── Step 1: Transcribe audio ──────────────────────────────────────────
      setIsTranscribing(true);
      let transcript: string;
      try {
        const transcribeResult = await conversationService.transcribeAudio(uri);
        transcript = transcribeResult.transcript;
      } catch (err) {
        setError(formatErrorMessage(err));
        setIsTranscribing(false);
        return;
      } finally {
        setIsTranscribing(false);
      }

      // ── Step 2: Optimistically append user message ────────────────────────
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: transcript,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // ── Step 3: Get AI reply ──────────────────────────────────────────────
      setIsChatting(true);
      try {
        const chatResult = await conversationService.chatMessage(
          transcript,
          conversationIdRef.current,
        );

        conversationIdRef.current = chatResult.conversation_id;

        const userMessageWithEmotion: ChatMessage = {
          ...userMessage,
          emotion: chatResult.emotion,
        };

        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: chatResult.reply,
          timestamp: Date.now(),
        };

        setMessages((prev) => [
          ...prev.slice(0, -1),
          userMessageWithEmotion,
          assistantMessage,
        ]);
      } catch (err) {
        setError(formatErrorMessage(err));
      } finally {
        setIsChatting(false);
      }
    };

    handleAudio();
  }, [recorder.audioUri]);

  const clearError = useCallback(() => setError(null), []);

  const combinedError = error ?? recorder.error;

  return {
    messages,
    isRecording: recorder.isRecording,
    isTranscribing,
    isChatting,
    durationMs: recorder.durationMs,
    error: combinedError,
    startRecording: recorder.startRecording,
    stopRecording: recorder.stopRecording,
    cancelRecording: recorder.cancelRecording,
    clearError,
  };
};

export default useConversation;
