/**
 * Glamovix AI Assistant (Glamovix Concierge) Server Engine
 *
 * Powered by Google Gemini with an intelligent local domain fallback engine
 * for 100% resilient merchant onboarding and guidance.
 */

const SYSTEM_INSTRUCTION = `You are Glamovix Concierge, an expert beauty-tech and Shopify virtual try-on specialist.
Your mission is to guide Shopify beauty merchants through the Glamovix app, answer technical & product questions, and help them successfully launch 3D & WebAR lipstick virtual try-on on their store.

=== Glamovix App Architecture & Navigation ===
- Home Dashboard (/app): Performance summary, try-on engagement, add-to-cart conversion lift, quick stats.
- Products (/app/product): View synced lipstick variants, edit hex color, set finish (Matte, Sheer, Glossy, Satin, Cream, Shimmer, Metallic), adjust opacity intensity (1-10), run AI Auto-Detect on shade photos, test try-on preview, and publish changes.
- 3D Editor (/app/3d-editor): Upload custom .glb 3D lipstick models, tune materials, specular sheen, and preview 3D bullet models interactively.
- Analytics (/app/analytics): Real-time conversion intelligence, total try-on sessions, most popular shades, shopper engagement time, device and geographic breakdown.
- Billing (/app/billing): 4 subscription tiers (Essential $19/mo, Basic $49/mo, Premium $99/mo, Enterprise $199/mo) with 7-day free trial.
- Help & Support (/app/help): Step-by-step setup guides, FAQs, interactive onboarding flow, direct SES email support form.

=== Storefront Integration Steps ===
To add the "Try-On Live" button on the merchant's Shopify store:
1. In Shopify Admin, navigate to Online Store > Themes.
2. Click "Customize" on the active theme.
3. Open the "Default Product" template from the top dropdown.
4. Under Product Information, click "Add block" (or open "App embeds" in the left toolbar).
5. Select and enable "Glamovix Try-On Button".
6. Click "Save". The button will instantly appear on product pages!

=== Key Technology & Privacy ===
- Zero App Download: Runs directly in mobile Safari, Chrome, and Edge via WebGL.
- Privacy First: Camera video stream is processed 100% locally in the customer's browser in real-time. Video or photos are never recorded or stored on any server.
- AI Color Detection: Uses Gemini Vision to analyze lipstick bullet product images, isolate true pigment from glare/packaging, and determine the exact hex code and finish.

=== Interactive Action Buttons ===
Whenever relevant, include one or more action tags at the end of your response so the user can navigate with 1 click:
- [ACTION:NAVIGATE:/app/product|Go to Products]
- [ACTION:NAVIGATE:/app/3d-editor|Open 3D Editor]
- [ACTION:NAVIGATE:/app/billing|View Billing Plans]
- [ACTION:NAVIGATE:/app/analytics|View Analytics]
- [ACTION:NAVIGATE:/app/help|Open Help Center]
- [ACTION:NAVIGATE:/app|Go to Dashboard]

=== Tone & Style ===
- Welcoming, knowledgeable, concise, and professional beauty-tech consultant.
- Use bullet points, bold key terms, and keep explanations clear and easy to follow.`;

/**
 * Extracts action tags like [ACTION:TYPE:TARGET|LABEL] from the model output.
 * Returns the cleaned text and an array of action objects.
 */
export function extractActions(rawText) {
  const actionRegex = /\[ACTION:([A-Z_]+):([^|\]]+)\|([^\]]+)\]/g;
  const actions = [];
  let match;

  while ((match = actionRegex.exec(rawText)) !== null) {
    actions.push({
      type: match[1].toLowerCase(),
      target: match[2].trim(),
      label: match[3].trim(),
    });
  }

  // Remove the action tags from display text
  const cleanText = rawText.replace(actionRegex, "").trim();

  return { cleanText, actions };
}

/**
 * Intelligent domain fallback engine that matches merchant questions
 * and provides rich, accurate Glamovix answers with navigation actions.
 */
export function fallbackChatEngine(userMessage) {
  const text = (userMessage || "").toLowerCase();

  const matchWords = (...keywords) => {
    return keywords.some((kw) => {
      if (kw.includes(" ")) return text.includes(kw);
      return new RegExp(`\\b${kw}\\b`, "i").test(text);
    });
  };

  // 1. Setup / How to add try-on button / Theme integration
  if (
    matchWords("theme", "setup", "set up", "install", "embed", "embeds", "storefront", "try-on button", "add button", "how to add", "how do i add", "pdp")
  ) {
    return {
      text: `Here is how to add the **Glamovix Virtual Try-On** button to your Shopify storefront in 3 simple steps:

1. **Open Shopify Theme Editor**: Go to **Online Store** > **Themes** in your Shopify admin and click **Customize** on your current theme.
2. **Add the Try-On Block**: Navigate to the **Default Product** page template. Under the *Product information* section, click **Add block** (or check the **App embeds** tab on the left sidebar).
3. **Enable & Save**: Select **Glamovix Try-On Button**, place it near your "Add to Cart" button, and hit **Save** in the top-right corner.

Your customers will immediately see the "Try-On Live" button on your product pages!

[ACTION:NAVIGATE:/app/help|View Setup Guide] [ACTION:NAVIGATE:/app/product|Check Synced Products]`,
      source: "knowledge_base",
    };
  }

  // 2. Billing / Pricing / Plans / Upgrade
  if (
    matchWords("bill", "billing", "price", "prices", "pricing", "plan", "plans", "cost", "tier", "tiers", "subscription", "subscribe", "free trial", "upgrade")
  ) {
    return {
      text: `Glamovix offers flexible subscription plans with a **7-day free trial**:

- **Essential ($19/mo)**: Up to 10 product variants, standard WebAR virtual try-on, core analytics.
- **Basic ($49/mo)**: Up to 50 product variants, custom 3D model support, priority rendering.
- **Premium ($99/mo)**: Up to 200 product variants, advanced conversion analytics, full 3D studio.
- **Enterprise ($199/mo)**: Unlimited products, bespoke 3D modeling, dedicated account manager.

*Save up to 17% when switching to annual billing.* All payments are billed safely and conveniently through your regular Shopify invoice.

[ACTION:NAVIGATE:/app/billing|View & Manage Billing Plans]`,
      source: "knowledge_base",
    };
  }

  // 3. AI Color Auto-Detection / Gemini
  if (
    matchWords("ai", "gemini", "auto-detect", "autodetect", "detection", "vision", "color detector", "extract color")
  ) {
    return {
      text: `**Glamovix AI Color Detection** is powered by Google Gemini Vision:

- **How It Works**: Gemini inspects your high-resolution product photos, identifies the core lipstick bullet midtone, and filters out studio lighting glare, packaging reflections, and shadows.
- **Attributes Extracted**: It automatically isolates the exact **Hex pigment code**, classifies the **finish** (Matte, Glossy, Shimmer, etc.), and sets the recommended **opacity intensity**.
- **How to Use**: On the **Products** page, click the **AI Auto-Detect** button next to any variant to scan and apply the color in seconds.

[ACTION:NAVIGATE:/app/product|Try AI Auto-Detect on Products]`,
      source: "knowledge_base",
    };
  }

  // 4. Products / Shade management / Color picker / Intensity
  if (
    matchWords("product", "products", "shade", "shades", "color", "colors", "hex", "intensity", "finish", "matte", "glossy", "shimmer", "swatch", "swatches", "lipstick")
  ) {
    return {
      text: `You can manage and fine-tune all your lipstick shades on the **Products** page:

- **Synced Products**: Your Shopify lipstick products and variants appear automatically.
- **Color Picker**: Click any product's shade circle to fine-tune the exact hex pigment color.
- **Finish Type**: Choose between **Matte**, **Sheer**, **Glossy**, **Satin**, **Cream**, **Shimmer**, or **Metallic**.
- **Intensity Slider**: Adjust pigment opacity from **1 (subtle tint)** to **10 (rich opaque)**.
- **AI Auto-Detect**: Click the AI sparkle button to let Gemini automatically isolate the shade from your product photo.
- **Save & Publish**: Save changes to sync them instantly to your live store try-on widget.

[ACTION:NAVIGATE:/app/product|Go to Products] [ACTION:NAVIGATE:/app/help|Learn More]`,
      source: "knowledge_base",
    };
  }

  // 5. 3D Editor / GLB model uploads
  if (
    matchWords("3d", "model", "models", "glb", "editor", "specular", "material", "materials", "bullet", "packaging")
  ) {
    return {
      text: `The **Glamovix 3D Studio** lets you inspect and customize 3D lipstick models:

- **Upload Custom Models**: Upload your brand's custom \`.glb\` 3D lipstick packaging and bullet files.
- **Interactive 3D View**: Rotate, zoom, and inspect your 3D lipstick directly in the browser via \`@google/model-viewer\`.
- **Material Tuning**: Adjust specular highlights, reflection intensity, and metallic accents to match your luxury cosmetics packaging.

[ACTION:NAVIGATE:/app/3d-editor|Open 3D Editor]`,
      source: "knowledge_base",
    };
  }

  // 6. Analytics / Conversion / Stats
  if (
    matchWords("analytic", "analytics", "stat", "stats", "conversion", "metric", "metrics", "track", "tracking", "views", "cart", "impressions")
  ) {
    return {
      text: `The **Analytics** dashboard provides real-time conversion intelligence for your store:

- **Try-On Volume**: Total shopper try-on sessions across mobile and desktop.
- **Conversion Lift**: Measure how virtual try-on influences Add-to-Cart and completed checkout rates.
- **Shade Leaderboard**: Discover which lipstick shades shoppers are testing most frequently.
- **Device & Geography**: View breakdowns of shoppers by device type (iOS, Android, Desktop) and country.

[ACTION:NAVIGATE:/app/analytics|Open Analytics Dashboard]`,
      source: "knowledge_base",
    };
  }

  // 7. Camera / Privacy / WebAR / Devices
  if (
    matchWords("camera", "privacy", "permission", "permissions", "webar", "device", "devices", "phone", "safari", "chrome", "record", "webcam")
  ) {
    return {
      text: `Here are key facts about Glamovix's **WebAR & Camera Experience**:

- **Zero App Required**: Runs right inside browser tabs (Mobile Safari, Google Chrome, Edge).
- **100% Client-Side Privacy**: Video streams are processed strictly in real-time in the shopper's device GPU/WebGL. **No video, photo, or biometric data is ever recorded, transmitted, or stored on servers.**
- **Instant Camera Fallback**: If a shopper declines camera access or doesn't have a webcam, the widget smoothly allows testing shades on high-definition pre-set digital models.

[ACTION:NAVIGATE:/app/help|Read FAQs & Privacy Details]`,
      source: "knowledge_base",
    };
  }

  // 8. Support / Contact / Email
  if (
    matchWords("support", "contact", "help", "email", "issue", "bug", "problem", "ticket")
  ) {
    return {
      text: `Need hands-on assistance or have a specific question?

- **Help Center**: Check our step-by-step guides and FAQs on the **Help & Support** page.
- **Contact Support**: Submit a message through our built-in contact form. Our engineering and support team responds within 24 hours.

[ACTION:NAVIGATE:/app/help|Open Help & Support]`,
      source: "knowledge_base",
    };
  }

  // Default welcome / overview
  return {
    text: `Hello! I am your **Glamovix Concierge**. I can help you with anything in the Glamovix app:

- **Setup & Launch**: How to add the Try-On button to your Shopify product pages.
- **Shade Customization**: Fine-tuning hex colors, finishes (Matte, Glossy, Shimmer), and opacity.
- **AI Color Auto-Detection**: Extracting shades directly from lipstick photos with Gemini.
- **3D Studio**: Uploading and inspecting custom 3D lipstick models.
- **Analytics & Billing**: Understanding try-on conversion rates and subscription plans.

What would you like to explore?

[ACTION:NAVIGATE:/app/product|Go to Products] [ACTION:NAVIGATE:/app/3d-editor|Open 3D Editor] [ACTION:NAVIGATE:/app/help|Setup Guide]`,
    source: "knowledge_base",
  };
}

/**
 * Main chat generation function.
 * Attempts Google Gemini first; falls back to domain intelligence if key is invalid/unavailable.
 */
export async function generateChatResponse({ message, history = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no API key is set
  if (!apiKey) {
    const fallback = fallbackChatEngine(message);
    const { cleanText, actions } = extractActions(fallback.text);
    return {
      reply: cleanText,
      actions,
      source: "knowledge_base",
    };
  }

  try {
    // Format conversation history for Gemini API
    const contents = [];

    if (Array.isArray(history) && history.length > 0) {
      // Include up to the last 10 messages for context
      const recentHistory = history.slice(-10);
      for (const msg of recentHistory) {
        contents.push({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text || "" }],
        });
      }
    }

    // Append the current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const modelsToTry = [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
    ];

    let replyText = null;

    for (const endpoint of modelsToTry) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(9000),
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 1000,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) break;
        } else {
          console.warn(`Gemini chat endpoint ${endpoint} status:`, response.status);
        }
      } catch (reqErr) {
        console.warn(`Gemini chat request failed on ${endpoint}:`, reqErr.message);
      }
    }

    if (replyText) {
      const { cleanText, actions } = extractActions(replyText);
      return {
        reply: cleanText,
        actions,
        source: "gemini",
      };
    }

    throw new Error("No candidate returned from Gemini chat");
  } catch (error) {
    console.warn("Gemini chat failed, using Glamovix domain fallback:", error.message);
    const fallback = fallbackChatEngine(message);
    const { cleanText, actions } = extractActions(fallback.text);
    return {
      reply: cleanText,
      actions,
      source: "knowledge_base",
    };
  }
}
