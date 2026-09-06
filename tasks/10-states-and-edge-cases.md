# TASK 10: States & Edge Cases Implementation

## 1. Context & Motivation
- **The Identified Flaw:** Empty states and error states must be empathetic and helpful, providing immediate recovery paths.
- **Target File(s):** Global components (e.g., `ProductCard.jsx`, `app.product.jsx`).
- **Dependency:** None.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Empty State: When no lipstick models exist, show an actionable graphic with clear guidance ("Upload first lipstick model").
- Error State: Implement single-tap recovery buttons and empathetic explanations (e.g., if Gemini extraction fails).
- Low-light warning in WebAR: Add floating pill *"Tip: Face a light source for true-to-life shade accuracy."*

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
