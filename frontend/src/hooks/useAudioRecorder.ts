import { useCallback, useRef, useState } from 'react';
import {
  cancelRecording,
  RecordingResult,
  startRecording,
  stopRecording,
} from '../services/audio/audioRecorder';
import { formatErrorMessage } from '../utils';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioUri: string | null;
  durationMs: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  reset: () => void;
}

const useAudioRecorder = (): UseAudioRecorderReturn => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [durationMs, setDurationMs] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleStart = useCallback(async () => {
    setError(null);
    setAudioUri(null);
    setDurationMs(0);
    elapsedRef.current = 0;

    try {
      await startRecording();
      setIsRecording(true);
      intervalRef.current = setInterval(() => {
        elapsedRef.current += 100;
        setDurationMs(elapsedRef.current);
      }, 100);
    } catch (err) {
      setError(formatErrorMessage(err));
    }
  }, []);

  const handleStop = useCallback(async () => {
    clearTimer();
    try {
      const result: RecordingResult = await stopRecording();
      setAudioUri(result.uri);
      setDurationMs(result.durationMs > 0 ? result.durationMs : elapsedRef.current);
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsRecording(false);
    }
  }, [clearTimer]);

  const handleCancel = useCallback(async () => {
    clearTimer();
    try {
      await cancelRecording();
    } catch (err) {
      setError(formatErrorMessage(err));
    } finally {
      setIsRecording(false);
      setDurationMs(0);
      elapsedRef.current = 0;
    }
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRecording(false);
    setAudioUri(null);
    setDurationMs(0);
    setError(null);
    elapsedRef.current = 0;
  }, [clearTimer]);

  return {
    isRecording,
    audioUri,
    durationMs,
    error,
    startRecording: handleStart,
    stopRecording: handleStop,
    cancelRecording: handleCancel,
    reset,
  };
};

export default useAudioRecorder;
