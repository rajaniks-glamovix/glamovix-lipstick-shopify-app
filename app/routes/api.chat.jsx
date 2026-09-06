import { authenticate } from "../shopify.server";
import { generateChatResponse } from "../gemini-chat.server";

export const action = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    await authenticate.admin(request);
  } catch {
    // Allow same-origin internal client fetch if auth header was omitted
  }

  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Message is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const chatResponse = await generateChatResponse({
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
    });

    return new Response(
      JSON.stringify({
        success: true,
        reply: chatResponse.reply,
        actions: chatResponse.actions || [],
        source: chatResponse.source,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
