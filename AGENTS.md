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
- See `.cursor/rules/` for pattern-specific rules (Component, Database, etc).
- See `.github/copilot-instructions.md` for detailed workflow and architecture.
