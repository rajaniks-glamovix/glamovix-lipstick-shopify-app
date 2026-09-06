# TASK 03: Camera & WebAR Modal UX

## 1. Context & Motivation
- **The Identified Flaw:** The camera modal needs to feel like a premium mirror, not a generic iframe. It must handle permission denial gracefully ("Camera Fear") and provide clear, reassuring microcopy about local processing.
- **Target File(s):** WebAR App frontend logic (likely located where S3 fetched data meets `model-viewer`).
- **Dependency:** None.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Implement the hardware recovery scenario: When camera permission is denied, gracefully slide into "Try on Digital Model" mode instead of breaking.
- Add microcopy: *"Video is processed locally in your browser and never recorded or uploaded."*
- Ensure mobile thumb-zone rules: Upper 65% camera feed, lower 35% interactive controls.
- **Mobile Iframe Fix**: Use `height: 100dvh` (dynamic viewport height) or absolute positioning tied to `100%` of the iframe wrapper. Avoid standard `100vh` which causes clipping on iOS Safari when the browser toolbar expands/collapses.
- Remove any `overflow: hidden` rules on the iframe parent that swallow the bottom CTA buttons.

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] Verify HUD controls are fully visible in iOS/Android mobile browsers without iframe clipping
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
