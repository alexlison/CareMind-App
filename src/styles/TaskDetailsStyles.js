/**
 * TaskDetailsStyles.js
 * Styles for Task Details screen
 * Large buttons, clear spacing for dementia patients
 */

import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F6',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#4B5563',
    fontWeight: '500',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F6',
    padding: 20,
  },

  errorText: {
    fontSize: 22,
    color: '#374151',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7E0',
  },

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F0',
  },

  backButtonText: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },

  placeholder: {
    width: 48,
  },

  // Content
  container: {
    flex: 1,
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  // Icon
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  // Task Name
  taskName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },

  // Time
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  timeText: {
    fontSize: 24,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '600',
  },

  // Status
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 40,
    marginBottom: 28,
  },

  statusText: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Sections
  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },

  instructionsCard: {
    backgroundColor: '#FFFFFF',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E7E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  instructionsText: {
    fontSize: 20,
    color: '#1F2937',
    lineHeight: 30,
    fontWeight: '500',
  },

  purposeCard: {
    backgroundColor: '#E8F5E9',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },

  purposeText: {
    fontSize: 20,
    color: '#1F2937',
    lineHeight: 30,
    fontWeight: '500',
  },

  dosageCard: {
    backgroundColor: '#F3F4F6',
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  dosageText: {
    fontSize: 24,
    color: '#111827',
    fontWeight: '700',
    textAlign: 'center',
  },

  // Complete Button
  completeButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },

  completeButtonDisabled: {
    opacity: 0.7,
  },

  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    marginLeft: 12,
    letterSpacing: 1,
  },

  // Completed Message
  completedMessage: {
    alignItems: 'center',
    marginTop: 30,
    padding: 28,
    backgroundColor: '#E8F5E9',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },

  completedText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 6,
  },

  completedSubtext: {
    fontSize: 18,
    color: '#4B5563',
    fontWeight: '500',
  },

  // Additional Info


  infoValue: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },

  // Warning
  warningCard: {
    backgroundColor: '#FEF3C7',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  warningText: {
    fontSize: 18,
    color: '#92400E',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 24,
  },
    // Time Window Card
  timeWindowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginBottom: 20,
    alignSelf: 'center',
  },

  timeWindowText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Window Details
  windowDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E7E0',
  },

  windowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  windowLabel: {
    fontSize: 14,
    color: '#6B7280',
  },

  windowValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },

  // Not Available Message
  notAvailableMessage: {
    alignItems: 'center',
    marginTop: 30,
    padding: 28,
    backgroundColor: '#F3F4F6',
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },

  notAvailableText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 6,
  },

  notAvailableSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Add these to your existing TaskDetailsStyles.js

scoreContainer: {
  alignItems: 'center',
  marginBottom: 16,
},

scoreLabel: {
  fontSize: 16,
  color: '#4B5563',
  fontWeight: '500',
},

infoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEF3C7',
  padding: 12,
  borderRadius: 12,
  marginBottom: 16,
  gap: 8,
},

infoLabel: {
  fontSize: 14,
  color: '#92400E',
  flex: 1,
},
// Add these to your TaskDetailsStyles.js

imageContainer: {
  width: 140,
  height: 140,
  borderRadius: 70,
  backgroundColor: '#FFFFFF',
  alignSelf: 'center',
  marginBottom: 24,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#E0E7E0',
},

medicineImage: {
  width: '100%',
  height: '100%',
},

missedMessage: {
  alignItems: 'center',
  marginTop: 30,
  padding: 28,
  backgroundColor: '#FEE2E2',
  borderRadius: 30,
  borderWidth: 2,
  borderColor: '#DC2626',
},

missedText: {
  fontSize: 26,
  fontWeight: '700',
  color: '#DC2626',
  marginTop: 12,
  marginBottom: 6,
},

missedSubtext: {
  fontSize: 18,
  color: '#4B5563',
  fontWeight: '500',
  textAlign: 'center',
},

});
