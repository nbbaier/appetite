# Recipe Import & Web Scraping Engine

**Category:** New Feature | Integration
**Quarter:** Q1
**T-shirt Size:** L

## Why This Matters

Users don't want to manually enter recipes—they have hundreds saved in bookmarks, Pinterest boards, and cooking websites. The ability to import recipes from any URL is a table-stakes feature for recipe apps in 2026. Without it, Appetite's recipe database remains limited to seeded data and whatever users laboriously type in.

This feature dramatically increases the recipe catalog while requiring zero manual effort from users. It also enables the AI assistant to work with the user's actual favorite recipes, making recommendations far more relevant.

## Current State

**What exists:**
- Recipe data model with all necessary fields (ingredients, instructions, times, difficulty, cuisine)
- Recipe storage in Supabase
- Recipe display components (RecipeCard, RecipeDetailModal)
- AI assistant that can discuss recipes
- Sample/seeded recipe data

**What's missing:**
- No way to import recipes from external URLs
- No recipe parsing/scraping capability
- No custom recipe creation interface
- No recipe editing capability
- No duplicate detection

## Proposed Future State

**The Recipe Import Engine will enable:**

1. **One-Click URL Import:**
   - Paste any recipe URL
   - Automatic extraction of: title, ingredients, instructions, prep/cook time, servings, images
   - Support for 100+ major recipe sites (AllRecipes, Food Network, NYT Cooking, etc.)
   - Graceful fallback for unsupported sites using AI parsing

2. **AI-Powered Recipe Parsing:**
   - For sites without structured data (schema.org/Recipe)
   - OpenAI extracts recipe components from raw HTML
   - Handles variations in recipe formats

3. **Custom Recipe Creation:**
   - Full WYSIWYG recipe editor
   - Ingredient autocomplete from pantry
   - Step-by-step instruction builder
   - Image upload support
   - Nutritional information estimation

4. **Recipe Management:**
   - Edit imported recipes
   - Merge duplicate recipes
   - Categorize and tag recipes
   - Recipe scaling (2x, 0.5x servings)
   - Print-friendly formatting

5. **Bulk Import:**
   - Import from recipe management exports (Paprika, CopyMeThat)
   - Pinterest board import
   - Browser bookmark import

## Key Deliverables

- [ ] Build recipe URL parser using schema.org/Recipe structured data
- [ ] Create AI fallback parser for unstructured recipe pages
- [ ] Implement Supabase Edge Function for URL fetching and parsing
- [ ] Design and build custom recipe creation form
- [ ] Add image upload to Supabase Storage
- [ ] Implement recipe editing interface
- [ ] Build duplicate detection (title similarity, ingredient matching)
- [ ] Create recipe scaling calculator
- [ ] Add ingredient unit normalization (standardize measurements)
- [ ] Implement bulk import for common formats (Paprika XML, JSON)
- [ ] Create browser extension for one-click import
- [ ] Add recipe source attribution and linking
- [ ] Build import history and status tracking
- [ ] Create recipe merge interface for duplicates
- [ ] Add print-friendly recipe view

## Prerequisites

- None strictly required, but **Initiative 01 (Testing)** should be progressing in parallel
- Image storage requires Supabase Storage bucket configuration

## Risks & Open Questions

- **Risk:** Recipe sites actively block scraping—may need to use third-party parsing APIs (e.g., Spoonacular, Edamam)
- **Risk:** Copyright/legal concerns with storing full recipe text—may need to store only structured data and link to source
- **Question:** Should we use a third-party recipe API vs. building our own parser?
- **Question:** How to handle recipes in languages other than English?
- **Risk:** AI parsing costs could be significant for heavy importers—need rate limiting or tiered access
- **Question:** Should imported recipes be private by default? (Privacy + copyright concerns)

## Notes

**Technical approach options:**

1. **Schema.org parsing (preferred for supported sites):**
   - Many recipe sites embed JSON-LD with schema.org/Recipe
   - Reliable, structured, free
   - Limited to compliant sites

2. **Third-party API (Spoonacular/Edamam):**
   - Handles scraping complexity
   - Has costs per request
   - May have rate limits

3. **AI parsing (fallback):**
   - Use OpenAI to extract from HTML
   - Expensive but flexible
   - Good for edge cases

**Browser extension consideration:**
- Could build Chrome/Firefox extension for seamless import
- Extension could send URL to Supabase function
- Adds development/maintenance complexity

**Files to modify:**
- `src/lib/database.ts` - Add recipeService.createFromUrl()
- `supabase/functions/` - New parse-recipe function
- `src/pages/Recipes.tsx` - Add import button/modal
- `src/components/recipes/` - New RecipeEditor, ImportModal components

**Reference projects:**
- Paprika's import format for bulk import compatibility
- RecipeFilter browser extension for UX patterns
