# Multi-Language & Internationalization

**Category:** Scalability | DX Improvement
**Quarter:** Q4
**T-shirt Size:** M

## Why This Matters

Food is universal, but Appetite is currently English-only. Internationalization (i18n) opens Appetite to billions of potential users worldwide. More than just translation, this includes adapting to regional cuisines, measurement systems, and food cultures.

As Appetite grows, international users will discover it. Without i18n infrastructure, every piece of text becomes a blocker. Building this foundation in Q4 sets up 2027 for global expansion.

## Current State

**What exists:**
- Hardcoded English strings throughout UI
- Imperial/Metric toggle in settings (partial localization)
- No i18n framework
- No translation files
- No RTL support

**What's missing:**
- No translation infrastructure
- No language selection
- No localized content (recipes, categories)
- No regional date/time formatting
- No currency localization
- No RTL layout support

## Proposed Future State

**The i18n System will provide:**

1. **Translation Infrastructure:**
   - All UI strings externalized
   - Translation file format (JSON or similar)
   - Language selection in settings
   - Browser language detection
   - Persistent language preference

2. **Supported Languages (Initial):**
   - English (default)
   - Spanish
   - French
   - German
   - Portuguese
   - Mandarin Chinese
   - Japanese

3. **Regional Adaptations:**
   - Measurement unit localization (metric/imperial by region)
   - Date format localization
   - Number formatting (decimal separators)
   - Currency for pricing features
   - Regional recipe suggestions

4. **RTL Support:**
   - Arabic layout support
   - Hebrew layout support
   - Mirrored UI components
   - RTL-aware CSS

5. **Content Localization:**
   - Ingredient names in local languages
   - Category translations
   - AI responses in user's language
   - Error messages localized
   - Email templates localized

## Key Deliverables

- [ ] Select and integrate i18n library (react-i18next recommended)
- [ ] Extract all UI strings to translation files
- [ ] Create English base translation file
- [ ] Implement language switcher in settings
- [ ] Add browser language detection
- [ ] Create translation workflow (how translators contribute)
- [ ] Translate UI to Spanish, French, German
- [ ] Implement date/time localization
- [ ] Implement number formatting localization
- [ ] Add RTL CSS support
- [ ] Create RTL-specific component variants
- [ ] Localize AI prompts for multi-language responses
- [ ] Translate error messages and notifications
- [ ] Create ingredient translation mapping
- [ ] Build translation management dashboard (optional)
- [ ] Set up CI check for missing translations

## Prerequisites

- **Initiative 01 (Testing):** Need tests to verify i18n doesn't break functionality
- **Initiative 03 (Recipe Import):** Imported recipes may be in various languages
- Translation resources (professional translators or community)

## Risks & Open Questions

- **Risk:** Machine translation quality varies—critical strings need human review
- **Risk:** Some languages expand text significantly (German ~30% longer)—UI must accommodate
- **Question:** How to handle user-generated content? (Recipes, reviews in different languages)
- **Question:** Should AI assistant converse in user's language? (Requires multi-language prompting)
- **Question:** How to prioritize languages? (User base analysis, market research)
- **Risk:** RTL support is complex—requires significant CSS refactoring
- **Question:** How to manage translations long-term? (Community, paid service, internal)

## Notes

**i18n library comparison:**

| Library | Pros | Cons |
|---------|------|------|
| react-i18next | Most popular, excellent React integration, namespace support | Larger bundle |
| react-intl | Good formatting, smaller | Less flexible |
| lingui | Small, compiled, good performance | Less ecosystem |
| next-intl | Great if using Next.js | Tied to Next.js |

**Recommended: react-i18next**
- Mature, well-documented
- Supports namespaces (organize by feature)
- Pluralization, interpolation
- Language detection
- Lazy loading of translation files

**Translation file structure:**
```
src/
  locales/
    en/
      common.json      # Shared strings
      pantry.json      # Pantry feature
      recipes.json     # Recipe feature
      shopping.json    # Shopping feature
    es/
      common.json
      pantry.json
      ...
    fr/
      ...
```

**Example translation file (en/pantry.json):**
```json
{
  "title": "My Pantry",
  "addIngredient": "Add Ingredient",
  "expiringAlert": "{{count}} items expiring soon",
  "categories": {
    "vegetables": "Vegetables",
    "fruits": "Fruits",
    "dairy": "Dairy"
  }
}
```

**RTL considerations:**
- Use CSS logical properties (`margin-inline-start` not `margin-left`)
- Use Tailwind RTL plugin or CSS direction switching
- Test all components in RTL mode
- Icons may need mirroring

**AI multi-language:**
```typescript
const systemPrompt = `You are a cooking assistant.
Respond in ${userLanguage}.
The user's ingredients: ${ingredients}`;
```

**Files to modify:**
- Every component with text (significant effort)
- `src/App.tsx` - i18n provider setup
- `src/lib/i18n.ts` - i18n configuration
- `src/locales/` - Translation files
- `tailwind.config.js` - RTL support
- `supabase/functions/chat/` - Multi-language AI

**Translation workflow options:**
1. **Professional translation:** Most accurate, expensive
2. **Community/crowdsourced:** Slower, variable quality
3. **Machine translation + review:** Fast start, needs human QA
4. **Localization platform:** (Crowdin, Lokalise) Manage at scale
