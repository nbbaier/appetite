# Agent Guidelines

## Commands
- **Build:** `npm run build`
- **Lint & Format:** `npm run check` (Run `npm run check:fix` to auto-fix issues)
- **Test (All):** `npm run test`
- **Test (Single):** `npm run test -- <path/to/file>` (e.g., `npm run test -- src/utils.test.ts`)

## Code Standards
- **Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, Supabase, Radix UI.
- **Linting:** Uses **Biome** (not ESLint). Strict adherence required. Always `check:fix` before committing.
- **Component Style:** Functional components with hooks. PascalCase naming.
- **State Management:** React Context (`src/contexts`). Avoid new global state unless necessary.
- **Database:** Access via `src/lib/database.ts` only. Use RLS policies.
- **Testing:** Vitest + RTL. Mock `AuthProvider` & `SettingsProvider` for component tests.
- **Type Safety:** Strict TypeScript. No `any`. Use schemas in `src/lib/validation`.

## References
- See `.cursor/rules/` for pattern-specific rules (Component, Database, etc).
- See `.github/copilot-instructions.md` for detailed workflow and architecture.
