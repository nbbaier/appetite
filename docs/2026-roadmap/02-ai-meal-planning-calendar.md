# AI-Powered Meal Planning Calendar

**Category:** New Feature | Architecture
**Quarter:** Q1-Q2
**T-shirt Size:** XL

## Why This Matters

The current Appetite experience is reactive—users look at what they have and find recipes. An AI-powered meal planning calendar transforms this into a proactive system that plans ahead, balances nutrition across the week, and generates optimized shopping lists.

This is the feature that turns Appetite from a "nice utility" into an "essential household tool." Meal planning is the #1 requested feature in competing apps, and integrating it with AI gives Appetite a significant competitive advantage. Combined with the existing pantry tracking and recipe matching, this creates a flywheel: better planning → less waste → happier users → more engagement.

## Current State

**What exists:**
- Pantry inventory with expiration tracking
- Recipe database with ingredient matching
- AI assistant that can suggest recipes conversationally
- Shopping list management
- User preferences (dietary restrictions, allergies, cooking skill, preferred cuisines)

**What's missing:**
- No calendar view for meal scheduling
- No multi-day planning interface
- No automated meal suggestion based on weekly nutrition goals
- No batch shopping list generation for planned meals
- No leftover integration into meal plans (e.g., "use Tuesday's chicken in Thursday's salad")

## Proposed Future State

**The Meal Planning Calendar will provide:**

1. **Weekly/Monthly Calendar View:**
   - Drag-and-drop meal scheduling
   - Visual calendar with breakfast/lunch/dinner slots
   - Family member support (different meals for different people)
   - Recurring meal patterns (Taco Tuesday, etc.)

2. **AI-Powered Plan Generation:**
   - "Generate my week" button that creates a full meal plan
   - Considers: expiring ingredients, dietary restrictions, nutritional balance, cooking skill, time constraints
   - Suggests variety (no recipe repeated within X days)
   - Accounts for planned leftovers

3. **Nutritional Balancing:**
   - Weekly calorie/macro targets
   - Visual indicators for nutritional coverage
   - Alerts for nutritional gaps
   - Integration with health goals (prerequisite: nutrition tracking)

4. **Smart Shopping List Integration:**
   - Generate shopping list for selected date range
   - Automatically subtracts pantry inventory
   - Batch similar ingredients across recipes
   - Categorize by store section

5. **Leftover Flow:**
   - Plan leftover usage as ingredients in future meals
   - "Cook once, eat twice" suggestions
   - Portion recommendations based on planned reuse

## Key Deliverables

- [ ] Design and implement calendar UI component (week/month views)
- [ ] Create meal slot data model and database schema
- [ ] Implement drag-and-drop meal scheduling
- [ ] Build AI prompt engineering for meal plan generation
- [ ] Create "Generate Week" AI endpoint (Supabase Edge Function)
- [ ] Implement nutritional analysis per day/week
- [ ] Build shopping list generation from meal plan
- [ ] Add family member support to user model
- [ ] Create recurring meal pattern system
- [ ] Build leftover planning integration
- [ ] Add meal prep time awareness (busy day = quick meals)
- [ ] Create "swap meal" AI suggestions
- [ ] Implement calendar sync (Google Calendar, iCal export)
- [ ] Add mobile-responsive calendar interface
- [ ] Create onboarding flow for meal planning setup

## Prerequisites

- **Initiative 01 (Testing):** Should have CI/CD pipeline in place before building major new feature
- **Database schema extensions:** Need new tables for meal_plans, meal_slots, family_members
- **Nutrition data:** Recipes need nutritional information (can be AI-estimated initially)

## Risks & Open Questions

- **Risk:** AI-generated meal plans may not account for user's actual schedule/preferences well initially—need feedback loop
- **Risk:** Calendar complexity may overwhelm users—need progressive disclosure UX
- **Question:** How detailed should nutritional tracking be? (Calories only vs. full macro/micronutrient breakdown)
- **Question:** Should meal plans be shareable? (Seeds social features)
- **Question:** How to handle family members with conflicting dietary restrictions?
- **Risk:** OpenAI API costs could increase significantly with multi-meal generation—need to optimize prompts and consider caching

## Notes

**Technical considerations:**
- Could leverage react-big-calendar or build custom with existing UI components
- AI prompt should include: current pantry, expiring items, user preferences, past meal history, nutritional targets
- Consider pre-generating meal suggestions in background for faster UX
- Calendar sync requires OAuth integration (Google Calendar API)

**User research needed:**
- How do users currently plan meals? (Paper, other apps, mental)
- What's the desired planning horizon? (1 week, 2 weeks, month)
- Do families plan together or does one person drive?

**Related files:**
- `src/contexts/RecipeContext.tsx` - Recipe matching logic to extend
- `src/lib/database.ts` - New services for meal plans
- `supabase/functions/chat/` - AI integration patterns
