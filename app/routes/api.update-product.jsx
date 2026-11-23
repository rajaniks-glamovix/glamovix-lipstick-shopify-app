import { readJson, writeToJson, BUCKET_NAME, getS3Key } from "../s3.server";

/**
 * Public API endpoint for third-party applications to update product attributes.
 *
 * POST /api/update-product
 * Content-Type: application/json
 *
 * Body:
 * {
 *   "shop": "your-shop-name",         // Required: shop name (without .myshopify.com)
 *   "productName": "Red Lipstick",     // Required: title of the product to update
 *   "color": "#FF0000",               // Optional: new hex color
 *   "intensity": "7",                 // Optional: new intensity value (string)
 *   "type": "glass",                  // Optional: lipstick type (matte, glossy, glass, satin, etc.)
 *   "productType": "lip_linear"       // Optional: product type ("lipstick" or "lip_linear")
 * }
 *
 * Response:
 * { "success": true, "product": { ...updated product } }
 */

// --- Dynamic CORS & Security Helpers ---

function getCorsHeaders(request) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");
  const origin = request.headers.get("Origin");

  // If origin is in our allowed list, reflect it back. Otherwise, default to first allowed.
  const corsOrigin = allowedOrigins.includes(origin)
    ? origin
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(status, data, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(request),
      "Content-Type": "application/json",
    },
  });
}

/**
 * Public API endpoint for third-party applications to update product attributes.
 */

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(request),
    });
  }

  return jsonResponse(405, { error: "Use POST method" }, request);
};

export const action = async ({ request }) => {
  const corsHeaders = getCorsHeaders(request);

  // 1. Handle CORS Preflight (standard for browsers)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 2. Only allow POST
  if (request.method !== "POST") {
    return jsonResponse(
      405,
      { success: false, error: "Method not allowed" },
      request,
    );
  }

  try {
    // 3. API Key Validation
    const apiKey = request.headers.get("X-API-Key");
    const serverApiKey = process.env.API_KEY;

    if (!serverApiKey || apiKey !== serverApiKey) {
      return jsonResponse(
        401,
        {
          success: false,
          error: "Unauthorized: Invalid or missing API Key",
        },
        request,
      );
    }

    const body = await request.json();


    const {
      shop,
      productName,
      productId,
      id,
      product_id,
      color,
      intensity,
      type,
      lipstick_type,
      lipstickType,
      productType,
      product_type,
      specularIntensity,
      specularPower,
      glossBoost,
      saturationMult,
      opacityMult,
      blurMult,
      shimmerIntensity,
      reflectionOpacity,
      reflectionBlur,
    } = body;

    const lookupTitle = productName || body.title;
    const lookupId = productId || id || product_id;

    // Validate required fields
    if (!shop || (!lookupTitle && !lookupId)) {
      return jsonResponse(
        400,
        {
          success: false,
          error: "Missing required fields: shop and productName/productId are mandatory",
        },
        request,
      );
    }

    const effectiveType = type || lipstick_type || lipstickType;
    const effectiveProductType = productType || product_type;

    // At least one attribute must be provided
    if (
      !color &&
      intensity === undefined &&
      !effectiveType &&
      effectiveProductType === undefined &&
      specularIntensity === undefined &&
      specularPower === undefined &&
      glossBoost === undefined &&
      saturationMult === undefined &&
      opacityMult === undefined &&
      blurMult === undefined &&
      shimmerIntensity === undefined &&
      reflectionOpacity === undefined &&
      reflectionBlur === undefined
    ) {
      return jsonResponse(
        400,
        {
          success: false,
          error:
            "At least one attribute to update is required: color, intensity, type, productType, or shader properties",
        },
        request,
      );
    }

    // Read current data from S3
    const shopName = shop.replace(".myshopify.com", "");
    const key = getS3Key(shopName + ".myshopify.com");
    let data = (await readJson(BUCKET_NAME, key)) || { products: [] };

    if (!data.products || !Array.isArray(data.products)) {
      return jsonResponse(
        404,
        {
          success: false,
          error: "No products found for this shop",
        },
        request,
      );
    }

    // Find the product by ID or title (case-insensitive)
    const productIndex = data.products.findIndex((p) => {
      if (lookupId && (p.product_id === lookupId || p.parent_product_id === lookupId)) {
        return true;
      }
      if (lookupTitle && p.title && p.title.toLowerCase() === lookupTitle.toLowerCase()) {
        return true;
      }
      return false;
    });

    if (productIndex === -1) {
      return jsonResponse(
        404,
        {
          success: false,
          error: `Product "${lookupTitle || lookupId}" not found`,
          availableProducts: data.products.map((p) => p.title),
        },
        request,
      );
    }

    // Update only the provided attributes
    if (color !== undefined) {
      const cleanColor = String(color).trim();
      const isTransparent =
        cleanColor.toLowerCase().replace(/^#/, "") === "none" ||
        cleanColor.toLowerCase() === "clear" ||
        cleanColor.toLowerCase() === "transparent" ||
        cleanColor.toLowerCase() === "#00000000" ||
        cleanColor.toLowerCase() === "00000000";
      data.products[productIndex].color = isTransparent ? "none" : cleanColor;
    }
    if (intensity) data.products[productIndex].intensity = String(intensity);
    if (effectiveType) {
      data.products[productIndex].lipstick_type = effectiveType;
      if (effectiveType.toLowerCase() === "matte" && shimmerIntensity === undefined) {
        data.products[productIndex].shimmerIntensity = "0.0";
      }
      if (effectiveType.toLowerCase() === "glass") {
        if (reflectionOpacity === undefined && data.products[productIndex].reflectionOpacity === undefined) {
          data.products[productIndex].reflectionOpacity = "90";
        }
        if (reflectionBlur === undefined && data.products[productIndex].reflectionBlur === undefined) {
          data.products[productIndex].reflectionBlur = "40";
        }
      }
    }
    if (effectiveProductType !== undefined) {
      data.products[productIndex].product_type = effectiveProductType;
    }
    // new data
    if (specularIntensity !== undefined) data.products[productIndex].specularIntensity = String(specularIntensity);
    if (specularPower !== undefined) data.products[productIndex].specularPower = String(specularPower);
    if (glossBoost !== undefined) data.products[productIndex].glossBoost = String(glossBoost);
    if (saturationMult !== undefined) data.products[productIndex].saturationMult = String(saturationMult);
    if (opacityMult !== undefined) data.products[productIndex].opacityMult = String(opacityMult);
    if (blurMult !== undefined) data.products[productIndex].blurMult = String(blurMult);
    if (shimmerIntensity !== undefined) data.products[productIndex].shimmerIntensity = String(shimmerIntensity);
    if (reflectionOpacity !== undefined) data.products[productIndex].reflectionOpacity = String(reflectionOpacity);
    if (reflectionBlur !== undefined) data.products[productIndex].reflectionBlur = String(reflectionBlur);

    // Write back to S3
    await writeToJson(BUCKET_NAME, key, data);

    const updatedProduct = data.products[productIndex];

    return jsonResponse(
      200,
      {
        success: true,
        message: `Product "${updatedProduct.title || lookupTitle || lookupId}" updated successfully`,
        product: updatedProduct,
      },
      request,
    );
  } catch (error) {
    console.error("API update-product error:", error);
    return jsonResponse(
      500,
      {
        success: false,
        error: "Internal server error",
      },
      request,
    );
  }
};
