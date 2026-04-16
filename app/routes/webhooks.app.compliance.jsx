import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
    const { admin, session, topic } = await authenticate.webhook(request);
    return new Response();
};