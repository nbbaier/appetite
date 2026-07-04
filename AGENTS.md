# Agent Guidelines

## Commands
- **Build:** `bun run build`
- **Lint:** `bun run check` (Run `bun run check:fix` to auto-fix issues, does not fix formatting)
- **Format:** `bun run format`
- **Test (All):** `bun run test`
- **Test (Single):** `bun run test -- <path/to/file>` (e.g., `bun run test -- src/utils.test.ts`)

## Project Code Standards
- **Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Supabase, Radix UI.
- **Component Style:** Functional components with hooks. PascalCase naming.
- **State Management:** React Context (`src/contexts`). Avoid new global state unless necessary.
- **Database:** Access via `src/lib/database.ts` only. Use RLS policies.
- **Testing:** Vitest + RTL. Mock `AuthProvider` & `SettingsProvider` for component tests.
- **Type Safety:** Strict TypeScript. No `any`. Use schemas in `src/lib/validation`.

## Naming Conventions
```typescript
components/          // kebab-case for directories
ComponentName.tsx     // PascalCase for component files
useHookName.ts        // camelCase for hooks/utility files

const userName = "John";           // camelCase for variables
function calculateTotal() {}       // camelCase for functions
const UserComponent = () => {};    // PascalCase for components

const MAX_RETRY_ATTEMPTS = 3;      // UPPER_SNAKE_CASE for constants/magic numbers

interface UserProfile {}           // PascalCase for interfaces
type ApiResponse<T> = {};          // PascalCase for types
```

Import order: external libraries → internal utilities/services (`src/lib`) → components → types (`import type`) → styles.

## Component Patterns
- Components live under `src/components/`, grouped by domain (`ui/`, `layout/`, `auth/`, feature folders).
- Accept a `className` prop and merge with `cn()`; spread remaining props to the root element. Prefer composition over inheritance.
- Pages follow: read auth/context state → fetch via a service function in an effect → render loading/error/data states.
- Forms use `react-hook-form` + a Zod schema via `zodResolver`; display validation errors inline.

```tsx
interface ComponentNameProps {
  className?: string;
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn("base-styles", className)} {...props}>
      {/* content */}
    </div>
  );
}
```

## Database & Service Layer
- All database access goes through service objects in `src/lib/database.ts` (e.g. `ingredientService`, `recipeService`, `bookmarkService`) — never call Supabase directly from components.
- Every table has RLS enabled. User-owned data is scoped with `auth.uid() = user_id`; shared/reference data (e.g. recipes) is public-read.
- Validate input with a Zod schema before writing to the database.
- Select specific columns instead of `*`, filter/order in the query rather than in JS, and add indexes for columns used in `WHERE`/`ORDER BY` (see `supabase/migrations/`).

## Linting & Formatting (Ultracite)

This project uses **Ultracite**, a zero-config preset over **Biome** (not ESLint) that enforces strict code quality through automated formatting and linting. Run `bun run fix` before committing. Most issues are auto-fixable.

Write code that is **accessible, performant, type-safe, and maintainable**. Favor clarity and explicit intent over brevity.

### Type Safety & Explicitness
- Use explicit types for function parameters and return values when they enhance clarity.
- Prefer `unknown` over `any` when the type is genuinely unknown.
- Use const assertions (`as const`) for immutable values and literal types.
- Leverage type narrowing instead of type assertions.
- Extract magic numbers into descriptively named constants.

### Modern JavaScript/TypeScript
- Use arrow functions for callbacks and short functions.
- Prefer `for...of` over `.forEach()` and indexed `for` loops.
- Use optional chaining (`?.`) and nullish coalescing (`??`).
- Prefer template literals over string concatenation.
- Use destructuring for object and array assignments.
- Use `const` by default, `let` only when reassignment is needed, never `var`.

### Async & Promises
- Always `await` promises in async functions and use the return value.
- Prefer `async/await` over promise chains.
- Handle errors with `try-catch` blocks.
- Don't use async functions as Promise executors.

### React & JSX
- Use function components; in React 19+ pass `ref` as a prop instead of `React.forwardRef`.
- Call hooks at the top level only, never conditionally.
- Specify all dependencies in hook dependency arrays correctly.
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices).
- Nest children between opening and closing tags instead of passing as props.
- Don't define components inside other components.
- Use semantic HTML and ARIA for accessibility:
  - Provide meaningful alt text for images.
  - Use proper heading hierarchy.
  - Add labels for form inputs.
  - Include keyboard event handlers alongside mouse events.
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles.

### Error Handling & Debugging
- Remove `console.log`, `debugger`, and `alert` from production code.
- Throw `Error` objects with descriptive messages, not strings.
- Don't catch errors just to rethrow them.
- Prefer early returns over nested conditionals for error cases.

### Code Organization
- Keep functions focused and under reasonable cognitive complexity limits.
- Extract complex conditions into well-named boolean variables.
- Use early returns to reduce nesting.
- Prefer simple conditionals over nested ternary operators.
- Group related code together and separate concerns.

### Security
- Add `rel="noopener"` when using `target="_blank"` on links.
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary.
- Don't use `eval()` or assign directly to `document.cookie`.
- Validate and sanitize user input.

### Performance
- Avoid spread syntax in accumulators within loops.
- Use top-level regex literals instead of creating them in loops.
- Prefer specific imports over namespace imports.
- Avoid barrel files (index files that re-export everything).

### Testing
- Write assertions inside `it()` or `test()` blocks.
- Use async/await instead of done callbacks in async tests.
- Don't commit `.only` or `.skip`.
- Keep test suites reasonably flat — avoid excessive `describe` nesting.

### What Biome Can't Check
Focus your own attention on: business logic correctness, meaningful naming, architecture decisions, edge cases, user experience (accessibility, performance), and documenting complex logic.

## References
- See `.github/copilot-instructions.md` for detailed workflow and architecture.
- See `docs/ARCHITECTURE.md` for system design and decisions.

## Agent skills

### Issue tracker

Issues live in GitHub Issues (nbbaier/appetite), via the `gh` CLI. External PRs are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
