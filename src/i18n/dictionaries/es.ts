/**
 * Spanish dictionary (default locale). Extended per bolt, mirroring the web `es`
 * dictionary. Keep in sync with en.ts (i18n-doc-sync).
 */
export const es = {
  common: { loading: 'Cargando…', retry: 'Reintentar', back: 'Atrás' },
  shell: { signOut: 'Cerrar sesión' },
  tabs: { matches: 'Partidos', pools: 'Ligas', rankings: 'Clasificación' },
  placeholder: { comingSoon: 'Próximamente' },
  auth: {
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    confirmLabel: 'Confirmar contraseña',
    or: 'o',
    google: 'Continuar con Google',
    signIn: {
      title: 'Iniciar sesión',
      submit: 'Entrar',
      forgot: '¿Olvidaste tu contraseña?',
      toSignUp: '¿No tienes cuenta? Regístrate',
    },
    signUp: {
      title: 'Crear cuenta',
      submit: 'Registrarme',
      toSignIn: '¿Ya tienes cuenta? Inicia sesión',
      checkEmail: 'Te enviamos un correo para confirmar tu cuenta.',
    },
    forgot: {
      title: 'Recuperar contraseña',
      submit: 'Enviar enlace',
      sent: 'Si el correo existe, te enviamos un enlace para restablecerla.',
      back: 'Volver a iniciar sesión',
    },
    reset: {
      title: 'Nueva contraseña',
      submit: 'Guardar contraseña',
      done: 'Contraseña actualizada. Inicia sesión.',
    },
    verify: {
      title: 'Verifica tu correo',
      message: 'Abre el enlace que te enviamos para confirmar tu cuenta.',
      verifying: 'Verificando…',
      verified: '¡Correo verificado!',
      resend: 'Reenviar correo',
      resent: 'Correo reenviado.',
    },
    errors: {
      emailRequired: 'Ingresa tu correo.',
      emailInvalid: 'Correo no válido.',
      passwordRequired: 'Ingresa tu contraseña.',
      passwordTooShort: 'La contraseña debe tener al menos 8 caracteres.',
      confirmRequired: 'Confirma tu contraseña.',
      confirmMismatch: 'Las contraseñas no coinciden.',
      invalidCredentials: 'Correo o contraseña incorrectos.',
      emailNotConfirmed: 'Debes confirmar tu correo antes de entrar.',
      emailAlreadyInUse: 'Ese correo ya está registrado.',
      weakPassword: 'La contraseña es demasiado débil.',
      rateLimited: 'Demasiados intentos. Espera un momento.',
      network: 'Error de conexión. Revisa tu internet.',
      unknown: 'Algo salió mal. Inténtalo de nuevo.',
    },
  },
} as const;

/** Widen the literal `es` shape so other locales can supply their own strings. */
type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Dictionary = Widen<typeof es>;
