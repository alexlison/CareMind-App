import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
    padding: 35,
    paddingBottom: 55,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },

  light: {
    fontWeight: '300',
  },

  subtitle: {
    color: '#6B7280',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    paddingBottom: 35,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#374151',
    marginBottom: 16,
  },

  /* LABEL WITH ICON */
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 15,
    marginLeft: 7,
    marginBottom: 10,
  },

  labelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  /* EMAIL INPUT */
  inputBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },

  /* PASSWORD BOX */
  passwordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  passwordInput: {
    flex: 1,
    color: '#111827',
  },

  /* ROW CONTAINER FOR REMEMBER ME AND FORGOT PASSWORD */
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  /* REMEMBER ME SECTION */
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2E7D32',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  rememberMeText: {
    fontSize: 14,
    color: '#475569',
  },

  /* FORGOT PASSWORD */
  forgotPasswordText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },

  /* BUTTON */
  button: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },

  buttonDisabled: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },

  /* TEST BUTTON */
  testButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  testButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '600',
  },

  /* DEMO CONTAINER */
  demoContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  demoText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },

  demoCredentials: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    marginTop: 25,
    fontSize: 12,
    color: '#9CA3AF',
  },
});