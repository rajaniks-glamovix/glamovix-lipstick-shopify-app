# TASK 11: QA Checklist & Unit Tests

## 1. Context & Motivation
- **The Identified Flaw:** The refactoring must be guarded against future regressions.
- **Target File(s):** `tests/ui-ux-regression.test.jsx` (NEW)
- **Dependency:** Tasks 01-10.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Implement DOM testing to ensure button classes use the new `glamovix-lipstick-btn` architecture.
- Write tests asserting WCAG contrast levels are maintained for primary buttons.
- Create automated script to check for 44px touch target compliance on mobile breakpoints.

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
