# Progressive Web App & Offline Support

**Category:** Architecture | DX Improvement
**Quarter:** Q2
**T-shirt Size:** L

## Why This Matters

Cooking happens in the kitchen, often with messy hands and unreliable WiFi. Users need to access their pantry inventory, read recipes, and check shopping lists regardless of connectivity. A Progressive Web App (PWA) transforms Appetite from a website into an app-like experience that works offline, installs to the home screen, and sends push notifications for expiring ingredients.

This initiative is about meeting users where they are—in the kitchen with their phone, at the grocery store with spotty service, or at home wanting quick access without opening a browser.

## Current State

**What exists:**
- Responsive mobile design
- Vite build system (PWA-ready)
- Web Vitals monitoring
- Fast initial load with code splitting

**What's missing:**
- No service worker for offline support
- No install prompt or home screen capability
- No push notifications
- No offline data caching
- No background sync for data changes made offline
- No app manifest with proper icons

## Proposed Future State

**The PWA will provide:**

1. **Offline Access:**
   - Full pantry inventory available offline
   - Saved recipes accessible without connection
   - Shopping lists work offline with sync when reconnected
   - Meal plan calendar viewable offline
   - Graceful degradation for AI features (show cached suggestions)

2. **Home Screen Installation:**
   - Install prompt on mobile and desktop
   - Custom app icons and splash screens
   - Standalone app experience (no browser chrome)
   - Proper manifest with theme colors

3. **Push Notifications:**
   - Expiring ingredient alerts
   - Low stock notifications
   - Meal prep reminders (for planned meals)
   - Shopping list reminders when near grocery store (with permission)

4. **Background Sync:**
   - Queue changes made offline
   - Sync pantry updates when connection restored
   - Sync shopping list checkoffs
   - Conflict resolution for concurrent edits

5. **Performance Optimizations:**
   - Aggressive caching of static assets
   - API response caching with stale-while-revalidate
   - Image optimization and lazy loading
   - Preloading of likely-needed resources

## Key Deliverables

- [ ] Configure vite-plugin-pwa for service worker generation
- [ ] Create web app manifest with icons (all required sizes)
- [ ] Implement service worker with Workbox
- [ ] Add offline-first data layer with IndexedDB
- [ ] Create sync queue for offline mutations
- [ ] Implement background sync API integration
- [ ] Build push notification infrastructure (Web Push API)
- [ ] Create notification preferences UI
- [ ] Add geofencing for location-based reminders
- [ ] Implement install prompt with custom UI
- [ ] Add offline indicator in UI
- [ ] Create conflict resolution for synced data
- [ ] Optimize caching strategies per route
- [ ] Add splash screens for all platforms
- [ ] Test offline scenarios comprehensively
- [ ] Create "you're offline" fallback pages

## Prerequisites

- **Initiative 01 (Testing):** PWA behavior is notoriously hard to test—need solid testing infrastructure first
- Supabase configuration for push notifications
- SSL certificate (required for service workers)—already have via Supabase

## Risks & Open Questions

- **Risk:** IndexedDB complexity for offline data—consider using Dexie.js or similar abstraction
- **Risk:** Background sync has limited browser support—need graceful degradation
- **Question:** How much data should be cached offline? Full pantry + recent recipes, or configurable?
- **Question:** How to handle AI features offline? Cache recent suggestions? Show "AI unavailable" message?
- **Risk:** Push notification permission fatigue—users may decline if not well-timed
- **Question:** Should we support location-based reminders? (Privacy considerations, battery impact)

## Notes

**Technical implementation:**

```javascript
// vite.config.ts addition
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 }
            }
          }
        ]
      }
    })
  ]
})
```

**Offline data model:**
- Use IndexedDB as primary offline store
- Supabase as source of truth
- Sync timestamps for conflict resolution
- Queue for pending mutations

**Push notification service:**
- Web Push API for browser notifications
- Supabase Edge Function to send notifications
- Daily cron job to check expirations and trigger alerts

**Files to create/modify:**
- `vite.config.ts` - Add VitePWA plugin
- `public/manifest.json` - App manifest
- `public/icons/` - All icon sizes
- `src/lib/offlineStorage.ts` - IndexedDB wrapper
- `src/lib/syncQueue.ts` - Offline mutation queue
- `src/lib/pushNotifications.ts` - Push subscription handling
- `supabase/functions/send-notification/` - Push sender

**Testing requirements:**
- Service worker lifecycle tests
- Offline mode simulation tests
- Background sync verification
- Push notification delivery tests
