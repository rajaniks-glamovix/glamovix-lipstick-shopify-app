import { detectLipstickColor, detectLipstickType } from "./utils/color-detector.js";

/**
 * Calls Gemini 2.0 Flash Vision API to analyze a lipstick product image and title.
 * Accurately extracts the lipstick pigment hex color, finish, and recommended intensity.
 *
 * @param {object} params
 * @param {string} params.imageUrl - URL of the product/variant image
 * @param {string} params.variantTitle - Variant title / display name
 * @param {string} [params.productTitle] - Parent product title
 * @returns {Promise<{ color: string, lipstick_type: string, intensity: string }>}
 */
export async function analyzeLipstickWithGemini({
  imageUrl,
  variantTitle,
  productTitle = "",
}) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no API key is set
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Falling back to shade dictionary.");
    return {
      color: detectLipstickColor({ title: variantTitle, selectedOptions: [] }, { title: productTitle }),
      lipstick_type: detectLipstickType(`${variantTitle} ${productTitle}`),
      intensity: "5",
    };
  }

  try {
    const parts = [];

    // High-accuracy cosmetic colorist prompt
    const promptText = `You are an expert cosmetic chemist and beauty colorist AI.
Analyze this high-resolution lipstick product image and title details.
Product Title: "${productTitle}"
Variant / Shade: "${variantTitle}"

Task & Rules:
1. Identify the exact dominant pigment hex color (#RRGGBB) from the core midtone of the lipstick bullet, applicator, or color swatch.
2. Filter out:
   - Specular glare / white studio flash highlights
   - Deep drop shadows / dark edges
   - Packaging (casing tubes in gold, black, silver)
   - Background studio lighting and skin tones
3. Capture the exact undertone: distinguish between warm coral/terracotta/peach, neutral classic reds, cool berry/plum/rose, and deep wines/burgundies.
4. Classify the finish accurately: "matte", "glossy", "sheer", "satin", "cream", "shimmer", "metallic".
5. Set recommended opacity intensity from 1 to 10 as a string (default "5" for standard opaque, "3" for sheer/tint, "7" to "9" for deep matte).

Return strictly JSON with keys "color", "lipstick_type", "intensity".`;

    parts.push({ text: promptText });

    // If an image URL is provided, fetch and encode as base64 (with 8s timeout)
    if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      try {
        const imageRes = await fetch(imageUrl, {
          headers: {
            "User-Agent": "Glamovix-AI/1.0",
          },
          signal: AbortSignal.timeout(8000),
        });

        if (imageRes.ok) {
          const arrayBuffer = await imageRes.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString("base64");
          const mimeType =
            imageRes.headers.get("content-type")?.split(";")[0] || "image/jpeg";

          parts.push({
            inline_data: {
              mime_type: mimeType,
              data: base64Data,
            },
          });
        }
      } catch (imgErr) {
        console.warn("Failed to download image for Gemini analysis:", imgErr.message);
      }
    }

    const modelsToTry = [
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent",
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
    ];

    let candidate = null;

    for (const apiUrl of modelsToTry) {
      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify({
            contents: [
              {
                parts,
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidate) break; // Successfully got candidate
        } else {
          const errorText = await response.text();
          console.warn(`Gemini API error on ${apiUrl} (${response.status}):`, errorText);
        }
      } catch (reqErr) {
        console.warn(`Gemini attempt failed on ${apiUrl}:`, reqErr.message);
      }
    }

    if (candidate) {
      const parsed = JSON.parse(candidate);
      let color = parsed.color?.trim() || "";
      if (!color.startsWith("#")) color = `#${color}`;

      // Validate hex
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        color = detectLipstickColor({ title: variantTitle }, { title: productTitle });
      }

      return {
        color: color.toUpperCase(),
        lipstick_type: parsed.lipstick_type || detectLipstickType(`${variantTitle} ${productTitle}`),
        intensity: parsed.intensity || "5",
        aiDetected: true,
      };
    }

    throw new Error("No response candidate from Gemini");
  } catch (error) {
    console.error("Gemini detection failed, using fallback:", error.message);
    return {
      color: detectLipstickColor({ title: variantTitle, selectedOptions: [] }, { title: productTitle }),
      lipstick_type: detectLipstickType(`${variantTitle} ${productTitle}`),
      intensity: "5",
      aiDetected: false,
    };
  }
}

/**
 * Analyzes a batch of lipstick variants with Gemini in parallel (up to concurrency limit).
 *
 * @param {Array<{ id: string, title: string, image?: string, productTitle?: string }>} variants
 * @returns {Promise<Array<{ id: string, color: string, lipstick_type: string, intensity: string, aiDetected: boolean }>>}
 */
export async function analyzeBatchLipstickWithGemini(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return [];

  // Process variants concurrently in parallel chunks of 5
  const results = [];
  const chunkSize = 5;

  for (let i = 0; i < variants.length; i += chunkSize) {
    const chunk = variants.slice(i, i + chunkSize);
    const chunkPromises = chunk.map(async (v) => {
      const analysis = await analyzeLipstickWithGemini({
        imageUrl: v.image,
        variantTitle: v.title,
        productTitle: v.productTitle,
      });

      return {
        id: v.id,
        ...analysis,
      };
    });

    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);
  }

  return results;
}
