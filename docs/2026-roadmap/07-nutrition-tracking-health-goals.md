# Nutrition Tracking & Health Goals

**Category:** New Feature | Integration
**Quarter:** Q3
**T-shirt Size:** XL

## Why This Matters

Food is fundamentally about health, yet Appetite currently treats recipes as collections of ingredients without nutritional context. Users increasingly want to understand the health impact of their eating—calories for weight management, macros for fitness, nutrients for wellness.

Adding nutrition tracking transforms Appetite from a recipe/pantry app into a holistic food wellness platform. It creates a natural integration point with fitness ecosystems (Apple Health, Google Fit, MyFitnessPal) and positions Appetite as a health-conscious choice.

## Current State

**What exists:**
- Recipe data model (no nutritional fields)
- Ingredient inventory
- User preferences (dietary restrictions, allergies)
- AI assistant for cooking advice

**What's missing:**
- No nutritional data on recipes or ingredients
- No calorie/macro tracking
- No health goal setting
- No integration with fitness/health apps
- No nutritional analysis of meal plans

## Proposed Future State

**The Nutrition System will provide:**

1. **Nutritional Data Integration:**
   - Automatic nutrition lookup for ingredients (USDA database)
   - Recipe nutrition calculated from ingredients
   - Per-serving breakdowns
   - Display: calories, protein, carbs, fat, fiber, sodium, vitamins

2. **Health Goal Setting:**
   - Daily calorie targets
   - Macro ratio goals (e.g., 40/30/30)
   - Specific nutrient goals (protein, fiber, etc.)
   - Goal presets (weight loss, muscle gain, maintenance)
   - Custom goal creation

3. **Food Logging:**
   - Log meals eaten (from recipes or quick-add)
   - Portion size tracking
   - Daily/weekly nutrition summaries
   - Visual progress toward goals
   - Historical trends and insights

4. **Meal Plan Nutrition:**
   - Nutritional overview of planned meals
   - Weekly balance visualization
   - Alerts for nutritional gaps
   - AI suggestions to balance macros

5. **Health App Sync:**
   - Apple Health integration (HealthKit)
   - Google Fit integration
   - MyFitnessPal import/export
   - Fitbit, Garmin connectivity
   - Bidirectional sync (log in Appetite, appears in health app)

## Key Deliverables

- [ ] Integrate USDA FoodData Central API for ingredient nutrition
- [ ] Create nutrition data model and database schema
- [ ] Build nutrition calculation engine for recipes
- [ ] Design and implement goal-setting interface
- [ ] Create food logging UI (meal diary)
- [ ] Build daily/weekly nutrition dashboard
- [ ] Implement progress visualization (charts, trends)
- [ ] Add nutritional analysis to meal planning calendar
- [ ] Create AI prompts for nutritionally-balanced suggestions
- [ ] Implement Apple Health integration (HealthKit)
- [ ] Implement Google Fit integration
- [ ] Build MyFitnessPal import/export
- [ ] Add per-ingredient nutrition display in pantry
- [ ] Create nutrition-aware recipe search filters
- [ ] Build portion estimation with photo (advanced)
- [ ] Add micronutrient tracking (vitamins, minerals)

## Prerequisites

- **Initiative 02 (Meal Planning):** Nutrition tracking most valuable with meal planning
- **Initiative 06 (Barcode Scanning):** Barcode lookup can include nutrition data
- Nutritional database access (USDA is free)
- Mobile app or deep PWA for HealthKit access (may require native wrapper)

## Risks & Open Questions

- **Risk:** Nutritional data accuracy varies widely—USDA data is good but not perfect for all ingredients
- **Risk:** Apple HealthKit requires native iOS app—PWA cannot access; may need React Native wrapper
- **Question:** How detailed should tracking be? (Just calories vs. full micro/macro breakdown)
- **Question:** Should this be opt-in or default? (Some users may not want diet tracking)
- **Risk:** Creating unhealthy relationships with food—need to design mindfully, avoid gamification that promotes restriction
- **Question:** How to handle homemade recipes with estimated ingredients? (Accuracy challenges)
- **Risk:** Scope creep into full nutrition app—stay focused on complementing cooking workflow

## Notes

**Nutritional data sources:**

1. **USDA FoodData Central** (Recommended base)
   - Free, public API
   - 300K+ foods
   - High-quality data
   - Foundation Foods, SR Legacy, Branded Foods

2. **Open Food Facts** (Supplement)
   - Packaged food nutrition from barcodes
   - Community-maintained
   - Good for branded products

3. **Nutritionix** (Premium option)
   - Commercial API
   - Restaurant foods, branded items
   - Natural language food logging

**Recipe nutrition calculation:**
```typescript
interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sodium: number;
  // ... vitamins, minerals
}

const calculateRecipeNutrition = (ingredients: Ingredient[]): NutritionInfo => {
  return ingredients.reduce((total, ing) => {
    const nutrition = lookupNutrition(ing.name, ing.quantity, ing.unit);
    return addNutrition(total, nutrition);
  }, emptyNutrition);
};
```

**Health app integration:**

| Platform | Access Method | Requirements |
|----------|---------------|--------------|
| Apple Health | HealthKit | Native iOS app (Capacitor/React Native) |
| Google Fit | REST API | OAuth, works from web |
| MyFitnessPal | API (partner) | Apply for API access |
| Fitbit | OAuth REST | Web app works |

**Design considerations:**
- Make nutrition info non-intrusive (expandable, not default view)
- Provide context ("this covers 30% of daily protein")
- Avoid judgment language ("good" vs. "bad" foods)
- Allow users to hide nutrition features entirely
- Consider eating disorder triggers—design responsibly

**Files to create:**
- `src/lib/nutritionDatabase.ts` - USDA API integration
- `src/lib/nutritionCalculator.ts` - Recipe calculation
- `src/components/nutrition/` - All nutrition UI components
- `src/contexts/NutritionContext.tsx` - Nutrition state
- `src/pages/Nutrition.tsx` - Nutrition dashboard
- `supabase/functions/nutrition-lookup/` - Server-side nutrition API
