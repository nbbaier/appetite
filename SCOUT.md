# Project Scout Report

## Overview
**Appetite** (formerly SmartRecipe) is a React/TypeScript web application designed to reduce food waste through intelligent pantry management and recipe discovery. It features AI integration (GPT-4 via Supabase Edge Functions) for a cooking assistant and smart ingredient processing.

## Technical Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Radix UI, shadcn/ui.
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions).
- **State Management**: React Context API.
- **Testing**: Vitest, React Testing Library.
- **Linting/Formatting**: Biome.

## Project Status
The project is well-advanced with most core features implemented (Phases 1-9 complete).
- **Current Focus**: **Phase 10 - Intelligent Leftover Tracking**.
- **Recent Activity**: "Advanced Ingredient Management" was the last completed major phase. Leftover tracking seems partially implemented (database table exists, basic components exist).

## Key Architecture
- **Supabase Integration**: The app relies heavily on Supabase for backend services. Database access is centralized in `src/lib/database.ts`. RLS (Row Level Security) is enforced.
- **AI Integration**: OpenAI is integrated via Supabase Edge Functions for chat and ingredient parsing.
- **Component Library**: Uses a custom set of components built on Radix UI primitives, located in `src/components/ui`.

## Directory Map
- `src/components/`: Feature-based component organization (pantry, recipes, ai, leftovers).
- `src/pages/`: Route-level components.
- `src/lib/`: Core logic, database clients, and utility functions.
- `supabase/migrations/`: Database schema history.
- `.taskmaster/`: Project management and documentation (PRD, Tasks).

## Getting Started
1.  **Install**: `npm install`
2.  **Dev Server**: `npm run dev` (starts at http://localhost:5173)
3.  **Test**: `npm run test`
4.  **Check**: `npm run check` (lint/format)

## Next Steps (Immediate)
- Review the "Intelligent Leftover Tracking" feature. The database table `leftovers` exists (migration `20250629204231`), and basic UI components are present, but functionality may need polish or completion as per `PLAN.md`.
- `PLAN.md` indicates Phase 10 is "Not Started", but the codebase shows evidence of implementation. This discrepancy should be resolved.
