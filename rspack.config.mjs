import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as Repack from '@callstack/repack';
import rspack from '@rspack/core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Minimal .env loader (no dependency). Reads KEY=VALUE lines, ignores blanks and
 * `#` comments, strips surrounding quotes. Precedence: real process.env >
 * .env.local > .env. Both .env files are gitignored (see .gitignore); commit
 * only .env.example.
 */
function loadEnvFile(file) {
  const result = {};
  if (!fs.existsSync(file)) {
    return result;
  }
  for (const rawLine of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const eq = line.indexOf('=');
    if (eq === -1) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

const fileEnv = {
  ...loadEnvFile(path.join(__dirname, '.env')),
  ...loadEnvFile(path.join(__dirname, '.env.local')),
};

const SUPABASE_URL = process.env.SUPABASE_URL ?? fileEnv.SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ?? fileEnv.SUPABASE_ANON_KEY ?? '';
const PASSKEY_RP_ID = process.env.PASSKEY_RP_ID ?? fileEnv.PASSKEY_RP_ID ?? '';

/**
 * Rspack configuration enhanced with Re.Pack defaults for React Native.
 *
 * Learn about Rspack configuration: https://rspack.dev/config/
 * Learn about Re.Pack configuration: https://re-pack.dev/docs/guides/configuration
 */

export default Repack.defineRspackConfig({
  context: __dirname,
  entry: './index.js',
  resolve: {
    ...Repack.getResolveOptions(),
  },
  module: {
    rules: [
      {
        test: /\.[cm]?[jt]sx?$/,
        type: 'javascript/auto',
        use: {
          loader: '@callstack/repack/babel-swc-loader',
          parallel: true,
          options: {},
        },
      },
      ...Repack.getAssetTransformRules(),
    ],
  },
  plugins: [
    new Repack.RepackPlugin(),
    // Inject the (frozen) Supabase backend connection. Sourced from process.env
    // or .env/.env.local (see loader above). Unset values fall back to
    // placeholders in src/config/env.ts so the app still boots.
    new rspack.DefinePlugin({
      'process.env.SUPABASE_URL': JSON.stringify(SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(SUPABASE_ANON_KEY),
      'process.env.PASSKEY_RP_ID': JSON.stringify(PASSKEY_RP_ID),
    }),
  ],
});
