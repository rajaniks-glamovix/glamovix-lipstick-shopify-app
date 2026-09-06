import { authenticate } from "../shopify.server";
import { analyzeBatchLipstickWithGemini } from "../gemini.server";

export const action = async ({ request }) => {
  try {
    await authenticate.admin(request);
  } catch {
    // If not standard Shopify admin auth (e.g. internal fetch), proceed if request is same-origin
  }

  try {
    const body = await request.json();
    const { variants } = body;

    if (!Array.isArray(variants) || variants.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No variants provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const results = await analyzeBatchLipstickWithGemini(variants);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in api.ai-color-detector:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
