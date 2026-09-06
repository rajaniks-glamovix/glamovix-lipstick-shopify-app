# TASK 08: Gemini AI Extraction Review UI

## 1. Context & Motivation
- **The Identified Flaw:** The merchant must trust the AI. Showing the extracted color without the source photo causes hesitation.
- **Target File(s):** `app/routes/app.product.jsx`
- **Dependency:** TASK 01.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Enhance the UI after Gemini returns the color.
- Display the extracted lipstick bullet color alongside the source product photo with side-by-side verification.
- Provide a high-contrast, 1-click "Approve Shade" button.

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
