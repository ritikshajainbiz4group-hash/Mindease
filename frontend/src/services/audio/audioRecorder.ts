import { Audio } from 'expo-av';

export interface RecordingResult {
  uri: string;
  durationMs: number;
}

let activeRecording: Audio.Recording | null = null;

export const startRecording = async (): Promise<void> => {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) {
    throw new Error('Microphone permission was denied. Please enable it in Settings.');
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY,
  );

  activeRecording = recording;
};

export const stopRecording = async (): Promise<RecordingResult> => {
  if (!activeRecording) {
    throw new Error('No active recording to stop.');
  }

  await activeRecording.stopAndUnloadAsync();

  const status = await activeRecording.getStatusAsync();
  const uri = activeRecording.getURI();

  activeRecording = null;

  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  if (!uri) {
    throw new Error('Recording URI is unavailable.');
  }

  return {
    uri,
    durationMs: (status as { durationMillis?: number }).durationMillis ?? 0,
  };
};

export const cancelRecording = async (): Promise<void> => {
  if (!activeRecording) return;

  try {
    await activeRecording.stopAndUnloadAsync();
  } finally {
    activeRecording = null;
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
  }
};
