import { StyleSheet, Platform } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4F0',
  },

  container: {
    flex: 1,
  },

  /* ─── TOP BAR ─── */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5EDE5',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  topBarLogoCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    padding:4,
    backgroundColor: '#e0f5e2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBarAppName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  topBarAppNameAccent: {
    fontSize: 20,
    fontWeight: '300',
    color: '#2E7D32',
    letterSpacing: -0.5,
  },

  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  topBarIconBtn: {
    width: 38,
    height: 38,
    marginEnd:2,
    borderRadius: 12,
    backgroundColor: '#F0F4F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#b9debb',
  },

  /* ─── SCROLL CONTENT ─── */
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },

  /* ─── HEADER GREETING ─── */
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },

  greeting: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.8,
    marginTop: 2,
  },

  dateBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5EDE5',
    alignItems: 'center',
  },

  dateBadgeDay: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dateBadgeNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2E7D32',
    lineHeight: 24,
  },

  /* ─── HEALTH HERO CARD ─── */
  heroCard: {
    borderRadius: 22,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#2E7D32', shadowOpacity: 0.2, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 6 },
    }),
  },

  heroGradientInner: {
    backgroundColor: '#2E7D32',
    borderRadius: 22,
    padding: 20,
  },

  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },

  heroStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  heroStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#86EFAC',
  },

  heroStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  heroHeartBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.4,
  },

  heroSub: {
    color: '#B9F5BB',
    fontSize: 13,
    marginBottom: 16,
  },

  heroStats: {
    flexDirection: 'row',
    gap: 10,
  },

  heroStatChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },

  heroStatValue: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },

  heroStatLabel: {
    color: '#B9F5BB',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },

  /* ─── REMINDER CARD ─── */
  reminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#2E7D32',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },

  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  reminderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reminderTitle: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 14,
  },

  reminderTime: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },

  reminderBtn: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 11,
  },

  reminderBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ─── SECTION ─── */
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.4,
  },

  seeAllText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },

  /* ─── GRID CARDS ─── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'flex-start',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontWeight: '700',
    color: '#111827',
    fontSize: 14,
  },

  cardSub: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 3,
    fontWeight: '500',
  },

  cardArrow: {
    marginTop: 10,
  },

  /* ─── FOOTER CARE CARD ─── */
  footerCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginTop: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },

  footerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerTextBlock: {
    flex: 1,
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },

  footerText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  /* ─── BOTTOM TAB BAR ─── */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 14,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderTopColor: '#d0e3d0',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: -4 } },
      android: { elevation: 10 },
    }),
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },

  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.2,
  },

  tabLabelActive: {
    color: '#2E7D32',
  },

  tabIconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },

  tabIconBoxActive: {
    backgroundColor: '#E8F5E9',
  },

  /* FAB center tab */
  fabTab: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...Platform.select({
      ios: { shadowColor: '#2E7D32', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },
});