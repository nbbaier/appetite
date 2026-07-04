# Appetite 2026 Strategic Roadmap

> Transforming Appetite from a pantry management tool into the definitive AI-powered kitchen platform.

## Executive Summary

This roadmap outlines 11 initiatives (10 prioritized + 1 moonshot) to transform Appetite over the next four quarters. The vision is ambitious: evolve from a useful recipe/pantry app into a comprehensive, AI-driven platform that manages the entire food lifecycle—from meal planning to grocery delivery to nutrition tracking.

The current Appetite codebase is well-architected (React 19, TypeScript, Supabase, OpenAI) with solid fundamentals, but has gaps in testing infrastructure, documentation, and feature completeness. This roadmap addresses foundational issues first, then builds transformative features on top.

**Key themes:**
1. **Foundation First** — Testing, CI/CD, and code quality before new features
2. **AI Everywhere** — Leverage OpenAI for meal planning, recognition, and personalization
3. **Close the Loop** — Connect planning → shopping → delivery → consumption → nutrition
4. **Build Community** — Transform single-player tool into social cooking platform
5. **Meet Users Where They Are** — PWA, voice assistants, smart displays

## High-Level Themes

### Q1: Foundation & Core Features
- Establish testing infrastructure and CI/CD pipeline
- Begin AI-powered meal planning calendar
- Add recipe import from URLs

### Q2: Offline & Integration
- Progressive Web App with offline support
- Start grocery delivery integrations

### Q3: Intelligence & Recognition
- Complete grocery delivery integrations
- Barcode and photo recognition for ingredient input
- Nutrition tracking and health goals

### Q4: Growth & Expansion
- Social and community features
- Internationalization (multi-language)
- Smart home and voice integration

---

## Initiative Overview

| # | Initiative | Category | Quarter | Size | Impact |
|---|-----------|----------|---------|------|--------|
| **00** | [Autonomous Kitchen Platform](./00-moonshot.md) | Moonshot | Beyond | 🚀 | North Star |
| **01** | [Test Coverage & CI/CD](./01-test-coverage-and-ci-cd.md) | Testing | Q1 | XL | Foundation |
| **02** | [AI Meal Planning Calendar](./02-ai-meal-planning-calendar.md) | New Feature | Q1-Q2 | XL | High |
| **03** | [Recipe Import Engine](./03-recipe-import-engine.md) | New Feature | Q1 | L | High |
| **04** | [Progressive Web App](./04-progressive-web-app.md) | Architecture | Q2 | L | Medium-High |
| **05** | [Grocery Delivery Integration](./05-grocery-delivery-integrations.md) | Integration | Q2-Q3 | L | High |
| **06** | [Barcode & Photo Recognition](./06-barcode-photo-recognition.md) | New Feature | Q3 | L | Medium-High |
| **07** | [Nutrition Tracking](./07-nutrition-tracking-health-goals.md) | New Feature | Q3 | XL | High |
| **08** | [Social & Community](./08-social-community-features.md) | Growth | Q3-Q4 | XL | High (Long-term) |
| **09** | [Internationalization](./09-internationalization.md) | Scalability | Q4 | M | Medium |
| **10** | [Smart Home & Voice](./10-smart-home-voice-integration.md) | Integration | Q4 | L | Medium |

### Size Legend
- **S** — 1-2 weeks, single developer
- **M** — 2-4 weeks, single developer
- **L** — 1-2 months, small team
- **XL** — 2-4 months, multiple developers

---

## Dependency Graph

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                         Q1                               │
                    └─────────────────────────────────────────────────────────┘
                                            │
              ┌─────────────────────────────┼─────────────────────────────┐
              │                             │                             │
              ▼                             ▼                             ▼
     ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
     │ 01. Testing &   │         │ 02. AI Meal     │         │ 03. Recipe      │
     │     CI/CD       │────────▶│     Planning    │         │     Import      │
     │  (Foundation)   │         │     Calendar    │         │     Engine      │
     └─────────────────┘         └─────────────────┘         └─────────────────┘
              │                             │                             │
              │                             │                             │
              ▼                             ▼                             ▼
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                                  Q2                                      │
     └─────────────────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
     ┌─────────────────┐         ┌─────────────────┐
     │ 04. Progressive │         │ 05. Grocery     │
     │     Web App     │────────▶│     Delivery    │
     │    (Offline)    │         │   Integrations  │
     └─────────────────┘         └─────────────────┘
              │                             │
              │                             │
              ▼                             ▼
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                                  Q3                                      │
     └─────────────────────────────────────────────────────────────────────────┘
              │                             │                             │
              ▼                             ▼                             ▼
     ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
     │ 06. Barcode &   │         │ 07. Nutrition   │         │ 08. Social &    │
     │     Photo       │────────▶│     Tracking    │         │     Community   │
     │  Recognition    │         │  & Health Goals │         │     Features    │
     └─────────────────┘         └─────────────────┘         └─────────────────┘
                                            │                             │
                                            │                             │
                                            ▼                             ▼
     ┌─────────────────────────────────────────────────────────────────────────┐
     │                                  Q4                                      │
     └─────────────────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
     ┌─────────────────┐         ┌─────────────────┐
     │ 09. i18n &      │         │ 10. Smart Home  │
     │  Localization   │         │   & Voice       │
     └─────────────────┘         └─────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  00. MOONSHOT   │
                    │   Autonomous    │
                    │Kitchen Platform │
                    └─────────────────┘
```

### Critical Dependencies

| Initiative | Depends On | Notes |
|------------|-----------|-------|
| 02. Meal Planning | 01. Testing | CI/CD should be in place before major feature work |
| 04. PWA | 01. Testing | PWA behavior is complex to test |
| 05. Grocery Delivery | 02. Meal Planning | Most valuable with meal plan shopping lists |
| 05. Grocery Delivery | 04. PWA | Push notifications for delivery status |
| 06. Barcode/Photo | 04. PWA | Camera access, offline barcode cache |
| 07. Nutrition | 02. Meal Planning | Nutrition tracking tied to planned meals |
| 07. Nutrition | 06. Barcode | Barcode lookup includes nutrition data |
| 08. Social | 03. Recipe Import | Users need recipes to share |
| 08. Social | 04. PWA | Push notifications for social interactions |
| 10. Voice | 04. PWA | Smart display web views |
| 10. Voice | 07. Nutrition | Voice queries for nutrition data |

---

## Resource Estimates

### Q1 (Initiatives 01, 02, 03)
- **Engineers:** 3-4 FTE
- **Focus:** Foundation + Core Features
- **Key Deliverables:**
  - 80%+ test coverage
  - CI/CD pipeline live
  - Meal planning calendar MVP
  - Recipe URL import working

### Q2 (Initiatives 04, 05 start)
- **Engineers:** 2-3 FTE
- **Focus:** Offline + Integration Groundwork
- **Key Deliverables:**
  - PWA installable with offline support
  - First grocery delivery integration (Instacart)

### Q3 (Initiatives 05 complete, 06, 07, 08 start)
- **Engineers:** 4-5 FTE
- **Focus:** Intelligence Layer
- **Key Deliverables:**
  - Multiple grocery delivery integrations
  - Barcode scanning live
  - Basic nutrition tracking
  - Social features MVP

### Q4 (Initiatives 08 complete, 09, 10)
- **Engineers:** 3-4 FTE
- **Focus:** Scale + Platform
- **Key Deliverables:**
  - Full community features
  - 5+ language support
  - Alexa/Google skills live

---

## Success Metrics

### Foundation (Q1)
- [ ] Test coverage ≥80% on critical paths
- [ ] CI/CD running on every PR
- [ ] Zero manual deployment steps

### User Engagement (Q2-Q3)
- [ ] 50% of active users use meal planning
- [ ] 30% of shopping lists sent to delivery service
- [ ] Average 5+ ingredients added per barcode scan session

### Growth (Q3-Q4)
- [ ] 20% of recipes are user-created or imported
- [ ] 10% of users follow at least one other user
- [ ] 25% DAU on PWA/installed app

### Platform (Q4+)
- [ ] 3+ supported languages
- [ ] 1000+ weekly voice assistant interactions
- [ ] 15% international user base

---

## Current State Assessment

### Strengths to Build On
- **Modern tech stack** — React 19, TypeScript, Vite, Supabase
- **AI integration** — OpenAI GPT-4.1 already powering features
- **Clean architecture** — Well-organized contexts, services, components
- **Security** — RLS, validation, authentication in place
- **Performance** — Code splitting, memoization, virtual scrolling

### Gaps to Address
- **Testing** — 29% coverage, no page tests, no CI/CD
- **Documentation** — Minimal README, missing JSDoc
- **Error handling** — Console statements in production, silent failures
- **Type safety** — @ts-expect-error suppressions to resolve

### Technical Debt (Address in Q1)
- Remove 20+ console.log/console.error statements
- Resolve @ts-expect-error in AuthContext
- Add missing error handling in SettingsContext
- Validate userPreferencesService.getPreferences return data
- Remove deprecated mergeValidationResults function

---

## How to Use This Roadmap

1. **For Planning:** Reference the dependency graph when sequencing work
2. **For Scoping:** Each initiative file contains detailed deliverables
3. **For Estimation:** Use t-shirt sizes as starting points for sprint planning
4. **For Discussion:** Risks & Open Questions sections surface decisions needed
5. **For Implementation:** Notes sections contain technical guidance

---

## Files in This Directory

```
2026-roadmap/
├── README.md                          # This file - overview and summary
├── 00-moonshot.md                     # Autonomous Kitchen Platform (dream big!)
├── 01-test-coverage-and-ci-cd.md      # Foundation: Testing & CI/CD
├── 02-ai-meal-planning-calendar.md    # AI-powered meal planning
├── 03-recipe-import-engine.md         # Recipe import from URLs
├── 04-progressive-web-app.md          # PWA & offline support
├── 05-grocery-delivery-integrations.md # Grocery delivery integration
├── 06-barcode-photo-recognition.md    # Barcode & photo ingredient input
├── 07-nutrition-tracking-health-goals.md # Nutrition tracking
├── 08-social-community-features.md    # Social & community
├── 09-internationalization.md         # Multi-language support
└── 10-smart-home-voice-integration.md # Voice assistants & smart home
```

---

*This roadmap was generated based on comprehensive analysis of the Appetite codebase, identifying current capabilities, pain points, and unrealized potential. It assumes unlimited resources and aims for transformative rather than incremental improvements.*
