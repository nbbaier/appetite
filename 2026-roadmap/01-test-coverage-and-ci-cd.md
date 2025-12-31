# Comprehensive Test Coverage & CI/CD Pipeline

**Category:** Testing | Technical Debt
**Quarter:** Q1
**T-shirt Size:** XL

## Why This Matters

This initiative is the foundation for everything else on the roadmap. With only 29% test coverage, zero page testing, and no CI/CD pipeline, the codebase is at significant risk of regressions as new features are added. The database service layer—the backbone of the application at 1,018 lines—has zero tests. The largest component (AIChat at 843 lines) is completely untested.

Without this foundation, every subsequent initiative carries compounding risk. A robust testing infrastructure enables confident refactoring, faster feature development, and safer deployments. This is the single highest-ROI investment for 2026.

## Current State

**Test Coverage:**
- 19 test files covering ~29% of source files
- 4/6 contexts tested (67%)
- 0/10 pages tested (0%)
- Database service layer: 0% coverage
- AIChat.tsx (843 lines): untested
- NaturalLanguagePantryInput.tsx (319 lines): untested
- All validation schemas (453 lines): untested

**CI/CD:**
- No GitHub Actions workflow for testing
- Only dependabot.yml exists
- Pre-commit hooks exist but bypass is possible
- No coverage thresholds enforced
- No automated quality gates

**Testing Infrastructure:**
- Vitest configured with jsdom
- React Testing Library available
- Coverage tool (@vitest/coverage-v8) configured but unused
- No E2E testing framework

## Proposed Future State

**By end of Q1, the codebase will have:**

1. **80%+ unit test coverage** on critical paths:
   - 100% coverage on database.ts service layer
   - 100% coverage on all context hooks
   - 100% coverage on validation schemas
   - Tests for all 10 pages with happy path coverage
   - Tests for AIChat and NLP components

2. **End-to-end testing with Playwright:**
   - Critical user journeys tested (add ingredient → find recipe → create shopping list)
   - Authentication flows tested
   - AI assistant conversation flow tested

3. **CI/CD pipeline with GitHub Actions:**
   - Tests run on every PR
   - Coverage reports published
   - Coverage thresholds enforced (fail PR if coverage drops)
   - Automatic deployment to staging on merge to develop
   - Production deployment on merge to main

4. **Quality gates:**
   - Minimum 80% coverage for new code
   - No PR merge without passing tests
   - Lint and type-check as required checks

## Key Deliverables

- [ ] Add unit tests for `database.ts` (all 13 service objects, ~50 tests)
- [ ] Add unit tests for validation schemas (`schemas.ts`, `utils.ts`)
- [ ] Add tests for untested contexts (NotificationContext, SettingsContext)
- [ ] Add page tests for all 10 pages (at minimum: rendering, basic interactions)
- [ ] Add comprehensive tests for AIChat.tsx
- [ ] Add tests for NaturalLanguagePantryInput.tsx
- [ ] Add tests for useIngredientHistory hook
- [ ] Set up Playwright for E2E testing
- [ ] Create 5+ critical path E2E tests
- [ ] Create GitHub Actions workflow for test runs
- [ ] Add coverage reporting to CI
- [ ] Set up coverage thresholds (80% minimum)
- [ ] Create staging deployment workflow
- [ ] Create production deployment workflow
- [ ] Add quality gate badges to README
- [ ] Document testing patterns and conventions

## Prerequisites

None. This is foundational and should be completed first.

## Risks & Open Questions

- **Risk:** Database tests require mocking Supabase responses correctly—current `@ts-expect-error` patterns in AuthContext tests suggest mock typing issues
- **Risk:** E2E tests may be flaky if dependent on external services (Supabase, OpenAI)—need to consider test doubles or recorded responses
- **Question:** Should we use a dedicated test Supabase project, or mock at the client level?
- **Question:** What's the acceptable CI run time? (Target: <5 minutes for unit tests, <15 minutes for full suite)
- **Risk:** Adding tests may reveal bugs—need buffer time for fixing discovered issues

## Notes

**Files requiring immediate attention:**
- `src/lib/database.ts` (1,018 lines, 0 tests)
- `src/components/ai/AIChat.tsx` (843 lines, 0 tests)
- `src/lib/validation/schemas.ts` (453 lines, 0 tests)
- `src/pages/*.tsx` (10 pages, 0 tests)

**Reference patterns:**
- `src/contexts/AuthContext.test.tsx` is a good example of comprehensive context testing
- `src/lib/notificationService.test.ts` shows good edge case coverage

**Pain points to address during this initiative:**
- Remove all `console.log`/`console.error` statements from production code (20+ instances found)
- Resolve `@ts-expect-error` suppressions in AuthContext (2 instances)
- Add proper error handling to SettingsContext (missing catch blocks)
