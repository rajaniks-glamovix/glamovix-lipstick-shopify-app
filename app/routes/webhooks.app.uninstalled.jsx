import { authenticate } from "../shopify.server";
import db from "../db.server";
import { deleteJson, BUCKET_NAME, getS3Key } from "../s3.server";

export const action = async ({ request }) => {
  const { shop, session, topic } = await authenticate.webhook(request);


  // Delete S3 configuration
  try {
    const key = getS3Key(shop);
    await deleteJson(BUCKET_NAME, key);
  } catch (error) {
    console.error(`Error deleting S3 configuration for ${shop}:`, error);
  }

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
