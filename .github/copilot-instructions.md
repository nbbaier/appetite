# Appetite - GitHub Copilot Instructions

**ALWAYS follow these instructions first.** Only search for additional context or run exploratory commands if the information here is incomplete or found to be incorrect.

## Project Overview
Appetite is an AI-powered pantry and recipe management React application built with TypeScript, Vite, and Supabase. It helps users manage their pantry, discover recipes, create shopping lists, and reduce food waste.

## Development Environment Setup

### Prerequisites & Installation
Always start fresh development work with these steps:

```bash
# Verify Node.js is available (requires v18+)
node --version  # Should show v20.19.4 or higher
npm --version   # Should show v10.8.2 or higher

# Install all dependencies
npm install     # Takes ~20-30 seconds to complete
```

**NEVER CANCEL the npm install** - it may take up to 30 seconds on slower networks.

### Build & Development Commands

#### Core Development Workflow
```bash
# Start development server
npm run dev     # Starts immediately, runs on http://localhost:5173/

# Build for production  
npm run build   # Takes ~4-5 seconds, NEVER CANCEL - wait for completion

# Preview production build
npm run preview # Starts immediately, runs on http://localhost:4173/
```

#### Code Quality & Testing
```bash
# Run all tests
npm run test           # Takes ~8-10 seconds, NEVER CANCEL - wait for completion
npm run test:watch     # Interactive test mode
npm run test:coverage  # Generate coverage report

# Linting and formatting (use these before committing)
npm run lint          # Fast lint check (~1 second)
npm run lint:fix      # Auto-fix linting issues
npm run format        # Auto-format code (~1 second, may fix 20+ files)
npm run check         # Run all quality checks
npm run check:fix     # Auto-fix all quality issues
```

**CRITICAL: Always run `npm run format` and `npm run lint` before committing changes.**

### Time Expectations
- **npm install**: 20-30 seconds - NEVER CANCEL
- **npm run build**: 4-5 seconds - NEVER CANCEL  
- **npm run test**: 8-10 seconds - NEVER CANCEL
- **npm run lint**: <1 second
- **npm run format**: <1 second

## Application Architecture

### Core Technologies
- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite (very fast development)
- **Styling**: Tailwind CSS + Radix UI components
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Testing**: Vitest + React Testing Library
- **Code Quality**: Biome (linting + formatting)

### Project Structure
```
src/
├── components/          # UI components organized by feature
│   ├── ai/             # AI chat components
│   ├── alerts/         # Notification components  
│   ├── auth/           # Authentication forms
│   ├── categories/     # Category selection components
│   ├── layout/         # App layout and navigation
│   ├── leftovers/      # Leftover management
│   ├── pantry/         # Pantry item management
│   ├── recipes/        # Recipe display and management
│   ├── settings/       # User settings
│   ├── shopping/       # Shopping list components
│   └── ui/            # Reusable UI primitives
├── contexts/           # React Context providers
├── hooks/             # Custom React hooks
├── lib/              # Utility functions and services
├── pages/            # Main application pages
└── types/            # TypeScript type definitions
```

### Key Files to Know
- `src/lib/supabase.ts` - Database client (with graceful fallback)
- `src/lib/database.ts` - All database operations
- `src/contexts/` - State management for auth, pantry, recipes, etc.
- `src/pages/` - Main application routes
- `biome.json` - Code formatting and linting configuration
- `vite.config.ts` - Build configuration
- `vitest.config.ts` - Test configuration

## Environment Configuration

### Required Environment Variables
Create a `.env` file in the project root:
```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Demo Mode (No Supabase)
The application works without Supabase configuration by showing:
- Landing page with feature overview
- Demo signup/signin forms with helpful setup messages
- Graceful error handling for missing database operations

**This means you can develop UI features without requiring Supabase setup.**

## Testing & Validation

### Running Tests
```bash
# Run all tests (expect some failures - these are existing issues)
npm run test  # Takes ~8-10 seconds, shows test failures but completes

# Interactive testing during development
npm run test:watch
```

### Manual UI Testing
After making changes, always:

1. **Start the dev server**: `npm run dev`
2. **Open browser**: Navigate to http://localhost:5173/
3. **Test landing page**: Verify landing page loads correctly
4. **Test navigation**: Click "Get Started" → should show signup form
5. **Test signup flow**: Form should show "Setup Required" message
6. **Test responsive design**: Resize browser to test mobile layout

### Code Quality Validation
Always run before committing:
```bash
npm run format    # Auto-format all code
npm run lint      # Check for linting issues
npm run build     # Ensure production build works
```

## Supabase Database (Optional)

### Local Development
The application includes Supabase configuration but works without it. To set up local Supabase:

**Note**: Supabase CLI requires Docker and internet access, which may not be available in all environments.

```bash
# Supabase local development (if Docker is available)
# Install Supabase CLI via your system package manager
# Then: supabase start  # Takes 2-3 minutes to start all services
```

### Database Schema
The app manages these main entities:
- **Ingredients**: User's pantry items with expiration tracking
- **Recipes**: Recipe data with ingredients and instructions
- **Leftovers**: Leftover food tracking
- **Shopping Lists**: Generated shopping lists
- **User Preferences**: Settings and preferences

All database operations are in `src/lib/database.ts` with full TypeScript typing.

## Common Development Tasks

### Adding New Features
1. **Check existing patterns**: Look in `src/components/` for similar functionality
2. **Use existing contexts**: Import needed contexts from `src/contexts/`
3. **Follow naming conventions**: Use PascalCase for components, camelCase for functions
4. **Add tests**: Create `.test.tsx` files alongside components
5. **Run validation**: `npm run format && npm run lint && npm run build`

### Working with Components
- **UI Components**: Use Radix UI primitives from `src/components/ui/`
- **Icons**: Use Lucide React icons (already imported)
- **Styling**: Use Tailwind CSS classes
- **Forms**: Use React Hook Form with Zod validation (see existing forms)

### Working with State
- **Authentication**: Use `useAuth()` hook
- **Pantry Data**: Use `usePantry()` hook  
- **Recipes**: Use `useRecipe()` hook
- **Settings**: Use `useSettings()` hook
- **Notifications**: Use `useNotification()` hook

### Database Operations
All database calls are centralized in `src/lib/database.ts`:
- Import services: `import { ingredientService, recipeService } from "../lib/database"`
- All services return Promises and include error handling
- Services gracefully handle mock/offline mode

## Troubleshooting

### Build Issues
- **"Build failed"**: Run `npm run format` first, then `npm run build`
- **TypeScript errors**: Check `tsconfig.json` and type definitions in `src/types/`
- **Import errors**: Verify file paths and exports

### Test Issues  
- **Tests failing**: Some test failures are expected (existing issues)
- **"React is not defined"**: Known issue in some test files, not blocking
- **Provider errors**: Tests may need provider wrappers (see existing test patterns)

### Runtime Issues
- **Supabase errors**: Expected when environment variables not set (app still functions)
- **Network errors**: Google Fonts may be blocked (not critical)
- **Console warnings**: React Router warnings are expected (not critical)

## Important Notes

### What Works Without Supabase
- Landing page and marketing content
- UI components and navigation
- Form validation and interactions
- Responsive design and styling
- Build and development processes

### What Requires Supabase
- User authentication and registration
- Pantry data persistence
- Recipe data and AI features
- Real-time updates
- User preferences storage

### File Organization
- **NEVER edit** files in `dist/` (build output)
- **NEVER edit** files in `node_modules/` (dependencies)
- **Components** should be in appropriate `src/components/` subdirectories
- **Tests** should be co-located with the files they test (`.test.tsx`)
- **Types** should be defined in `src/types/` or co-located with components

### Task Master Integration
This project uses Task Master AI for project management:
- Task definitions in `.taskmaster/tasks/tasks.json`
- Use existing task management patterns when adding features
- Reference CLAUDE.md and AGENTS.md for AI development workflows

**Always validate your changes by running the complete build and test cycle, then manually testing the UI functionality.**