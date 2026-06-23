# Lint Tech Debt — Suppressed Findings

This file tracks lint findings that were **suppressed** rather than fixed during
the Ultracite/Biome adoption, along with notes on what a real fix would involve.
Each suppression in the code carries an inline `biome-ignore … TODO` comment that
points back here.

## `noExcessiveCognitiveComplexity` (threshold: 20)

Eight functions exceed the cognitive-complexity threshold. These were suppressed
because a genuine fix means extracting helpers/subcomponents — real refactors with
behavior risk — not mechanical cleanup. Listed worst-first.

### 1. `supabase/functions/chat/index.ts` — request handler (score 87)
The `Deno.serve` handler does everything inline: CORS preflight, body parsing,
input validation, system-prompt construction, the OpenAI call, response parsing,
and error handling. Suppressed file-wide (`biome-ignore-all`) because the
`@ts-expect-error` on the `Deno.serve` line blocks a line-level suppression.

**Refactor:** split into focused helpers — `handleCors(req)`,
`parseAndValidateRequest(req)`, `buildMessages(payload)`, `callOpenAI(messages)`,
`toApiResponse(result)` — and keep the handler as a thin orchestrator. Highest
priority; this is the largest single function in the codebase.

### 2. `src/lib/notificationService.ts` — `processItems` (score 34)
Loops over items and branches on expiration window (expired/critical/warning) and
notification type to build messages.

**Refactor:** extract `classifyExpiration(item, today, crit, warn)` returning
`{ notificationType, daysLeft }`, and a `buildMessage(item, classification)`
helper. The loop body then becomes a few straight-line calls.

### 3. `src/components/ai/AIChat.tsx` — `generateAIResponse` (score 26)
Large async function mixing intent detection, data lookups, prompt building, and
response shaping.

**Refactor:** pull intent/branch logic into helper functions (e.g.
`detectIntent`, `buildContext`, `formatResponse`) so the top-level flow reads as a
sequence of steps.

### 4. `src/components/ai/AIChat.tsx` — delete-conversation `onClick` (score 27)
Inline async JSX handler combining a native `confirm`, deletion, list/state
updates, and try/catch. (Also carries a `noAlert` TODO — see below.)

**Refactor:** extract a named `handleDeleteConversation(conv)` method in the
component body; the confirm step is replaced when the modal migration lands.

### 5. `src/pages/Pantry.tsx` — `Pantry` component (score 24)
Large page component: data loading, filtering/sorting, many handlers, and several
modals all in one body.

**Refactor:** extract custom hooks (`usePantryData`, `usePantryFilters`) and
subcomponents (filter bar, ingredient grid, add/edit modals).

### 6. `src/pages/Pantry.tsx` — `sortedIngredients` comparator (score 21)
A multi-field sort comparator inside a `useMemo` branches per sort key/direction.

**Refactor:** define a `comparatorBySortKey` map (or one small comparator per key)
and select by the active key, applying direction once.

### 7. `src/pages/Recipes.tsx` — `Recipes` component (score 23)
Same shape as Pantry — a large page component.

**Refactor:** extract data/filter hooks and subcomponents (filters, recipe grid,
detail modal wiring).

### 8. `src/components/recipes/RecipeCard.tsx` — `RecipeCard` (score 23)
A card rendering many conditional sections (match %, badges, actions, image
overlay, can-cook state).

**Refactor:** extract presentational subcomponents (e.g. `RecipeCardBadges`,
`RecipeCardActions`, `RecipeCardImage`) to flatten the render.

## `noAlert` — native `confirm`/`prompt` (3 sites)

Suppressed with `biome-ignore` TODOs; these use blocking native dialogs by design
for now:

- `src/components/ai/AIChat.tsx` — rename conversation (`window.prompt`)
- `src/components/ai/AIChat.tsx` — delete conversation (`window.confirm`)
- `src/pages/Recipes.tsx` — delete recipe (`window.confirm`)

**Refactor:** replace with in-app modal dialogs. An `AlertDialog` primitive
already exists (`src/components/ui/alert-dialog.tsx`); rename additionally needs a
small input/prompt modal. Doing this also reduces the complexity of the
delete-conversation handler (#4 above).

## `useFilenamingConvention` — deferred file renames (project-wide)

Disabled in `biome.jsonc` rather than renamed. Ultracite's default wants
kebab-case filenames, but the tree uses `PascalCase.tsx` for components and
`camelCase.ts` for modules (~65 files), and renaming would churn every import
site at once.

**Decision to revisit:** either commit to a kebab-case rename (one mechanical
pass updating files + imports together) or keep the current convention
permanently and drop this from the debt list. Until then the rule stays off so it
doesn't mask other `style` findings.

## Deliberate (non-debt) suppressions

For completeness — these `biome.jsonc` opt-outs are intentional and **not**
expected to be revisited:

- `noBarrelFile` off — `lib/validation` is a deliberate module API surface.
- `noNamespaceImport` off for `src/components/ui/**` — vendored shadcn/Radix
  primitives use the documented `import * as X` pattern.
- Test-file relaxations (`useTopLevelRegex`, `useAwait`, `noNamespaceImport`) —
  throwaway regex assertions, `act(async () => {})`, and `vi.spyOn(Mod, …)`.
- `*.example.*` excluded from linting — comment-only illustrative files.
- `Deno` global declared for `supabase/functions/**` — Deno runtime, not browser.

## Notes

- Run `bun run check` to see the current lint state; suppressed items will not
  appear unless their `biome-ignore` comment is removed.
- When a function here is refactored under the threshold, delete its
  `biome-ignore` comment (Biome will flag it as an unused suppression otherwise)
  and remove the corresponding entry from this file.
