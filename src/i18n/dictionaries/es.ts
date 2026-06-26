/**
 * Spanish dictionary (default locale). Seed subset for the shell; feature bolts
 * extend this, mirroring the web `es` dictionary. Keep in sync with en.ts
 * (i18n-doc-sync applies to bilingual docs/copy).
 */
export const es = {
  common: { loading: 'Cargando…', retry: 'Reintentar', back: 'Atrás' },
  shell: { signOut: 'Cerrar sesión' },
  tabs: { matches: 'Partidos', pools: 'Ligas', rankings: 'Clasificación' },
  placeholder: { comingSoon: 'Próximamente' },
} as const;

/** Widen the literal `es` shape so other locales can supply their own strings. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Dictionary = Widen<typeof es>;
