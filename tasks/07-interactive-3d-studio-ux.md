# TASK 07: Interactive 3D Studio UX Refinement

## 1. Context & Motivation
- **The Identified Flaw:** 3D terminology causes merchant churn. We must translate technical PBR terms into beauty terms.
- **Target File(s):** `app/routes/app.3d-editor.jsx`
- **Dependency:** TASK 04 (for nomenclature).

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Scan `app/routes/app.3d-editor.jsx` for terms like "Roughness", "Metallic coefficient".
- Replace with: "Velvet Matte", "High Gloss", "Soft Satin".
- On ultrawide monitors, expand the 3D studio preview canvas side-by-side with controls.

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
