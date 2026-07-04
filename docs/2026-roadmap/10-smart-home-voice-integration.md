# Smart Home & Voice Integration

**Category:** Integration | New Feature
**Quarter:** Q4
**T-shirt Size:** L

## Why This Matters

The kitchen is increasingly connected—smart displays, voice assistants, and smart appliances are becoming standard. Users want to check their pantry while cooking with messy hands, add items via voice while unloading groceries, and see recipes on their smart display.

This initiative positions Appetite at the center of the connected kitchen ecosystem. It's about meeting users in their natural cooking flow, not requiring them to pick up their phone or open a laptop.

## Current State

**What exists:**
- Well-structured API layer (database.ts services)
- AI assistant for conversational cooking help
- Mobile-responsive design
- PWA capability (with Initiative 04)

**What's missing:**
- No voice command interface
- No smart display optimization
- No Alexa/Google Home skills
- No smart appliance integration
- No hands-free operation mode

## Proposed Future State

**The Smart Home Integration will enable:**

1. **Voice Assistants:**
   - Amazon Alexa skill for Appetite
   - Google Assistant action
   - Apple Siri Shortcuts
   - Voice commands: "Add milk to my pantry", "What's expiring soon?", "Start my shopping list"

2. **Smart Display Support:**
   - Optimized views for Echo Show, Nest Hub, smart fridges
   - Touch-friendly recipe display
   - Large text, high contrast for kitchen visibility
   - Step-by-step cooking mode with voice navigation

3. **Hands-Free Mode:**
   - In-app voice commands (no external assistant needed)
   - "Hey Appetite" wake word (or button activation)
   - Voice-navigable recipe steps
   - Voice timer control

4. **Smart Appliance Integration:**
   - Smart oven pre-heat from recipe
   - Instant Pot integration
   - Smart scale for portion measuring
   - Smart fridge inventory sync

5. **Kitchen Display Mode:**
   - Dedicated full-screen recipe view
   - Always-on display compatibility
   - Ambient mode with meal plan preview
   - Timer integration with display

## Key Deliverables

- [ ] Design Alexa skill architecture
- [ ] Implement Alexa skill with core intents (pantry, recipes, shopping)
- [ ] Deploy Alexa skill to Amazon
- [ ] Design Google Assistant action
- [ ] Implement Google Assistant action
- [ ] Deploy to Google Actions Console
- [ ] Create Siri Shortcuts for common actions
- [ ] Build smart display-optimized views
- [ ] Implement in-app voice command recognition (Web Speech API)
- [ ] Create hands-free recipe navigation mode
- [ ] Design and build kitchen display mode
- [ ] Research and implement smart oven integration (if APIs available)
- [ ] Create OAuth flow for voice assistant linking
- [ ] Build account linking for Alexa/Google
- [ ] Test across multiple device types
- [ ] Create voice UX guidelines and documentation

## Prerequisites

- **Initiative 01 (Testing):** Voice interactions are hard to test—need solid infrastructure
- **Initiative 04 (PWA):** For smart display web views
- **Initiative 07 (Nutrition):** Voice queries for "how many calories in my lunch?"
- Amazon Developer Account, Google Actions Console access

## Risks & Open Questions

- **Risk:** Voice assistant certification processes can be lengthy (weeks to months)
- **Risk:** Voice UX is fundamentally different from visual—requires significant design work
- **Question:** Which voice platform to prioritize? (Alexa has more kitchen presence, Google has better NLU)
- **Question:** How to handle authentication? (Voice linking is clunky)
- **Risk:** Smart appliance APIs are fragmented and proprietary—may require per-manufacturer work
- **Question:** Is smart fridge integration realistic? (Limited APIs, nascent market)
- **Risk:** Voice recognition accuracy in noisy kitchen environment
- **Question:** What's the ongoing maintenance burden for multiple voice platforms?

## Notes

**Voice assistant architecture:**

```
User Voice → Alexa/Google → Intent Recognition →
  → Lambda/Cloud Function → Appetite API →
  → Response Generation → Voice Response
```

**Alexa skill intents:**

```json
{
  "intents": [
    {
      "name": "AddIngredientIntent",
      "samples": [
        "add {ingredient} to my pantry",
        "I bought {ingredient}",
        "put {ingredient} in the fridge"
      ]
    },
    {
      "name": "CheckExpiringIntent",
      "samples": [
        "what's expiring soon",
        "what should I use up",
        "any food going bad"
      ]
    },
    {
      "name": "GetRecipeIntent",
      "samples": [
        "what can I make for dinner",
        "find me a recipe with {ingredient}",
        "suggest a quick meal"
      ]
    },
    {
      "name": "AddToShoppingListIntent",
      "samples": [
        "add {item} to my shopping list",
        "I need to buy {item}",
        "remind me to get {item}"
      ]
    }
  ]
}
```

**Smart display considerations:**
- Use Alexa Presentation Language (APL) for Echo Show
- Use Interactive Canvas for Google Nest Hub
- Large touch targets (thumb-friendly)
- High contrast for kitchen lighting
- Minimal text, mostly visual

**In-app voice (Web Speech API):**
```typescript
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = false;
recognition.lang = 'en-US';

recognition.onresult = (event) => {
  const command = event.results[0][0].transcript;
  handleVoiceCommand(command);
};

// Trigger with button press or wake word detection
```

**Smart appliance landscape:**
- **Smart ovens:** June Oven has API, most others don't
- **Instant Pot:** No official API, community hacks exist
- **Smart fridges:** Samsung Family Hub has limited API
- **Smart scales:** Drop Scale, Perfect Bake have APIs
- Reality: This is early-stage, focus on voice assistants first

**Files to create:**
- `alexa-skill/` - Separate repo or directory for Alexa skill
- `google-action/` - Google Assistant action
- `src/components/display/KitchenDisplayMode.tsx`
- `src/components/recipes/HandsFreeRecipe.tsx`
- `src/lib/voiceCommands.ts`
- `supabase/functions/alexa-handler/`
- `supabase/functions/google-handler/`

**Certification requirements:**
- Alexa: Functional test, security review, content policy
- Google: Functionality, conversational quality, brand guidelines
- Both: ~2-4 weeks review time, may require revisions
