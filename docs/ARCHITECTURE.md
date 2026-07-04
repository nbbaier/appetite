# Appetite - Architecture Documentation

**Version:** 1.0
**Last Updated:** November 2025
**Tech Stack:** React 19, TypeScript, Vite, Supabase, TailwindCSS

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Authentication & Security](#authentication--security)
- [Database Schema](#database-schema)
- [API Integration](#api-integration)
- [Performance Optimizations](#performance-optimizations)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Design Decisions](#design-decisions)

## Overview

Appetite is a smart recipe and pantry management application that helps users:
- Track pantry inventory with expiration monitoring
- Discover recipes based on available ingredients
- Generate smart shopping lists
- Reduce food waste through AI-powered suggestions
- Manage leftovers efficiently

### Core Features

1. **Pantry Management**
   - Add/edit/delete ingredients
   - Expiration date tracking
   - Low stock alerts
   - Category organization
   - Natural language input (AI-powered)

2. **Recipe Discovery**
   - Recipe matching based on pantry ingredients
   - Detailed recipe instructions
   - Difficulty levels and cook times
   - Cuisine type filtering

3. **Shopping Lists**
   - Create and manage multiple shopping lists
   - Add ingredients from recipes
   - Track purchased items
   - Category-based organization

4. **AI Assistant**
   - Natural language interaction
   - Recipe suggestions
   - Ingredient parsing
   - Cooking tips and substitutions

5. **Leftovers Tracking**
   - Track leftover food items
   - Link to source recipes
   - Expiration management

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              React Application (SPA)                 │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │ Pantry │  │ Recipe │  │Shopping│  │   AI   │    │   │
│  │  │  Pages │  │  Pages │  │  Pages │  │ Pages  │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  │         │           │           │           │        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │          Context Providers                   │   │   │
│  │  │  Auth │ Pantry │ Recipe │ Settings │ Notif  │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │         │           │           │           │        │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │          Database Services Layer             │   │   │
│  │  │   (src/lib/database.ts + validation)         │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└──────────────────────┬─────────────────────────────────────┘
                       │
                       │ Supabase Client
                       │ (REST + Realtime)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Supabase)                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │   PostgreSQL   │  │  Supabase Auth │  │  Edge Funcs  │  │
│  │    Database    │  │   (Sessions)   │  │   (AI API)   │  │
│  └────────────────┘  └────────────────┘  └──────────────┘  │
│         │                    │                    │         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Row Level Security (RLS) Policies               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App (Router)
├── AuthProvider
│   ├── SettingsProvider
│   │   ├── PantryProvider
│   │   │   ├── RecipeProvider
│   │   │   │   └── NotificationProvider
│   │   │   │       └── Routes
│   │   │   │           ├── /dashboard
│   │   │   │           ├── /pantry
│   │   │   │           ├── /recipes
│   │   │   │           ├── /shopping
│   │   │   │           ├── /assistant
│   │   │   │           ├── /leftovers
│   │   │   │           └── /settings
```

## Technology Stack

### Frontend Core

- **React 19.1.1** - UI library with latest features
- **TypeScript 5.9.2** - Type safety and developer experience
- **Vite 7.1.5** - Build tool and dev server
- **React Router 7.8.2** - Client-side routing

### Styling

- **TailwindCSS 4.1.13** - Utility-first CSS framework
- **shadcn/ui** - Reusable component library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### State Management

- **React Context API** - Global state management
- **Custom Hooks** - Encapsulated stateful logic
- **Zustand** (planned) - Lightweight state management

### Backend & Database

- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Realtime subscriptions

### Validation & Forms

- **Zod 4.1.5** - Schema validation
- **React Hook Form 7.62.0** - Form management
- **@hookform/resolvers** - Zod + RHF integration

### Testing

- **Vitest 3.2.4** - Test runner
- **React Testing Library 16.3.0** - Component testing
- **@testing-library/user-event** - User interaction simulation
- **jsdom** - DOM implementation for tests

### Development Tools

- **Biome 2.2.3** - Linter and formatter
- **Husky 9.1.7** - Git hooks
- **lint-staged 15.2.11** - Pre-commit linting
- **rollup-plugin-visualizer** - Bundle analysis
- **web-vitals 4.2.4** - Performance monitoring

## Directory Structure

```
appetite/
├── .github/                    # GitHub configuration
│   └── dependabot.yml         # Automated dependency updates
├── .husky/                    # Git hooks
│   └── pre-commit            # Pre-commit quality checks
├── public/                    # Static assets
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   ├── auth/            # Authentication components
│   │   ├── pantry/          # Pantry-specific components
│   │   ├── recipes/         # Recipe components
│   │   ├── shopping/        # Shopping list components
│   │   ├── ai/              # AI assistant components
│   │   ├── alerts/          # Notification/alert components
│   │   ├── leftovers/       # Leftover management
│   │   ├── categories/      # Category selection
│   │   └── layout/          # Layout components (Header, Layout)
│   ├── contexts/            # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── PantryContext.tsx        # Pantry inventory state
│   │   ├── RecipeContext.tsx        # Recipe state
│   │   ├── SettingsContext.tsx      # User preferences
│   │   ├── NotificationContext.tsx  # Toast notifications
│   │   └── ChatContext.tsx          # AI chat state
│   ├── hooks/               # Custom React hooks
│   │   └── useIngredientHistory.ts  # Ingredient history
│   ├── lib/                 # Utility libraries
│   │   ├── database.ts      # Database service layer
│   │   ├── supabase.ts      # Supabase client setup
│   │   ├── api.ts           # External API calls
│   │   ├── errorUtils.ts    # Error handling utilities
│   │   ├── notificationService.ts  # Notification helpers
│   │   ├── utils.ts         # General utilities
│   │   └── validation/      # Zod schemas and validation
│   │       ├── schemas.ts   # Data model schemas
│   │       ├── utils.ts     # Validation utilities
│   │       └── index.ts     # Barrel exports
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx    # Dashboard overview
│   │   ├── Pantry.tsx       # Pantry management
│   │   ├── Recipes.tsx      # Recipe browsing
│   │   ├── Shopping.tsx     # Shopping lists
│   │   ├── Assistant.tsx    # AI assistant chat
│   │   ├── Leftovers.tsx    # Leftover tracking
│   │   ├── Settings.tsx     # User settings
│   │   ├── Signin.tsx       # Sign in page
│   │   ├── Signup.tsx       # Sign up page
│   │   └── LandingPage.tsx  # Public landing page
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   ├── App.tsx              # Root component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── supabase/
│   ├── functions/           # Edge Functions (serverless)
│   │   ├── categorize-ingredient/  # AI ingredient categorization
│   │   ├── parse-ingredients/      # Natural language parsing
│   │   └── chat/                   # AI chat completions
│   └── migrations/          # Database migrations
├── biome.json               # Biome configuration
├── vite.config.ts           # Vite configuration
├── vitest.config.ts         # Vitest configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies and scripts
```

## Data Flow

### 1. Authentication Flow

```
User → AuthForm → AuthContext.signIn()
    ↓
Supabase.auth.signInWithPassword()
    ↓
Session Created → AuthContext.setUser()
    ↓
ProtectedRoute allows access → Dashboard
```

### 2. Pantry Management Flow

```
User adds ingredient → PantryContext.addIngredient()
    ↓
Validate with Zod (ingredientInsertSchema)
    ↓
ingredientService.create()
    ↓
Supabase INSERT with RLS check
    ↓
Re-validate output with Zod (ingredientSchema)
    ↓
Update local state → UI re-renders
```

### 3. Recipe Matching Flow

```
User navigates to Recipes → RecipeContext.fetchMatchingRecipes()
    ↓
Get user's pantry ingredients → PantryContext.ingredients
    ↓
Call Supabase function: match_recipes_with_ingredients()
    ↓
PostgreSQL calculates match percentage
    ↓
Return sorted results → Display in RecipeList
```

### 4. AI Assistant Flow

```
User sends message → ChatContext.sendMessage()
    ↓
Supabase Edge Function: /chat
    ↓
External AI API (OpenAI/Anthropic)
    ↓
Stream response → Update UI incrementally
    ↓
Parse suggestions/recipes → Display in chat
```

## State Management

### Context Architecture

Each context manages a specific domain:

#### AuthContext
- **Responsibilities:** User session, authentication state
- **Key State:** `user`, `isSupabaseConnected`, `loading`
- **Methods:** `signIn()`, `signUp()`, `signOut()`

#### PantryContext
- **Responsibilities:** Ingredient inventory management
- **Key State:** `ingredients`, `loading`, `error`
- **Methods:** `addIngredient()`, `updateIngredient()`, `deleteIngredient()`, `refreshIngredients()`
- **Dependencies:** AuthContext (for user ID)

#### RecipeContext
- **Responsibilities:** Recipe data and matching
- **Key State:** `recipes`, `matchingRecipes`, `selectedRecipe`
- **Methods:** `fetchRecipes()`, `fetchMatchingRecipes()`, `selectRecipe()`
- **Dependencies:** PantryContext (for ingredient matching)

#### SettingsContext
- **Responsibilities:** User preferences and settings
- **Key State:** `preferences`, `profile`
- **Methods:** `updatePreferences()`, `updateProfile()`
- **Dependencies:** AuthContext

#### NotificationContext
- **Responsibilities:** Toast notifications
- **Key State:** `notifications[]`
- **Methods:** `notify()`, `dismissNotification()`
- **Note:** Uses Sonner for UI

#### ChatContext
- **Responsibilities:** AI assistant conversations
- **Key State:** `conversations`, `messages`, `currentConversation`
- **Methods:** `sendMessage()`, `createConversation()`, `loadConversation()`

### Performance Considerations

**Current Approach:**
- Context API for all global state
- Re-renders can be excessive with deep nesting

**Optimizations Implemented:**
- React.memo on expensive components (91 occurrences)
- useMemo for computed values
- useCallback for event handlers
- Virtual scrolling with react-window

**Future Improvements:**
- Consider React Query for server state
- Split large contexts into smaller ones
- Implement Zustand for non-server state

## Authentication & Security

### Authentication Strategy

**Provider:** Supabase Auth
**Method:** Email + Password (JWT-based)

**Flow:**
1. User enters credentials
2. Supabase validates and creates session
3. JWT token stored in localStorage (Supabase SDK handles)
4. Token included in all API requests
5. Session auto-refreshes before expiration

### Security Measures

#### 1. Row Level Security (RLS)

All database tables have RLS policies:

```sql
-- Example: Ingredients table
CREATE POLICY "Users can read own ingredients"
  ON ingredients FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ingredients"
  ON ingredients FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

#### 2. Input Validation

**Client-side (Zod):**
- All user inputs validated before submission
- Comprehensive schemas for all data models
- Runtime type checking

**Server-side:**
- Database constraints
- RLS policies
- Edge function validation

#### 3. Environment Variables

- Validated at startup with Zod
- Fails explicitly if missing in production
- Mock client only in test mode

#### 4. HTTPS Only

- Enforced by Supabase
- CSP headers recommended (TODO)

## Database Schema

### Core Tables

#### users (Supabase Auth)
- Managed by Supabase
- Extended with user_profiles table

#### user_profiles
```sql
- id (uuid, PK)
- user_id (uuid, FK to auth.users)
- full_name (text)
- bio (text)
- avatar_color (text)
- avatar_url (text)
- onboarding_completed (boolean)
```

#### user_preferences
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- dietary_restrictions (text[])
- allergies (text[])
- preferred_cuisines (text[])
- cooking_skill_level (enum)
- measurement_units (enum)
- family_size (integer)
- kitchen_equipment (text[])
- notification_enabled (boolean)
- expiration_threshold_days (integer)
```

#### ingredients
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- quantity (numeric)
- unit (text)
- category (text)
- expiration_date (date)
- notes (text)
- low_stock_threshold (numeric)
- created_at (timestamp)
- updated_at (timestamp)
```

#### recipes
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- title (text)
- description (text)
- image_url (text)
- prep_time (integer)
- cook_time (integer)
- servings (integer)
- difficulty (enum: Easy, Medium, Hard)
- cuisine_type (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### recipe_ingredients
```sql
- id (uuid, PK)
- recipe_id (uuid, FK)
- ingredient_name (text)
- quantity (numeric)
- unit (text)
- notes (text)
```

#### recipe_instructions
```sql
- id (uuid, PK)
- recipe_id (uuid, FK)
- step_number (integer)
- instruction (text)
```

#### shopping_lists
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### shopping_list_items
```sql
- id (uuid, PK)
- shopping_list_id (uuid, FK)
- name (text)
- quantity (numeric)
- unit (text)
- category (text)
- is_purchased (boolean)
- notes (text)
- recipe_id (uuid, FK, optional)
```

#### leftovers
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- quantity (numeric)
- unit (text)
- expiration_date (date)
- source_recipe_id (uuid, FK, optional)
- notes (text)
```

#### conversations
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- title (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

#### chat_messages
```sql
- id (uuid, PK)
- conversation_id (uuid, FK)
- sender (enum: user, ai)
- content (text)
- timestamp (timestamp)
- suggestions (text[], nullable)
- recipes (jsonb, nullable)
```

### Indexes

Performance indexes on:
- `user_id` columns (all tables)
- `expiration_date` (ingredients, leftovers)
- `recipe_id` (recipe_ingredients, recipe_instructions)
- `conversation_id` (chat_messages)

### Triggers

- `updated_at` triggers on all tables with timestamps

## API Integration

### Supabase Edge Functions

#### 1. categorize-ingredient
**Purpose:** AI-powered ingredient categorization
**Method:** POST
**Input:** `{ name: string }`
**Output:** `{ category: string }`

#### 2. parse-ingredients
**Purpose:** Natural language ingredient parsing
**Method:** POST
**Input:** `{ text: string }`
**Output:** `{ ingredients: Array<{name, quantity, unit, category}> }`

#### 3. chat
**Purpose:** AI assistant conversations
**Method:** POST
**Input:** `{ message: string, conversationId: uuid, pantryContext: object }`
**Output:** SSE stream of AI responses

### Error Handling

**Strategy:**
- All errors logged to console
- User-friendly messages displayed
- Retry logic for transient failures
- Fallback to offline mode (TODO)

**Error Types:**
- Network errors → Retry with exponential backoff
- Auth errors → Redirect to sign in
- Validation errors → Display inline
- Server errors → Generic error message

## Performance Optimizations

### Implemented

1. **Code Splitting**
   - Lazy loading for all route components
   - React.lazy + Suspense

2. **Memoization**
   - 91 uses of React.memo/useMemo/useCallback
   - Prevents unnecessary re-renders

3. **Virtual Scrolling**
   - react-window for RecipeList and ShoppingListItems
   - Handles thousands of items efficiently

4. **Database Indexes**
   - Optimized queries on common patterns
   - User ID and date fields indexed

5. **Debouncing**
   - Search inputs debounced
   - Autocomplete with lodash.debounce

6. **Bundle Optimization**
   - Tree-shaking with Vite
   - Dynamic imports for routes
   - Analyzer available (`npm run build:analyze`)

### Monitoring

**Web Vitals** tracked in production:
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- INP (Interaction to Next Paint)
- LCP (Largest Contentful Paint)
- TTFB (Time to First Byte)

### Future Optimizations

- Implement service worker for offline support
- Add React Query for server state caching
- Optimize images with lazy loading
- Implement request deduplication

## Testing Strategy

### Unit Tests
- **Tool:** Vitest
- **Coverage:** Utility functions, hooks, contexts
- **Target:** >80% coverage

### Component Tests
- **Tool:** React Testing Library
- **Coverage:** User interactions, rendering
- **Approach:** Test behavior, not implementation

### Integration Tests
- **Tool:** Vitest + MSW (planned)
- **Coverage:** Context interactions, API calls
- **Mocks:** Supabase client, external APIs

### E2E Tests (Planned)
- **Tool:** Playwright
- **Coverage:** Critical user flows
- **Flows:** Sign up, add ingredient, create shopping list, AI chat

## Deployment

### Build Process

```bash
# Development
npm run dev              # Vite dev server

# Production
npm run build            # TypeScript compile + Vite build
npm run preview          # Preview production build

# Analysis
npm run build:analyze    # Bundle size analysis
```

### Environment Variables

**Required:**
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `MODE` - Environment mode (development, production, test)

### Hosting

**Recommended Platforms:**
- Vercel (recommended for Vite apps)
- Netlify
- GitHub Pages (static)
- Supabase Hosting (planned)

### CI/CD (Planned)

1. Run tests (`npm test`)
2. Run linting (`npm run lint`)
3. Build (`npm run build`)
4. Deploy to hosting platform

## Design Decisions

### Why React Context over Redux/Zustand?

**Chosen:** React Context API
**Reason:**
- Built-in, no extra dependencies
- Simple state requirements
- Good for medium-complexity apps
- Easy to understand for contributors

**Trade-offs:**
- Can cause unnecessary re-renders
- No built-in devtools
- Might migrate to React Query + Zustand for better performance

### Why Supabase over Custom Backend?

**Chosen:** Supabase
**Reason:**
- Faster development (BaaS)
- Built-in auth and RLS
- PostgreSQL (relational, robust)
- Realtime subscriptions
- Edge functions for serverless logic

**Trade-offs:**
- Vendor lock-in
- Less control over infrastructure
- Limited by Supabase capabilities

### Why Biome over ESLint + Prettier?

**Chosen:** Biome
**Reason:**
- Single tool for linting + formatting
- Significantly faster than ESLint
- Zero config needed
- TypeScript-first

**Trade-offs:**
- Newer tool, smaller ecosystem
- Fewer plugins than ESLint
- Still evolving

### Why Vite over Create React App?

**Chosen:** Vite
**Reason:**
- Much faster dev server (HMR)
- Better build performance
- Native ES modules
- Modern tooling
- CRA is deprecated

**Trade-offs:**
- Slightly different config
- Some legacy plugins not compatible

### Why Zod for Validation?

**Chosen:** Zod
**Reason:**
- TypeScript-first
- Runtime and compile-time validation
- Excellent type inference
- Integration with React Hook Form
- Clear error messages

**Trade-offs:**
- Adds bundle size
- Learning curve for complex schemas

## Future Considerations

### Planned Improvements

1. **State Management**
   - React Query for server state
   - Zustand for client state
   - Reduce Context API usage

2. **Offline Support**
   - Service worker implementation
   - IndexedDB for local storage
   - Sync when online

3. **Performance**
   - Image optimization
   - Request deduplication
   - Better caching strategies

4. **Testing**
   - E2E tests with Playwright
   - Visual regression tests
   - Performance benchmarks

5. **Features**
   - Mobile app (React Native)
   - Barcode scanning
   - Meal planning calendar
   - Social features (recipe sharing)

6. **Infrastructure**
   - CI/CD pipeline
   - Automated deployments
   - Monitoring and alerting
   - Error tracking (Sentry)

## References

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [Zod Documentation](https://zod.dev)

---

**Maintained by:** nbbaier
**Last Updated:** November 2025
