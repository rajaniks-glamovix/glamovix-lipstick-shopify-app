# TASK 09: Analytics & Billing Clarity

## 1. Context & Motivation
- **The Identified Flaw:** Analytics dashboards often surface raw data tables instead of actionable insights. Billing upgrades need to feel like prestige services, not hard paywalls.
- **Target File(s):** `app/routes/app.analytics.jsx`, `app/routes/app.billing.jsx`
- **Dependency:** TASK 01.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Refine the analytics view to highlight conversion lift prominently above raw tables.
- Update billing tables to use the `--gx-gold-500` palette for Premium/Enterprise tiers.
- Ensure microcopy uses beauty-tech terminology (e.g., "Custom Shader Tuning").

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
