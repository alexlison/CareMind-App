import { StyleSheet, Platform } from 'react-native';

const COLORS = {
  primary: '#3A7D44',
  primaryLight: '#E8F5EB',
  primaryMid: '#C8E6C9',
  accent: '#F4A261',
  accentLight: '#FEF0E6',
  danger: '#C0392B',
  dangerLight: '#FDEDEC',
  warning: '#E67E22',
  warningLight: '#FEF5E7',
  bg: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceWarm: '#FDFAF6',
  text: '#1C1C1E',
  textSecondary: '#5C6B6F',
  textMuted: '#9BA8AB',
  border: '#E2DDD6',
  borderStrong: '#C9C0B5',
};

const shadow = (opacity = 0.06, radius = 8, y = 3) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    },
    android: {
      elevation: Math.round(radius * 0.6),
    },
  });

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // ─── Loading ────────────────────────────────────────────────────────────────
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    gap: 14,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // ─── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.border,
    ...shadow(0.07, 6, 2),
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryMid,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headerBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  markAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.primaryMid,
  },
  markAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  placeholder: {
    width: 72,
  },

  // ─── Empty State ─────────────────────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
    letterSpacing: -0.3,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ─── List ────────────────────────────────────────────────────────────────────
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },

  // ─── Notification Card ───────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...shadow(0.07, 10, 4),
    overflow: 'hidden',
  },
  unreadCard: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
    borderWidth: 2,
  },

  // Left icon column
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    flexShrink: 0,
  },

  // Right content column
  content: {
    flex: 1,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  // Type tag pill
  typeTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 22,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Footer row
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  time: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: 3,
    fontWeight: '500',
  },

  // Late badge
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── Divider between sections if needed ──────────────────────────────────────
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
});