# TASK 05: Seamless Cart Handoff & States

## 1. Context & Motivation
- **The Identified Flaw:** Adding to cart via `postMessage` needs to feel instant. Network latency must be masked with CSS spinners and tactile micro-confirmations.
- **Target File(s):** `extensions/glamovix-tryon-button/assets/app.js` and WebAR button logic.
- **Dependency:** None.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

- Implement loading state during `GLAMOVIX_ADD_TO_CART`: Display inline CSS spinner and disable double-clicks.
- Implement success state: Instant micro-confirmation (tactile button checkmark).
- Network Failure: Show *"Could not sync with cart. [Tap to Retry]"* without losing state.

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
