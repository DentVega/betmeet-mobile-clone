import { StyleSheet } from 'react-native';

export const obStyles = StyleSheet.create({
  content: { padding: 24, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: '#111111', marginBottom: 16 },
  help: { fontSize: 14, color: '#6b7280', marginBottom: 16 },
  body: { fontSize: 16, color: '#374151', lineHeight: 24, marginBottom: 24 },
  assigned: { fontSize: 16, color: '#15803d', fontWeight: '600', marginBottom: 16 },
  error: { color: '#dc2626', fontSize: 14, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  avatarWrap: { borderRadius: 40, borderWidth: 3, borderColor: 'transparent', padding: 2 },
  avatarSelected: { borderColor: '#2563eb' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e5e7eb' },
});
