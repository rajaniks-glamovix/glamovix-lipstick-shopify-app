# TASK 06: Merchant Dashboard IA & Navigation

## 1. Context & Motivation
- **The Identified Flaw:** The merchant dashboard scaling on ultrawide monitors strands the UI in the center. The Information Architecture (IA) must support progressive disclosure.
- **Target File(s):** `app/routes/app.jsx`, `app/routes/app._index.jsx`
- **Dependency:** TASK 01.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Implement fluid container grids scaling from `max-w-7xl` to `max-w-[1920px]`.
- Hide complex metadata inside an optional "Fine-tune Shade" drawer.
- Ensure the primary dashboard view surfaces actionable items first (e.g., "Approve Shade", missing models).
- **Iframe Responsiveness Fix**: Do NOT use `100vh` or fixed positioning that breaks inside the Shopify admin iframe. Use `height: 100%` on root containers and leverage native Shopify Polaris layout components (`Page`, `Layout`, `Grid`) to allow the iframe to breathe dynamically.
- **Remove unnecessary fixed-width constraints** on sidebar navigation that trap the UI on smaller displays. Use App Bridge navigation where applicable to reduce iframe clutter.

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] No vertical scrollbar duplication (Iframe scroll vs Window scroll)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
