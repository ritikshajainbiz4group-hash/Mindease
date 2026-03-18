import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage } from '../../api/types';
import useConversation from '../../hooks/useConversation';
import { colors, spacing, typography } from '../../styles';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'Conversation'>;

const WAVEFORM_BARS = [0.4, 0.7, 1.0, 0.6, 0.85, 0.5, 0.75];

const EMOTION_EMOJIS: Record<string, string> = {
  joy: '😊',
  sadness: '😔',
  anger: '😠',
  fear: '😨',
  surprise: '😲',
  disgust: '🤢',
  neutral: '😐',
  anxiety: '😰',
};

const formatDuration = (ms: number): string => {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const MessageBubble = React.memo(({ item }: { item: ChatMessage }) => {
  const isUser = item.role === 'user';
  const emotionEmoji = item.emotion ? EMOTION_EMOJIS[item.emotion] ?? null : null;
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {!isUser && (
        <View style={styles.avatarBadge}>
          <Text style={styles.avatarBadgeText}>AI</Text>
        </View>
      )}
      <View style={styles.bubbleCol}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
            {item.content}
          </Text>
        </View>
        {isUser && emotionEmoji ? (
          <View style={styles.emotionBadge}>
            <Text style={styles.emotionText}>
              {emotionEmoji} {item.emotion}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
});

const ConversationScreen: React.FC<Props> = ({ navigation }) => {
  const {
    messages,
    isRecording,
    isTranscribing,
    isChatting,
    durationMs,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useConversation();

  const isBusy = isTranscribing || isChatting;

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (isRecording) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.35,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording, pulseAnim]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleMicPress = useCallback(async () => {
    if (error) clearError();
    await startRecording();
  }, [startRecording, clearError, error]);

  const renderEmpty = useCallback(
    () => (
      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>🧘</Text>
        <Text style={styles.emptyTitle}>Ready to listen</Text>
        <Text style={styles.emptySubtitle}>
          Tap the microphone and speak freely.{'\n'}Your words will appear here.
        </Text>
      </View>
    ),
    [],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversation</Text>
          <View style={styles.headerSpacer} />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble item={item} />}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.bottomPanel}>
          {isTranscribing ? (
            <View style={styles.transcribingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.transcribingText}>Processing your voice...</Text>
            </View>
          ) : isChatting ? (
            <View style={styles.transcribingRow}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.transcribingText, { color: colors.accent }]}>
                Getting AI response...
              </Text>
            </View>
          ) : null}

          {isRecording ? (
            <View style={styles.waveformRow}>
              {WAVEFORM_BARS.map((height, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: 28 * height,
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.35],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          ) : null}

          {!isRecording ? (
            <Text style={styles.hintText}>
              {isTranscribing
                ? 'Transcribing...'
                : isChatting
                ? 'MindEase is thinking...'
                : 'Tap microphone to start talking'}
            </Text>
          ) : null}

          <View style={styles.controlRow}>
            {isRecording ? (
              <>
                <View style={styles.durationBadge}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.durationText}>{formatDuration(durationMs)}</Text>
                </View>

                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={styles.micBtnActive}
                    onPress={stopRecording}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.micIcon}>⏹</Text>
                  </TouchableOpacity>
                </Animated.View>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={cancelRecording}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.micBtn, isBusy && styles.micBtnDisabled]}
                onPress={handleMicPress}
                activeOpacity={0.8}
                disabled={isBusy}
              >
                <Text style={styles.micIcon}>🎙️</Text>
              </TouchableOpacity>
            )}
          </View>

          {isRecording ? (
            <Text style={styles.listeningLabel}>Listening...</Text>
          ) : null}
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
  backText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  headerSpacer: {
    width: 48,
  },
  errorBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.errorLight,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    textAlign: 'center',
  },
  messageList: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    alignItems: 'flex-end',
  },
  bubbleCol: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    maxWidth: '78%',
  },
  emotionBadge: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emotionText: {
    fontSize: typography.fontSizes.xs ?? 11,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  avatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.xs,
  },
  avatarBadgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: typography.fontWeights.bold,
  },
  bubble: {
    borderRadius: 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bubbleUser: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: typography.fontSizes.md,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: colors.white,
  },
  bubbleTextAssistant: {
    color: colors.text,
  },
  bottomPanel: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    gap: spacing.sm,
  },
  transcribingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transcribingText: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 36,
  },
  waveBar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  micBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  micBtnActive: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  micBtnDisabled: {
    opacity: 0.5,
  },
  micIcon: {
    fontSize: 28,
  },
  hintText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorLight,
    borderRadius: 20,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  durationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    fontWeight: typography.fontWeights.semiBold,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
  },
  listeningLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});

export default ConversationScreen;
