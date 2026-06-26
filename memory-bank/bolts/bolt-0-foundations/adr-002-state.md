# ADR-002 — State: TanStack Query v5 + Zustand

- **Status:** Accepted (Bolt 0)
- **Context:** The web used RSC + `unstable_cache` + tag invalidation for server data — none of which exist on mobile. We need client-side server-data caching (fixtures, pools, rankings) plus a small amount of global client state (session, parked deep-link intent). Standards left state "not yet chosen".
- **Decision:** **TanStack Query v5** for all server state (queries/mutations, `staleTime`, refetch-on-focus, invalidation replacing the web's tag system). **Zustand** for the single global client store (`sessionStore`).
- **Alternatives:** TanStack Query + React Context (rejected — more manual re-render plumbing for the session); Redux Toolkit + RTK Query (rejected — more boilerplate than v1 needs).
- **Consequences:** Clear split — server cache vs client/UI state. Both pure-JS (no native dep, Re.Pack-friendly). Cache invalidation strategy (on prediction submit, pool mutations, screen focus) is defined per feature bolt. Query defaults configured centrally in `src/data/queryClient.ts`.
