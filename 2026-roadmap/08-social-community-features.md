# Social & Community Features

**Category:** New Feature | Growth
**Quarter:** Q3-Q4
**T-shirt Size:** XL

## Why This Matters

Cooking is inherently social—people share recipes, cook for others, and bond over food. Yet Appetite is currently a single-player experience. Adding social features transforms users into a community, creating network effects that drive growth and retention.

Social features are the difference between a tool and a platform. When users can share recipes, follow inspiring cooks, and participate in challenges, Appetite becomes sticky in a way that pure utility cannot achieve. This is the growth engine for 2026 and beyond.

## Current State

**What exists:**
- User authentication system
- User profiles (name, bio, avatar)
- Recipe data model with user_id
- Bookmarking system for recipes

**What's missing:**
- No way to share recipes with others
- No public profiles
- No following/followers system
- No recipe ratings or reviews
- No community feed
- No collaborative features
- No recipe collections/cookbooks

## Proposed Future State

**The Social Platform will enable:**

1. **Public Profiles:**
   - Shareable profile URLs
   - Recipe portfolios (published recipes)
   - Cooking stats (meals logged, recipes tried)
   - Follower/following counts
   - Bio and dietary preferences display

2. **Recipe Sharing:**
   - Publish recipes to community
   - Private, friends-only, or public visibility
   - Recipe collections/cookbooks
   - Share via link, social media, embed

3. **Social Discovery:**
   - Following system for cooks
   - Community recipe feed
   - Trending recipes
   - "Cooks like you" recommendations
   - Search by cook, cuisine, dietary restriction

4. **Engagement Features:**
   - Recipe ratings (1-5 stars)
   - Written reviews with photos
   - "I made this" with modifications
   - Tips and variations
   - Recipe questions and answers

5. **Collaborative Cooking:**
   - Shared household pantries
   - Family meal planning
   - Collaborative shopping lists
   - Shared recipe collections
   - Guest access for meal planning

6. **Community Challenges:**
   - Weekly cooking challenges
   - Seasonal themes
   - Zero-waste challenges
   - Cuisine exploration (try 5 Thai recipes)
   - Leaderboards and badges

## Key Deliverables

- [ ] Design public profile schema and privacy controls
- [ ] Implement following/followers system
- [ ] Create recipe publishing flow with visibility options
- [ ] Build community recipe feed with algorithms
- [ ] Implement rating and review system
- [ ] Create recipe collections/cookbooks feature
- [ ] Build "I made this" with photo upload
- [ ] Implement social sharing (Twitter, Facebook, Pinterest, email)
- [ ] Create embeddable recipe cards
- [ ] Build household/family group system
- [ ] Implement shared pantry for households
- [ ] Create collaborative shopping lists
- [ ] Design and implement challenge system
- [ ] Build notification system for social interactions
- [ ] Create moderation tools for community content
- [ ] Implement reporting and blocking features
- [ ] Add privacy controls (who can see my activity)

## Prerequisites

- **Initiative 03 (Recipe Import):** Users need recipes to share
- **Initiative 01 (Testing):** Social features require extensive testing for edge cases
- **Initiative 04 (PWA):** Push notifications for social interactions
- Content moderation strategy and tooling

## Risks & Open Questions

- **Risk:** Community moderation is complex and ongoing—need clear policies and tools
- **Risk:** Privacy concerns—users may not want their eating habits public
- **Question:** How to handle recipe copyright when sharing? (Attribution, licensing)
- **Question:** Should there be verified cooks/influencers? (Trust, quality signal)
- **Risk:** Spam, fake accounts, malicious content—need prevention and response plan
- **Question:** What's the monetization strategy? (Free tier, premium features, ads)
- **Risk:** Building social features correctly is hard—may need dedicated product/design resources
- **Question:** How to bootstrap community? (Chicken-and-egg problem)

## Notes

**Database schema additions:**

```sql
-- User relationships
CREATE TABLE follows (
  follower_id UUID REFERENCES users(id),
  following_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Recipe visibility
ALTER TABLE recipes ADD COLUMN visibility VARCHAR(20) DEFAULT 'private';
-- 'private', 'friends', 'public'

-- Reviews
CREATE TABLE recipe_reviews (
  id UUID PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  content TEXT,
  photos TEXT[], -- Array of URLs
  created_at TIMESTAMP DEFAULT NOW()
);

-- Collections
CREATE TABLE collections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100),
  description TEXT,
  visibility VARCHAR(20) DEFAULT 'private',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Households
CREATE TABLE households (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE household_members (
  household_id UUID REFERENCES households(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(20) DEFAULT 'member', -- 'owner', 'admin', 'member'
  PRIMARY KEY (household_id, user_id)
);
```

**Feed algorithm considerations:**
- Chronological by default (simpler, transparent)
- Option for algorithmic (engagement-based)
- Balance: following, trending, personalized
- Don't create echo chambers

**Moderation approach:**
- Automated: profanity filter, spam detection
- User reports with review queue
- Trust levels based on account age/behavior
- Clear community guidelines
- Appeals process

**Privacy-first design:**
- Private by default
- Granular controls (who sees what)
- Easy export of data
- Delete account fully removes content

**Files to create:**
- `src/contexts/SocialContext.tsx`
- `src/pages/Profile.tsx` - Public profile page
- `src/pages/Community.tsx` - Community feed
- `src/components/social/` - All social UI components
- `src/lib/social.ts` - Social service layer
- `supabase/functions/feed/` - Feed generation
- New database migrations for social tables
