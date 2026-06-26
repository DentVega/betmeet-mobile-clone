/**
 * TanStack Query client (ADR-002) — the server-state cache that replaces the
 * web's RSC/unstable_cache layer. Feature bolts add queries/mutations + their
 * own invalidation; screens refetch on focus explicitly (not on window focus).
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000, // 1 min — mirrors the web's revalidate=60
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
