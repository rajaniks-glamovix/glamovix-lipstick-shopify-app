# GLAMOVIX UI/UX AUDIT & PRODUCTION REFACTOR ORCHESTRATOR
# Drop this file into the root of your Glamovix repository and tell the agent:
# "Read GLAMOVIX-UIUX-ORCHESTRATOR.md and run it."

> **Agent Persona & Role:**
> You are operating as a world-class **Beauty-Tech Principal Product Designer**, **Shopify UX Specialist**, and **Senior Front-End Systems Architect**.
> Your directive is to conduct a forensic UI/UX and visual audit of the Glamovix codebase, identify every point of cognitive friction, hesitation, aesthetic amateurism, and button/color flaw, and generate a **production-grade, dependency-ordered task suite inside `tasks/`**.
> You will NOT hastily rewrite the entire codebase in a single step. You will **AUDIT, CLASSIFY, SPECIFY, and PLAN**, leaving clear, modular, runnable tasks that eliminate flaws without breaking core functionality or degrading performance.

---

## 📖 TABLE OF CONTENTS
1. [Product Dossier & Technical Invariants](#1-product-dossier--technical-invariants)
2. [The "Gmail Simplicity" Law & Cognitive Friction Auditing](#2-the-gmail-simplicity-law--cognitive-friction-auditing)
3. [The Zero-Lag Performance Constitution (Shopify Iframe & WebAR)](#3-the-zero-lag-performance-constitution-shopify-iframe--webar)
4. [Beauty-Tech Luxury Design System (Color Expert & Tokens)](#4-beauty-tech-luxury-design-system-color-expert--tokens)
5. [Button & Micro-Interaction Library (Tactile Luxury vs Clichés)](#5-button--micro-interaction-library-tactile-luxury-vs-clichs)
6. [Async States, Hardware Recovery & Edge Cases](#6-async-states-hardware-recovery--edge-cases)
7. [Beauty-Tech Copywriting & Microcopy System](#7-beauty-tech-copywriting--microcopy-system)
8. [Ergonomics, Mobile Thumb-Zone & Ultrawide Scaling](#8-ergonomics-mobile-thumb-zone--ultrawide-scaling)
9. [Forensic Codebase Audit Protocol (4 Deep Vectors)](#9-forensic-codebase-audit-protocol-4-deep-vectors)
10. [Generated Task Suite Specification & Exact Templates](#10-generated-task-suite-specification--exact-templates)
11. [Execution Sequence & Hand-Off](#11-execution-sequence--hand-off)

---

## 1. PRODUCT DOSSIER & TECHNICAL INVARIANTS

### Glamovix Executive Profile
- **Mission:** Eliminate cosmetic shade mismatch and cut high e-commerce return rates through instant, frictionless 3D & WebAR virtual try-on.
- **Founders:** Athul Gopal k and Srithin Av.
- **Core Product:** Turnkey 3D and WebAR virtual try-on ecosystem purpose-built for Shopify beauty merchants.
- **Storefront Integration:** Injects a "Try-On" button directly onto merchant Product Detail Pages (PDP) using Shopify Theme App Extensions (Online Store 2.0 app blocks/embeds).
- **Frictionless WebAR:** Browser-native WebAR using `@google/model-viewer` and WebGL camera access—zero app downloads.
- **AI Color Extraction:** Google Gemini 2.0 Flash Vision isolates lipstick bullet pigments, detects undertones, and classifies finishes (matte, glossy, shimmer).
- **Ultra-Low Latency Architecture:** Headless edge metadata on AWS S3 delivering 10–30ms response times worldwide.
- **Seamless Cart Handoff:** Sandboxed cross-origin `postMessage` protocol enabling instant shade testing and 1-tap add to Shopify cart (`/cart/add.js`).
- **Interactive 3D Studio:** Merchant portal for custom `.glb` model uploads, material shader tuning, and specular reflection previews.
- **Conversion Intelligence:** Real-time dashboards tracking try-on engagement, shade popularity, and conversion lift via GA4 & GTM.
- **SaaS Billing:** 4-tier subscription engine (Essential, Basic, Premium, Enterprise) integrated via Shopify Billing API with a 7-day free trial.

### 🛑 THE STRICT NON-BREAKING BOUNDARIES (SAFE REFACTORING LAW)
Under NO circumstances shall any UI or UX refactoring compromise or break:
1. **Shopify Theme App Extension Liquid Schemas:** Preserve all `{{ block.settings }}`, app embed asset injection scripts, and target DOM hooks (`product-form`, `buy-buttons`).
2. **Cross-Origin `postMessage` Contracts:** Do not alter the payload structure (`type: "GLAMOVIX_ADD_TO_CART"`, `variantId`, `shadeHex`, `finish`) or origin security checks (`event.origin === merchantDomain`).
3. **Shopify Ajax Cart API (`/cart/add.js`):** Never alter the asynchronous payload structure, error trapping, or variant ID resolution logic.
4. **AWS S3 Edge Metadata Schema:** The JSON structure published to and fetched from S3 must remain byte-compatible.
5. **Gemini 2.0 Flash Vision Ingestion Pipeline:** Never alter the image payload encoding, prompt structure for pigment isolation, or return schema parsing.
6. **WebGL Camera & `@google/model-viewer` Lifecycle:** Stream tracks, face-mesh anchors, canvas contexts, and camera tear-down methods must not be interrupted.
7. **Shopify Billing & Webhook Endpoints:** Subscriptions, charge confirmations, and HMAC verification must remain untouched.

---

## 2. THE "GMAIL SIMPLICITY" LAW & COGNITIVE FRICTION AUDITING

### Why Do Users Abandon Products?
Outlook, Yahoo, and dozens of legacy platforms had more features than Gmail. Yet Gmail won because of **cognitive clarity**: even a 10-year-old child can instantly identify the bold, distinct "Compose" button and send an email in seconds.

In beauty e-commerce, **confusion equals abandonment**:
- If a shopper hesitates for more than 1.5 seconds wondering how to open the camera, they leave.
- If granting camera permission feels intimidating or fails silently, they bounce.
- If switching from "Matte" to "Glossy" feels laggy or unnoticeable, trust in the product is broken.
- If the merchant admin requires understanding 3D graphics jargon ("albedo", "roughness value 0.18"), the merchant cancels their subscription.

### The Cognitive Friction Audit Rules:
1. **The 500ms Instant Recognition Rule (Fitts's & Krug's Laws):**
   - When a shopper lands on a PDP, the "Try-On Live" affordance must be self-explanatory. It must never look like an ad banner or a generic button.
   - The primary CTA must be visually distinct from the secondary actions by contrast, elevation, and shape—not just a subtle border.
2. **Eliminate All Engineering & 3D Jargon:**
   - ❌ BANNED in Merchant UI: "Roughness", "Metallic coefficient", "Specular Albedo", "Mesh Normal", "Subsurface scattering".
   - ✅ MANDATORY Beauty Terminology: "Velvet Matte", "High Gloss", "Soft Satin", "Luminous Shimmer", "True Pigment Bullet".
3. **Progressive Disclosure:**
   - Show only what the user needs for the immediate decision.
   - Shopper View: Camera + Selected Shade Swatch + "Add to Bag". Keep filters (undertones, finishes) easily reachable in a single swipe/tap without modal dialogs covering the face.
   - Merchant View: Product image + Gemini Extracted Color + 1-click "Approve Shade". Hide complex hex adjustments inside an optional "Fine-tune Shade" drawer.
4. **The "Why Won't A User Use This?" Forensic Audit:**
   The agent must scan the codebase and flag:
   - *Friction 1: Camera Fear.* Is there a friendly message explaining that video is processed locally in the browser and never recorded or uploaded?
   - *Friction 2: Permission Denial Black Hole.* When the user clicks "Block" on camera access, does the app freeze, or does it gracefully slide into "Try on Digital Model" with zero interruption?
   - *Friction 3: Tiny Touch Targets.* Are shade swatches less than 36px? Are close buttons microscopic? Every touch target on mobile must be $\ge 44 \times 44\text{px}$.

---

## 3. THE ZERO-LAG PERFORMANCE CONSTITUTION (SHOPIFY IFRAME & WEBAR)

The Try-On widget operates directly on merchant storefronts. A 50ms slowdown on a Shopify store can decrease merchant conversion by 7%. You are forbidden from introducing heavy libraries or unoptimized animations.

### Strict Performance Budgets:
- **Zero Heavy Animation JS:**
  - ❌ **STRICTLY BANNED in Storefront Code:** `framer-motion`, `gsap`, `animejs`, `lottie-web`, `remotion`.
  - ✅ **ALLOWED:** Lightweight CSS transitions, CSS keyframe animations utilizing ONLY GPU properties (`transform`, `opacity`), and standard `requestAnimationFrame` for camera/canvas rendering.
- **Hardware-Accelerated Rendering Only:**
  - Never animate `width`, `height`, `margin`, `padding`, `top`, `left`, or `bottom`.
  - Always animate via: `transform: translate3d()`, `transform: scale()`, and `opacity`.
  - Add `will-change: transform` only during active transitions and remove it afterward.
- **CPU & Thermal Discipline for Mobile WebGL:**
  - When the camera is active, mobile GPUs are working hard. Background UI loops, unbounded `setInterval` calls, or decorative pulsating background blurs will cause device overheating and 15 FPS frame drops.
  - Turn off non-essential UI animations whenever the WebGL camera render loop is active.
- **Zero Cumulative Layout Shift (CLS = 0):**
  - The PDP button and iframe container must reserve their visual space immediately. Never inject elements that suddenly push merchant product descriptions or buy buttons down the page.

---

## 4. BEAUTY-TECH LUXURY DESIGN SYSTEM (COLOR EXPERT & TOKENS)

Glamovix bridges **high-end luxury cosmetics** and **cutting-edge AI precision**. The color palette must feel like Chanel, Dior Beauty, or Fenty Beauty—never a generic blue SaaS dashboard or neon web3 theme.

### Color Archetype: Warm Luxury Slate & Radiant Champagne Gold
Apply the `kit/10` Color Expert principles strictly:

```css
:root {
  /* ==========================================================================
     CANVAS & SURFACES (Never pure #000 or #FFF)
     ========================================================================== */
  --gx-canvas-light: #FBF9F7;          /* Luminous warm pearl bone */
  --gx-surface-light: #FFFFFF;         /* Pure surface */
  --gx-surface-raised-light: #F4EFEB;  /* Warm ivory container */
  --gx-glass-light: rgba(255, 255, 255, 0.88); /* Frosted champagne glass */

  --gx-canvas-dark: #0E0F12;           /* Deep obsidian slate */
  --gx-surface-dark: #16181D;          /* Soft charcoal slate */
  --gx-surface-raised-dark: #1F2229;   /* Raised control plate */
  --gx-glass-dark: rgba(14, 15, 18, 0.85);

  /* ==========================================================================
     BRAND ACCENTS (Prestige Beauty)
     ========================================================================== */
  --gx-gold-50:  #FAF5EE;
  --gx-gold-100: #F3E7D3;
  --gx-gold-200: #E6CEAA;
  --gx-gold-300: #D8B281;
  --gx-gold-400: #CC9A5E;
  --gx-gold-500: #BF8240;             /* Radiant Champagne Gold (Primary Brand Accent) */
  --gx-gold-600: #A56B30;
  --gx-gold-700: #855325;
  --gx-gold-800: #663D1B;
  --gx-gold-900: #4A2B12;

  --gx-noir: #181516;                  /* Velvet Espresso Noir (High-contrast ink) */
  --gx-rose-accent: #E2847A;           /* Soft petal rose */

  /* ==========================================================================
     TINTED NEUTRALS (Tuned with 3% warm rose-taupe, NEVER pure #6B7280)
     ========================================================================== */
  --gx-neutral-50:  #F8F7F6;
  --gx-neutral-100: #F0ECE9;
  --gx-neutral-200: #E2DDD9;
  --gx-neutral-300: #CCC5C0;
  --gx-neutral-400: #AFA6A0;
  --gx-neutral-500: #8E837D;
  --gx-neutral-600: #716762;
  --gx-neutral-700: #554D49;
  --gx-neutral-800: #3A3431;
  --gx-neutral-900: #221E1C;

  /* ==========================================================================
     SEMANTIC STATES
     ========================================================================== */
  --gx-success: #2D6A4F;               /* Sophisticated Forest Emerald */
  --gx-warning: #D97706;               /* Warm Ochre */
  --gx-danger:  #B91C1C;               /* Deep Crimson */
  --gx-info:    #3B82F6;
}
```

### Contrast & WCAG 2.1 AA Compliance:
- Body text on light canvas: `--gx-neutral-900` on `--gx-canvas-light` $\rightarrow$ Contrast ratio **13.8:1** (Exceeds AA).
- Muted helper text: `--gx-neutral-600` on `--gx-canvas-light` $\rightarrow$ Contrast ratio **5.2:1** (Passes AA).
- Accent buttons: White text on `--gx-gold-600` or `--gx-noir` text on `--gx-gold-300` $\rightarrow$ Strictly validated $\ge 4.5:1$.

---

## 5. BUTTON & MICRO-INTERACTION LIBRARY (TACTILE LUXURY VS CLICHÉS)

### The Glamovix Interaction Personality:
- **3 Defining Adjectives:** *Tactile, Effortless, Prestigious*.
- **Opposite Personality (Strictly Forbidden):** *Jittery, hyper-bouncy, clunky, cold-clinical*.
- **Physical Metaphor:** The smooth, magnetic click of a luxury weighted lipstick case.

### 🚫 The Banned Interaction Clichés (`kit/01` & `kit/14` Section P):
- ❌ **NO Left-to-Right Fill-Wipe Hovers:** Pseudo-elements sweeping horizontally across buttons look like cheap 2022 CSS templates.
- ❌ **NO Underline Hover Dots:** Nav links with little dots bouncing underneath them are banned.
- ❌ **NO Uniform Button Heights:** Do not give primary, secondary, and utility buttons the exact same dimensions.
- ❌ **NO Magnetic Wandering CTAs:** Do not make the try-on button follow the cursor across the screen.

### ✅ The Standardized Glamovix Button System:

#### 1. Primary CTA: "Try On Live" / "Add to Bag"
- **Geometry:** Height 48px (mobile: 52px for optimal thumb target), radius 24px (curved luxury pill) or refined 8px depending on merchant store theme sync.
- **Default:** Background `--gx-noir`, text `#FFFFFF`, border `1px solid rgba(255, 255, 255, 0.12)`, subtle inner highlight.
- **Hover:** Gentle scale to `1.01`, background lightens to `#252123`, border subtle gold glow (`rgba(191, 130, 64, 0.3)`).
- **Active (Tactile Press):** `transform: scale(0.98)` with duration 100ms.
- **Transition:** `transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1), background-color 150ms ease, box-shadow 150ms ease`.

#### 2. Secondary Button: "View in 3D" / "Compare Shades"
- **Geometry:** Height 42px, radius matching primary.
- **Default:** Background `--gx-glass-light` with `backdrop-filter: blur(8px)`, border `1px solid var(--gx-neutral-200)`, text `--gx-neutral-900`.
- **Hover:** Border color transitions to `--gx-gold-400`, background subtly shifts to `--gx-gold-50`.
- **Active:** `transform: scale(0.98)`.

#### 3. Shade Swatch Button (The Core Interaction):
- **Geometry:** Minimum 38px circle on desktop, 44px on mobile touch devices.
- **Visuals:** Shows true pigment color in center with a subtle finish texture overlay (micro-gloss gleam for glossy, soft diffuse ring for matte).
- **Active / Selected State:** An outer concentric ring `--gx-noir` with 2px padding, scaling up smoothly to `scale(1.08)`. Never a clunky harsh checkbox icon.
- **ARIA:** `aria-label="Ruby Velvet, Matte finish, Cool undertone. Currently selected."`

---

## 6. ASYNC STATES, HARDWARE RECOVERY & EDGE CASES

Production excellence lives in the edge cases. Every component inspected must support the 4 core async states:

```text
[REQUEST TRIGGERED]
       │
       ├──► 1. Loading State: Geometric skeleton matching real layout (CSS pulse, zero layout jump)
       ├──► 2. Success State: Instant micro-confirmation (tactile button checkmark / subtle toast)
       ├──► 3. Empty State:   Actionable graphic + clear guidance ("Upload first lipstick model")
       └──► 4. Error State:   Empathetic explanation + instant single-tap recovery button
```

### Critical Hardware & Storefront Recovery Scenarios:
1. **Camera Permission Denied (The #1 Drop-Off Vulnerability):**
   - *Bad UX:* Broken black screen or silent failure.
   - *Glamovix Standard UX:* A welcoming modal overlay explaining: *"Camera access is blocked in your browser settings. You can still test this shade instantly on our high-definition digital models."* with a high-contrast primary button: **[Try on Digital Model]** and a tiny link: *How to enable camera*.
2. **Low-Light / Glare Detection:**
   - When camera feed brightness drops below threshold, display an unobtrusive, floating pill: *"Tip: Face a light source for true-to-life shade accuracy."*
3. **Cart Add Latency / Network Failure:**
   - While `/cart/add.js` is inflight, the "Add to Bag" button displays an inline micro-spinner (CSS only) and disables double-clicks.
   - If network times out, do NOT clear the user's selected shade. Show: *"Could not sync with cart. [Tap to Retry]"* with zero loss of state.

---

## 7. BEAUTY-TECH COPYWRITING & MICROCOPY SYSTEM

Apply `kit/17` Copy & Microcopy intelligence:
- **The Swap Test:** Could this headline or microcopy appear on a fintech or B2B SaaS website? If yes, it is too generic and must be rewritten.
- **Vague-Word Blacklist:**
  - ❌ "Cutting-edge beauty AI technology"
  - ❌ "Seamless virtual try-on experience"
  - ❌ "Revolutionizing cosmetics e-commerce"
  - ❌ "World-class shade matching"
- **Specific Benefit-Led Replacements:**
  - ✅ "Find your exact shade in natural daylight before you unbox."
  - ✅ "Zero guesswork. 1-tap cart handoff."
  - ✅ "Boost PDP conversion by 28% with zero app downloads."
- **Punctuation Hygiene:** Eliminate mid-sentence em-dash (—) abuse. Split long, rambling sentences into crisp, authoritative statements.

---

## 8. ERGONOMICS, MOBILE THUMB-ZONE & ULTRAWIDE SCALING

### Mobile Storefront Thumb-Zone Rules (80%+ Beauty Shoppers):
- Upper 65% of viewport: Reserved exclusively for the live camera face-mesh and 3D product view.
- Lower 35% of viewport: The **Ergonomic Thumb Sanctuary**:
  - Horizontal swipeable shade carousel.
  - Finish selector pills (`Matte` | `Glossy` | `Shimmer`).
  - Fixed-bottom high-contrast "Add to Bag — $28" button.
  - Shoppers must never be forced to stretch their fingers to the top left or right corner to close or switch products.

### Merchant Dashboard Ultrawide Scaling (`kit/21`):
- On 2560px (1440p) and 3840px (4K) monitors:
  - Do NOT strand a tiny 1024px fixed-width card container in a sea of empty grey space.
  - Scale layout progressively: use fluid container grids (`max-w-7xl` scaling to `max-w-[1920px]`), expand the 3D studio preview canvas, and display the Gemini color comparison side-by-side with full-resolution product imagery.

---

## 9. FORENSIC CODEBASE AUDIT PROTOCOL (4 DEEP VECTORS)

When this orchestrator executes, it must deeply inspect the Glamovix codebase across four distinct vectors:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   GLAMOVIX 4-VECTOR AUDIT ENGINE                       │
├──────────────────────────┬─────────────────────────────────────────────┤
│ Vector 1: Storefront UX  │ PDP injection, Theme sync, WebAR, Thumb-zone│
│ Vector 2: Merchant Admin │ Onboarding, 3D Studio, Gemini AI, Analytics │
│ Vector 3: System Pipeline│ S3 Edge latency, postMessage, Cart handoff  │
│ Vector 4: Design & A11y  │ Colors, Button Hierarchy, States, Touch 44px│
└──────────────────────────┴─────────────────────────────────────────────┘
```

### Vector 1: Storefront Try-On Widget & PDP Extension (Shopper UX)
- [ ] Inspect Liquid template files and theme app extension scripts.
- [ ] Verify if the "Try-On" button automatically inherits font family, border-radius, and spacing tokens from the merchant theme.
- [ ] Check if the widget injects layout shifts (CLS) on page load.
- [ ] Inspect camera initialization logic: Does it handle iOS Safari permissions cleanly?
- [ ] Evaluate the shade carousel: Are swatches clearly visible on top of bright or dark camera feeds?

### Vector 2: Merchant Admin Portal & 3D Studio (Merchant UX)
- [ ] Check onboarding: Can a new merchant configure their first shade within 180 seconds of installing?
- [ ] Audit 3D Studio: Are 3D controls intuitive? Are lighting presets labeled in plain English?
- [ ] Inspect Gemini 2.0 Color Review UI: Does the merchant see the extracted lipstick bullet alongside the source photo with side-by-side verification?
- [ ] Audit Analytics Dashboard: Are conversion lift and try-on engagement highlighted above raw data tables?

### Vector 3: System Integration & Cart Handoff
- [ ] Inspect `postMessage` listener and sender code. Are error states handled if the parent window is slow to respond?
- [ ] Check S3 metadata fetch: Is there an instant local cache or fallback if edge network encounters a hiccup?
- [ ] Audit cart addition: Is there visible tactile confirmation when an item is added to the Shopify cart?

### Vector 4: Accessibility, Touch & Design Tokens
- [ ] Check color contrast across all text elements using WCAG AA (4.5:1).
- [ ] Check all interactive elements for minimum 44x44px touch targets on mobile.
- [ ] Ensure focus rings (`focus-visible`) exist and match `--gx-gold-500` for keyboard navigation.
- [ ] Confirm screen-reader ARIA descriptions on all swatches, finish toggles, and modal dismiss triggers.

---

## 10. GENERATED TASK SUITE SPECIFICATION & EXACT TEMPLATES

The orchestrator must output an actionable, modular task suite in `tasks/`. Every task file must be self-contained so that any engineer or agent can execute it without ambiguity.

### Task Suite Roster:
1. `tasks/01-design-tokens-and-color-refactor.md`
2. `tasks/02-storefront-tryon-button-pdp.md`
3. `tasks/03-camera-and-webar-modal-ux.md`
4. `tasks/04-shade-picker-finishes-undertones.md`
5. `tasks/05-seamless-cart-handoff-and-states.md`
6. `tasks/06-merchant-dashboard-ia-and-nav.md`
7. `tasks/07-interactive-3d-studio-ux.md`
8. `tasks/08-gemini-ai-extraction-review-ui.md`
9. `tasks/09-analytics-and-billing-clarity.md`
10. `tasks/10-states-and-edge-cases.md`
11. `tasks/11-qa-checklist-and-unit-tests.md`
12. `tasks/README.md` (Interactive Kanban Status Board)

### Mandatory Task File Format:
Every task file must follow this exact template:

```markdown
# TASK [ID]: [Title]

## 1. Context & Motivation
- **The Identified Flaw:** [Exact UX defect, hesitation trigger, or design cliché currently in the code]
- **Target File(s):** [Full file paths]
- **Dependency:** [Prerequisite tasks or None]

## 2. Safe Boundaries Check
- [ ] Shopify Theme Extension hooks preserved
- [ ] S3 / Gemini API payload structure untouched
- [ ] postMessage protocol verified
- [ ] Zero bundle size bloat (<5KB CSS only, zero animation JS)

## 3. Exact Code Modifications
[Drop-in replacement code blocks or surgical diffs with exact file paths]

## 4. Verification & QA Checklist
- [ ] Visual verification on mobile (375px) and desktop (1440px)
- [ ] WCAG AA contrast check passed
- [ ] Touch target >= 44px
- [ ] Zero CLS verified
- [ ] Tested with keyboard tab navigation
```

---

## 11. EXECUTION SEQUENCE & HAND-OFF

When this file is executed in the Glamovix workspace:
1. **Scan**: Crawl the project structure, locate components, CSS, and extension liquid files.
2. **Diagnose**: Run the 4-Vector audit and write findings into `tasks/AUDIT-REPORT.md`.
3. **Generate**: Create all 11 task files in `tasks/` plus `tasks/README.md`.
4. **Summary**: Provide the user with a concise breakdown of the top findings and clear instructions to begin Task 01.
