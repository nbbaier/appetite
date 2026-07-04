# Barcode & Photo Recognition for Ingredients

**Category:** New Feature | DX Improvement
**Quarter:** Q3
**T-shirt Size:** L

## Why This Matters

Adding ingredients to the pantry is the primary friction point in Appetite. While natural language parsing helps, the fastest input method is scanning—point your phone at a barcode or take a photo of your groceries. This reduces the "unpacking groceries" moment from 5 minutes of typing to 30 seconds of scanning.

Every second of input friction lost is a user who stops tracking their pantry. Barcode scanning is expected in modern inventory apps, and photo recognition represents the next frontier of AI-powered convenience.

## Current State

**What exists:**
- Natural language ingredient parsing (AI-powered)
- Manual ingredient entry with autocomplete
- Ingredient categorization (AI-assisted)
- Ingredient history for quick re-entry

**What's missing:**
- No barcode scanning
- No photo recognition
- No receipt scanning
- No batch input for multiple items
- No product database integration

## Proposed Future State

**The Recognition System will enable:**

1. **Barcode Scanning:**
   - Scan UPC/EAN codes with phone camera
   - Instant product lookup (name, brand, size)
   - Auto-populate ingredient details
   - Handle store brands and generics
   - Offline barcode cache for common items

2. **Photo Recognition:**
   - Take photo of groceries on counter
   - AI identifies multiple items
   - Suggests ingredient entries
   - Handles produce without barcodes (bananas, apples, etc.)
   - Learns user's common products

3. **Receipt Scanning:**
   - Photo of grocery receipt
   - OCR extraction of purchased items
   - Match to ingredient database
   - Auto-add with quantities
   - Price tracking for budget features

4. **Batch Input:**
   - Scan multiple items in succession
   - Review all scanned items before adding
   - Quick edit for quantities
   - Category suggestions

5. **Smart Fridge Integration (Future):**
   - Partner with smart fridge manufacturers
   - Automatic inventory from fridge cameras
   - Expiration tracking from product data

## Key Deliverables

- [ ] Integrate barcode scanning library (e.g., QuaggaJS, ZXing)
- [ ] Build camera capture UI for mobile and desktop
- [ ] Integrate with product database (Open Food Facts, UPCitemdb)
- [ ] Create barcode-to-ingredient mapping
- [ ] Implement OpenAI Vision API for photo recognition
- [ ] Build multi-item photo processing flow
- [ ] Create receipt OCR with Tesseract.js or cloud service
- [ ] Implement receipt-to-items parsing
- [ ] Add offline barcode cache (IndexedDB)
- [ ] Create batch scanning UI with review screen
- [ ] Build product database fallback for unknown barcodes
- [ ] Implement "learn this barcode" for manual mapping
- [ ] Add scanning history for quick re-scan
- [ ] Optimize camera performance on mobile
- [ ] Create accessibility alternatives (manual entry always available)

## Prerequisites

- **Initiative 04 (PWA):** For camera access and offline barcode cache
- **Initiative 01 (Testing):** Camera features need thorough testing across devices
- Product database API access (Open Food Facts is free, others may have costs)

## Risks & Open Questions

- **Risk:** Barcode databases are incomplete—many store brands and international products missing
- **Risk:** Camera APIs vary significantly across browsers and devices
- **Question:** Which barcode database to use? Open Food Facts (free, community) vs. commercial (more complete, paid)
- **Question:** How accurate does photo recognition need to be? (80% useful or frustrating?)
- **Risk:** OpenAI Vision API costs for photo recognition—need to balance accuracy vs. cost
- **Question:** Should receipt scanning include prices? (Scope creep into budget tracking)
- **Risk:** Privacy concerns with camera access—need clear permissions and data handling

## Notes

**Barcode database options:**

1. **Open Food Facts** (Recommended)
   - Free, open-source
   - 3M+ products globally
   - Community-maintained
   - Good for packaged foods

2. **UPCitemdb**
   - Commercial API
   - 400M+ barcodes
   - More comprehensive
   - Paid tiers

3. **Hybrid approach:**
   - Try Open Food Facts first
   - Fall back to UPCitemdb for unknowns
   - Cache results locally

**Photo recognition implementation:**

```typescript
// Using OpenAI Vision API
const identifyGroceries = async (imageBase64: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: "Identify all grocery items in this image. Return JSON: [{name, quantity, unit, category}]" },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      ]
    }]
  });
  return JSON.parse(response.choices[0].message.content);
};
```

**Technical considerations:**
- Use Web APIs: `navigator.mediaDevices.getUserMedia()` for camera
- Consider WebRTC for real-time barcode detection
- Implement debouncing to prevent duplicate scans
- Handle permission denied gracefully

**Files to create:**
- `src/components/pantry/BarcodeScanner.tsx`
- `src/components/pantry/PhotoCapture.tsx`
- `src/components/pantry/ReceiptScanner.tsx`
- `src/components/pantry/BatchAddReview.tsx`
- `src/lib/barcodeDatabase.ts`
- `src/lib/photoRecognition.ts`
- `src/lib/receiptOCR.ts`
- `supabase/functions/identify-groceries/` - Vision API wrapper

**Mobile-first design:**
- Full-screen camera view
- Haptic feedback on successful scan
- Audio cue option
- Large touch targets for adding
