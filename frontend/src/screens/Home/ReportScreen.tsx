import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmotionCounts } from '../../api/types';
import useEmotionStats from '../../hooks/useEmotionStats';
import { borderRadius, colors, shadows, spacing, typography } from '../../styles';
import { AppStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'Report'>;

type EmotionKey = keyof EmotionCounts;

interface EmotionMeta {
  key: EmotionKey;
  emoji: string;
  label: string;
  color: string;
}

const EMOTIONS: EmotionMeta[] = [
  { key: 'joy',      emoji: '😊', label: 'Joy',      color: '#F9CB7D' },
  { key: 'sadness',  emoji: '😔', label: 'Sadness',  color: '#6C8EBF' },
  { key: 'anger',    emoji: '😠', label: 'Anger',    color: '#E07070' },
  { key: 'fear',     emoji: '😨', label: 'Fear',     color: '#C097D0' },
  { key: 'neutral',  emoji: '😐', label: 'Neutral',  color: '#A0AEC0' },
  { key: 'surprise', emoji: '😲', label: 'Surprise', color: '#8FB8AD' },
  { key: 'disgust',  emoji: '🤢', label: 'Disgust',  color: '#B5A885' },
];

const EMOTION_MAP: Record<string, EmotionMeta> = Object.fromEntries(
  EMOTIONS.map((e) => [e.key, e]),
);

const ReportScreen: React.FC<Props> = ({ navigation }) => {
  const { stats, isLoading, error, refetch } = useEmotionStats();

  const topMeta = stats?.top_emotion ? EMOTION_MAP[stats.top_emotion] : null;

  const sortedEmotions = stats
    ? [...EMOTIONS].sort(
        (a, b) => stats.emotion_counts[b.key] - stats.emotion_counts[a.key],
      )
    : EMOTIONS;

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centeredState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your insights...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredState}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Couldn't load data</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch} activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!stats) return null;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.subtitle}>Based on your conversations</Text>

        <View style={styles.summaryRow}>
          <View style={[styles.card, styles.summaryCard]}>
            <Text style={styles.cardLabel}>Messages{'\n'}Analyzed</Text>
            <Text style={styles.cardValue}>{stats.total_messages}</Text>
          </View>

          <View style={[styles.card, styles.summaryCard, styles.topEmotionCard]}>
            <Text style={styles.cardLabel}>Top{'\n'}Emotion</Text>
            {topMeta ? (
              <>
                <Text style={styles.topEmotionEmoji}>{topMeta.emoji}</Text>
                <Text style={[styles.topEmotionName, { color: topMeta.color }]}>
                  {topMeta.label}
                </Text>
              </>
            ) : (
              <Text style={styles.noDataText}>No data yet</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Emotion Breakdown</Text>

          {sortedEmotions.map((meta) => {
            const count = stats.emotion_counts[meta.key];
            const pct = stats.total_messages > 0 ? count / stats.total_messages : 0;
            return (
              <View key={meta.key} style={styles.emotionRow}>
                <Text style={styles.emotionEmoji}>{meta.emoji}</Text>
                <Text style={styles.emotionLabel}>{meta.label}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.round(pct * 100)}%`, backgroundColor: meta.color },
                    ]}
                  />
                </View>
                <Text style={styles.emotionCount}>{count}</Text>
              </View>
            );
          })}

          {stats.total_messages === 0 && (
            <Text style={styles.noDataText}>
              Start a conversation to see your emotion trends here.
            </Text>
          )}
        </View>
      </ScrollView>
    );
  };

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
          <Text style={styles.headerTitle}>Your Mood Insights</Text>
          <View style={styles.headerSpacer} />
        </View>

        {renderContent()}

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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  topEmotionCard: {
    borderTopWidth: 3,
    borderTopColor: colors.accent,
  },
  cardLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  cardValue: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  topEmotionEmoji: {
    fontSize: 36,
    marginBottom: 2,
  },
  topEmotionName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semiBold,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  emotionEmoji: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  emotionLabel: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    width: 64,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
    minWidth: 4,
  },
  emotionCount: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semiBold,
    color: colors.text,
    width: 28,
    textAlign: 'right',
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    fontSize: typography.fontSizes.md,
    color: colors.white,
    fontWeight: typography.fontWeights.semiBold,
  },
  noDataText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});

export default ReportScreen;
