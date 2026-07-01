/**
 * Connection config for the EXISTING (frozen) Supabase backend.
 *
 * SUPABASE_URL / SUPABASE_ANON_KEY are injected at build time by
 * rspack.config.mjs (DefinePlugin) from the build environment. When unset
 * (e.g. a fresh shell with no real backend wired yet), placeholders keep the
 * app booting — auth calls simply fail at the network layer until real values
 * are provided. Bolt 1 (Auth) requires real values to run end-to-end.
 */

// Module-local ambient: the value is replaced inline by DefinePlugin at build
// time; under Jest the real Node `process` supplies it.
declare const process: { env: { [key: string]: string | undefined } };

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_ANON = 'placeholder-anon-key';

const url = process.env.SUPABASE_URL ?? '';
const anon = process.env.SUPABASE_ANON_KEY ?? '';
// WebAuthn Relying Party ID (a domain you control that hosts assetlinks.json).
// Empty = passkeys disabled (the UI degrades gracefully). See V9 activation docs.
const passkeyRpId = process.env.PASSKEY_RP_ID ?? '';

export const ENV = {
  SUPABASE_URL: url || PLACEHOLDER_URL,
  SUPABASE_ANON_KEY: anon || PLACEHOLDER_ANON,
  isConfigured: Boolean(url && anon),
  PASSKEY_RP_ID: passkeyRpId,
} as const;
