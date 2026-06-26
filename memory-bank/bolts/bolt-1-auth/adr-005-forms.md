# ADR-005 — Forms & validation: react-hook-form + zod

- **Status:** Accepted (Bolt 1)
- **Context:** Five auth forms (sign in/up, forgot, reset, + verify) need field state, validation, and error display. The web used react-hook-form + zod; the Bolt 1 model defined pure validators returning i18n message-keys.
- **Decision:** **react-hook-form** + **zod** via `@hookform/resolvers`. zod schemas (`signUpSchema`, `signInSchema`, `forgotSchema`, `resetPasswordSchema`) are the canonical, pure, testable validators; messages are i18n message-keys resolved in the component with `t()`.
- **Alternatives:** plain controlled state + the model's validator functions (rejected — more manual wiring across 5 forms); Formik + yup (rejected — heavier, diverges from the web stack).
- **Consequences:** Parity with web validation rules; declarative resolver; the schemas double as the unit-test surface. Adds 3 pure-JS deps (no native rebuild). Validation logic lives in `src/auth/validation.ts`, decoupled from screens.
