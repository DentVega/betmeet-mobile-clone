# System Architecture

> Set during Inception (system-context) and refined during Construction (Design + ADRs).

## Topology (Re.Pack) — single bundle for now
- **Current:** one Re.Pack/Rspack bundle, no Module Federation. There is no host/remote split today.
- **Future (deferred):** if/when federation is adopted, the **host app** boots the runtime, owns core navigation + auth, and resolves/mounts **remotes** (independently buildable/deployable feature chunks downloaded on demand). Diagram the host → remote relationships here when that work begins.

## Rules
- A feature that requires **native modules** cannot be a pure-JS remote — keep it in the host or a native-aware container. Record the decision as an ADR.
- Remote chunk URLs are environment-aware (dev server vs. prod CDN).
- Always design a **graceful fallback** when a remote fails to download.
- Version skew: host and remotes must share compatible singleton versions; document the contract.

## DDD layering (Construction)
- **Domain** (entities, value objects, ubiquitous language) — framework-free, testable.
- **Application** (use cases) — orchestrates domain.
- **UI / RN** — components, navigation, native bindings.

## ADRs
Each non-trivial architectural decision → `memory-bank/bolts/{bolt-id}/adr-NNN.md` (context / decision / consequences).
