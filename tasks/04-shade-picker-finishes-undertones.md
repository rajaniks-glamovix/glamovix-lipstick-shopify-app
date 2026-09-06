# TASK 04: Shade Picker, Finishes & Undertones

## 1. Context & Motivation
- **The Identified Flaw:** The shade picker needs to be a tactile swatch interaction. Hard checkboxes and native select dropdowns feel amateurish.
- **Target File(s):** `app/components/ProductCard.jsx` (and storefront UI)
- **Dependency:** TASK 01 (Tokens).

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

**[MODIFY] `app/components/ProductCard.jsx`**
- Replace the raw `<input type="color">` and native dropdown with custom accessible swatches.
- Swatch: Minimum 38px circle (desktop) / 44px (mobile).
- Active State: Outer concentric ring `--gx-noir` with 2px padding, scaling up to `scale(1.08)`.
- Replace 3D jargon with Beauty terminology ("Velvet Matte", "High Gloss", "Soft Satin").

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
