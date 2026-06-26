import { StyleSheet } from 'react-native';

/** Shared layout for the auth screens. */
export const authStyles = StyleSheet.create({
  content: { padding: 24, flexGrow: 1, justifyContent: 'center' },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 24,
    textAlign: 'center',
  },
  serverError: {
    color: '#dc2626',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  info: { fontSize: 15, color: '#374151', textAlign: 'center', marginBottom: 16 },
  success: {
    fontSize: 15,
    color: '#15803d',
    textAlign: 'center',
    marginBottom: 16,
  },
  link: { color: '#2563eb', fontSize: 15, textAlign: 'center', marginTop: 16 },
});
