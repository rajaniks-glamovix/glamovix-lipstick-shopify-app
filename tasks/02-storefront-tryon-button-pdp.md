# TASK 02: Storefront Try-On Button (PDP Extension) Refactor

## 1. Context & Motivation
- **The Identified Flaw:** The `iframe_button.liquid` uses generic block styling. It lacks tactile hover states (scale, opacity), feels clunky, and fails the "instant recognition" luxury threshold.
- **Target File(s):** `extensions/glamovix-tryon-button/blocks/iframe_button.liquid`
- **Dependency:** TASK 01 (Conceptual, but can be done in parallel for liquid)

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

**[MODIFY] `extensions/glamovix-tryon-button/blocks/iframe_button.liquid`**
- Refactor the `<style>` block to remove hardcoded widths and introduce smooth GPU-accelerated transitions.
- Apply the Glamovix Button System: 48px height (52px mobile), radius 24px, scale(0.98) on `:active`.

```css
#glamovix-lipstick {
  /* Remove old basic styles */
  min-height: 48px;
  border-radius: 24px;
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, box-shadow 150ms ease;
  will-change: transform;
}

#glamovix-lipstick:hover {
  transform: scale(1.01);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

#glamovix-lipstick:active {
  transform: scale(0.98);
}

@media (max-width: 768px) {
  #glamovix-lipstick {
    min-height: 52px; /* Mobile touch target */
  }
}
```

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
