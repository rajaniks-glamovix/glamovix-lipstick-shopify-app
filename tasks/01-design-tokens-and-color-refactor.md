# TASK 01: Global Design Tokens & Color Architecture

## 1. Context & Motivation
- **The Identified Flaw:** The codebase currently uses scattered, hardcoded hex values (e.g., `#005bd3`, `#f9fafb`, `#ebebeb`) in components like `ProductCard.jsx`, violating the luxury slate and champagne gold palette.
- **Target File(s):** 
  - `app/styles/glamovix-tokens.css` (NEW)
  - `app/root.jsx` (To import tokens)
- **Dependency:** None. This is the foundation.

## 2. Safe Boundaries Check
- [x] Shopify Theme Extension hooks preserved
- [x] S3 / Gemini API payload structure untouched
- [x] postMessage protocol verified
- [x] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications

**[NEW] `app/styles/glamovix-tokens.css`**
```css
:root {
  /* Canvas & Surfaces */
  --gx-canvas-light: #FBF9F7;
  --gx-surface-light: #FFFFFF;
  --gx-surface-raised-light: #F4EFEB;
  --gx-glass-light: rgba(255, 255, 255, 0.88);
  
  --gx-canvas-dark: #0E0F12;
  --gx-surface-dark: #16181D;
  --gx-surface-raised-dark: #1F2229;
  --gx-glass-dark: rgba(14, 15, 18, 0.85);

  /* Brand Accents */
  --gx-gold-50:  #FAF5EE;
  --gx-gold-100: #F3E7D3;
  --gx-gold-300: #D8B281;
  --gx-gold-400: #CC9A5E;
  --gx-gold-500: #BF8240; 
  --gx-gold-600: #A56B30;

  --gx-noir: #181516; 
  --gx-rose-accent: #E2847A;

  /* Neutrals */
  --gx-neutral-100: #F0ECE9;
  --gx-neutral-200: #E2DDD9;
  --gx-neutral-400: #AFA6A0;
  --gx-neutral-600: #716762;
  --gx-neutral-900: #221E1C;
}
```

**[MODIFY] `app/root.jsx`**
Import the new CSS file globally so components can reference var(--gx-*).

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
