/**
 * Comprehensive Beauty & Lipstick Shade Dictionary
 * Maps common lipstick color and shade names to accurate hex codes.
 * Multi-word phrases are listed first so specific matches take precedence.
 */
export const LIPSTICK_SHADE_MAP = {
  // --- Reds & Crimsons ---
  "ruby red": "#9B111E",
  "ruby": "#9B111E",
  "cherry red": "#9B1B30",
  "cherry": "#9B1B30",
  "black cherry": "#4A0E17",
  "brick red": "#962D24",
  "brick": "#8B2500",
  "chili red": "#A82D24",
  "chili": "#A82D24",
  "blood red": "#7E121D",
  "classic red": "#B71C1C",
  "true red": "#BA1825",
  "fire red": "#C62828",
  "scarlet": "#B22222",
  "crimson": "#990000",
  "maroon": "#800000",
  "garnet": "#733635",
  "carmine": "#960018",
  "poppy red": "#D63426",
  "poppy": "#D63426",
  "red": "#BA1825",

  // --- Pinks & Roses ---
  "dusty rose": "#BA6B7C",
  "rosewood": "#9B5364",
  "antique rose": "#B56D7A",
  "vintage rose": "#A85B69",
  "english rose": "#CC7A88",
  "hot pink": "#E91E63",
  "baby pink": "#F48FB1",
  "pastel pink": "#F8BBD0",
  "nude pink": "#C98686",
  "blush pink": "#DE8286",
  "blush": "#DE8286",
  "rose pink": "#C7526D",
  "rose": "#C25975",
  "fuchsia": "#C2185B",
  "magenta": "#AD1457",
  "flamingo": "#F06292",
  "bubblegum": "#E94E77",
  "carnation": "#E06D83",
  "petal": "#DF8293",
  "peony": "#D05A7E",
  "watermelon": "#C8465B",
  "pink": "#D84B77",

  // --- Nudes, Neutrals & Browns ---
  "warm nude": "#C88B6E",
  "cool nude": "#B98579",
  "deep nude": "#9A6352",
  "light nude": "#D8A892",
  "nude brown": "#A06A58",
  "nude": "#C48B71",
  "terracotta": "#B84C32",
  "cinnamon": "#9E472A",
  "caramel": "#A65E3A",
  "toffee": "#8A4B29",
  "mocha": "#6F4534",
  "chocolate": "#522E21",
  "cappuccino": "#8B5E43",
  "chestnut": "#6D3929",
  "espresso": "#432616",
  "hazelnut": "#7B4B32",
  "taupe": "#8B6D63",
  "beige": "#C8A287",
  "latte": "#B58A6D",
  "sand": "#C99F7E",
  "tan": "#B37D56",
  "praline": "#9E684B",
  "walnut": "#613824",
  "ginger": "#B05C38",
  "cocoa": "#5C3826",
  "brown": "#6D3826",

  // --- Berries, Plums & Purples ---
  "deep berry": "#6B1336",
  "wild berry": "#7D1A3F",
  "dark plum": "#420F31",
  "plum": "#581845",
  "berry": "#8A1C47",
  "burgundy": "#6B0D23",
  "deep burgundy": "#4E091A",
  "wine": "#5E1929",
  "red wine": "#5E1929",
  "bordeaux": "#5C1D24",
  "merlot": "#621E2C",
  "mulberry": "#701C45",
  "blackberry": "#3D1429",
  "boysenberry": "#521637",
  "cranberry": "#861F38",
  "currant": "#691B2E",
  "blackcurrant": "#40101E",
  "sangria": "#731C39",
  "cabernet": "#58111A",
  "mauve": "#915F6D",
  "deep mauve": "#7A4B59",
  "dusty mauve": "#875C6A",
  "violet": "#7B1FA2",
  "purple": "#6A1B9A",
  "eggplant": "#461237",
  "orchid": "#A0438A",
  "lilac": "#A37081",
  "lavender": "#9C7A97",
  "raisin": "#542A35",

  // --- Corals, Peaches & Oranges ---
  "coral pink": "#E8636E",
  "coral red": "#D9383A",
  "coral": "#E55B5B",
  "peach": "#E88A78",
  "peachy": "#E88A78",
  "peach nude": "#D99380",
  "apricot": "#EB7E5B",
  "salmon": "#E26D5C",
  "papaya": "#E65F45",
  "sunset": "#DE4F38",
  "melon": "#E87063",
  "tangerine": "#F4511E",
  "orange": "#E65100",
  "burnt orange": "#C04A18",
  "amber": "#C76B20",
  "mango": "#E87A38",

  // --- Metallics & Shimmers ---
  "gold": "#C59B27",
  "bronze": "#9C6237",
  "copper": "#A85A32",
  "champagne": "#D1A77E",
};

export const DEFAULT_LIPSTICK_COLOR = "#A2142F";

/**
 * Extracts a valid 6-digit hex code from any string if present.
 * Supports #RGB, #RRGGBB, and raw hex sequences.
 * @param {string} text
 * @returns {string|null} - formatted hex string with '#' or null
 */
export function extractHexCode(text) {
  if (!text || typeof text !== "string") return null;

  // Check for standard #RRGGBB
  const hex6Match = text.match(/#([0-9a-fA-F]{6})\b/);
  if (hex6Match) return `#${hex6Match[1].toUpperCase()}`;

  // Check for #RGB
  const hex3Match = text.match(/#([0-9a-fA-F]{3})\b/);
  if (hex3Match) {
    const [r, g, b] = hex3Match[1].split("");
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }

  // Check for 0xRRGGBB
  const oxMatch = text.match(/0x([0-9a-fA-F]{6})\b/i);
  if (oxMatch) return `#${oxMatch[1].toUpperCase()}`;

  return null;
}

const SORTED_SHADE_ENTRIES = Object.entries(LIPSTICK_SHADE_MAP).sort(
  (a, b) => b[0].length - a[0].length,
);

/**
 * Matches shade names in text against the beauty shade dictionary.
 * Searches multi-word shades first for precision.
 * @param {string} text
 * @returns {string|null} - Hex code if matched, otherwise null
 */
export function matchShadeName(text) {
  if (!text || typeof text !== "string") return null;

  // Clean string: replace hyphens, underscores, slashes, numbers with spaces
  const clean = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return null;

  // Search from longest shade phrase to shortest single-word
  for (const [shade, hex] of SORTED_SHADE_ENTRIES) {
    const regex = new RegExp(`\\b${shade}\\b`, "i");
    if (regex.test(clean)) {
      return hex;
    }
  }

  return null;
}

/**
 * Detects the lipstick finish/type (matte, glossy, sheer, satin, cream, shimmer, metallic)
 * from variant or product text.
 * @param {string} text
 * @returns {string} - 'matte' | 'glossy' | 'sheer' | 'satin' | 'cream' | 'shimmer' | 'metallic'
 */
export function detectLipstickType(text) {
  if (!text || typeof text !== "string") return "matte";

  const lower = text.toLowerCase();
  if (lower.includes("gloss")) return "glossy";
  if (lower.includes("satin")) return "satin";
  if (lower.includes("sheer")) return "sheer";
  if (lower.includes("cream") || lower.includes("creme") || lower.includes("creamy")) return "cream";
  if (lower.includes("shimmer") || lower.includes("glitter") || lower.includes("sparkle")) return "shimmer";
  if (lower.includes("metallic") || lower.includes("foil") || lower.includes("chrome")) return "metallic";
  if (lower.includes("matte") || lower.includes("velvet")) return "matte";

  return "matte";
}

/**
 * Automatically detects lipstick color for a Shopify variant using a multi-step fallback chain:
 * 1. Shopify native option swatch (swatch.color)
 * 2. Hex code in variant options (e.g. Color option = "#D1204B")
 * 3. Shade name in Color/Shade option (e.g. "Ruby Woo", "Dusty Rose")
 * 4. Hex code or shade name in variant title or displayName
 * 5. Parent product title / options fallback
 * 6. Default lipstick red (#A2142F)
 *
 * @param {object} variant - The variant object from Shopify resourcePicker
 * @param {object} [product] - The parent product object
 * @returns {string} - The detected Hex color string (e.g. "#9B111E")
 */
export function detectLipstickColor(variant, product = null) {
  if (!variant) return DEFAULT_LIPSTICK_COLOR;

  // 1. Check for Shopify Native Swatch Color in variant or selectedOptions
  if (variant.swatch?.color) {
    const hex = extractHexCode(variant.swatch.color);
    if (hex) return hex;
  }

  const selectedOptions = Array.isArray(variant.selectedOptions)
    ? variant.selectedOptions
    : [];

  // Inspect specific "Color" / "Shade" / "Colour" option first
  const colorOption = selectedOptions.find((opt) => {
    const name = (opt.name || "").toLowerCase();
    return (
      name.includes("color") ||
      name.includes("colour") ||
      name.includes("shade") ||
      name.includes("tone") ||
      name.includes("hue")
    );
  });

  if (colorOption) {
    // 1a. Native swatch inside optionValue
    if (colorOption.optionValue?.swatch?.color) {
      const hex = extractHexCode(colorOption.optionValue.swatch.color);
      if (hex) return hex;
    }

    const val = String(colorOption.value || "");

    // 1b. Hex in color option value
    const hexFromOption = extractHexCode(val);
    if (hexFromOption) return hexFromOption;

    // 1c. Shade name in color option value
    const shadeFromOption = matchShadeName(val);
    if (shadeFromOption) return shadeFromOption;
  }

  // 2. Check all selected options
  for (const opt of selectedOptions) {
    const val = String(opt.value || "");
    const hex = extractHexCode(val);
    if (hex) return hex;

    const shade = matchShadeName(val);
    if (shade) return shade;
  }

  // 3. Check Variant Title & Display Name
  const variantTitle = String(variant.title || "");
  const variantDisplayName = String(variant.displayName || "");

  const hexFromTitle = extractHexCode(variantTitle) || extractHexCode(variantDisplayName);
  if (hexFromTitle) return hexFromTitle;

  const shadeFromTitle = matchShadeName(variantTitle) || matchShadeName(variantDisplayName);
  if (shadeFromTitle) return shadeFromTitle;

  // 4. Check Parent Product Title
  if (product?.title) {
    const hexFromProd = extractHexCode(product.title);
    if (hexFromProd) return hexFromProd;

    const shadeFromProd = matchShadeName(product.title);
    if (shadeFromProd) return shadeFromProd;
  }

  // 5. Default fallback
  return DEFAULT_LIPSTICK_COLOR;
}
