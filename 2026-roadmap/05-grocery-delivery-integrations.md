# Smart Grocery Delivery Integrations

**Category:** Integration | New Feature
**Quarter:** Q2-Q3
**T-shirt Size:** L

## Why This Matters

The gap between "I know what I need" and "I have it in my kitchen" is where Appetite loses users. Shopping lists are helpful, but the friction of manually adding items to a grocery delivery cart is significant. Direct integration with Instacart, Amazon Fresh, Walmart+, and other delivery services closes this loop.

This transforms Appetite from a planning tool into an end-to-end kitchen management system. Users generate a meal plan, see their shopping list, and with one click, order everything for delivery. This is the kind of "magic moment" that drives retention and word-of-mouth.

## Current State

**What exists:**
- Comprehensive shopping list management
- Items with quantities, units, and categories
- Recipe-to-shopping-list integration
- Purchase tracking (mark as bought)

**What's missing:**
- No external grocery service integration
- No price information
- No store availability data
- No one-click ordering
- No delivery scheduling

## Proposed Future State

**The Grocery Integration will enable:**

1. **Multi-Service Support:**
   - Instacart (widest retailer coverage)
   - Amazon Fresh
   - Walmart+ Grocery
   - Kroger
   - Target (Shipt)
   - Regional services based on user location

2. **One-Click Cart Population:**
   - Send shopping list to chosen service
   - Automatic product matching
   - Handle substitutions for unavailable items
   - Maintain quantity and unit accuracy

3. **Price Comparison:**
   - Show estimated prices across services
   - Highlight best deals
   - Track price history
   - Budget tracking for groceries

4. **Smart Recommendations:**
   - Suggest store based on availability and price
   - Highlight items on sale
   - Recommend bulk purchases for frequent items
   - Optimal delivery timing suggestions

5. **Post-Order Sync:**
   - Automatically add delivered items to pantry
   - Update quantities based on actual purchase
   - Handle substitutions gracefully

## Key Deliverables

- [ ] Research and select integration approach (official APIs vs. deep linking)
- [ ] Implement Instacart integration (largest coverage)
- [ ] Implement Amazon Fresh integration
- [ ] Implement Walmart+ integration
- [ ] Build product matching algorithm (shopping list item → specific product)
- [ ] Create service selection UI with store coverage
- [ ] Implement price fetching and comparison (where APIs allow)
- [ ] Build "Send to Cart" flow with confirmation
- [ ] Add store preference settings per user
- [ ] Create post-delivery pantry sync
- [ ] Implement fallback for unsupported items (show search link)
- [ ] Add budget tracking for grocery spending
- [ ] Create price alert system for watched items
- [ ] Build regional service detection
- [ ] Add OAuth flows for services requiring authentication

## Prerequisites

- **Initiative 02 (Meal Planning):** Most valuable when combined with meal plan shopping lists
- **Initiative 04 (PWA):** For push notifications about delivery status
- API partnerships or third-party integration layer (see notes)

## Risks & Open Questions

- **Risk:** Official APIs are limited—Instacart's partner API requires business relationship; Amazon's is restricted
- **Risk:** Services may break integration or change terms—need abstraction layer
- **Question:** Should we use a third-party aggregator (like Whisk's Shop API) vs. direct integrations?
- **Question:** How to handle the "product matching" problem? (User says "chicken breast" → which specific SKU?)
- **Risk:** Privacy concerns with sharing shopping data with third parties
- **Question:** What's the business model? Affiliate fees, partnerships, or free feature?
- **Risk:** Liability if wrong product is ordered (allergies, dietary restrictions)

## Notes

**Integration approaches:**

1. **Official APIs (Preferred but limited):**
   - Instacart: Partner API requires application and approval
   - Amazon: Product Advertising API for search, limited cart integration
   - Walmart: Affiliate API available
   - Pros: Stable, supported
   - Cons: May require business relationships, limited functionality

2. **Third-Party Aggregators:**
   - Whisk Shop API (Samsung) - aggregates multiple services
   - Chicory - recipe-to-cart technology
   - Pros: Single integration, multiple services
   - Cons: Another vendor dependency, costs

3. **Deep Linking:**
   - Generate URLs that pre-fill searches in delivery apps
   - Pros: Works without API partnership
   - Cons: No cart pre-population, manual user effort

4. **Browser Extension Approach:**
   - Extension that runs on grocery site and adds items
   - Pros: Works with any site
   - Cons: User must install extension, maintenance burden

**Recommended approach:**
- Start with deep linking for immediate value
- Apply for Instacart partner API
- Evaluate Whisk Shop API as aggregation layer
- Build product matching using AI (ingredient → product search terms)

**Product matching challenge:**
```
User: "2 chicken breasts"
Need to match to:
- "Perdue Boneless Skinless Chicken Breast, 1 lb" (Instacart)
- "365 Organic Chicken Breast" (Amazon Fresh)
- "Great Value Chicken Breast" (Walmart)

Solution: AI-powered matching with user preference learning
```

**Files to create:**
- `src/lib/groceryIntegration/` - Integration layer
- `src/lib/groceryIntegration/instacart.ts`
- `src/lib/groceryIntegration/amazon.ts`
- `src/lib/groceryIntegration/walmart.ts`
- `src/lib/productMatching.ts` - Item to product matching
- `src/components/shopping/GroceryServiceSelector.tsx`
- `src/components/shopping/SendToCartModal.tsx`
- `supabase/functions/match-products/` - AI product matching
