import { authenticate } from "../shopify.server";
import { readJson, writeToJson, BUCKET_NAME, getS3Key } from "../s3.server";

export const action = async ({ request }) => {
  const { topic, shop, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context is not available for this webhook, but we have the payload
  }

  console.log(`Received webhook for ${topic} on ${shop}`);

  if (topic === "PRODUCTS_UPDATE") {
    try {
      const key = getS3Key(shop);
      let data = await readJson(BUCKET_NAME, key) || { products: [] };

      if (data.products && Array.isArray(data.products)) {
        const productId = `gid://shopify/Product/${payload.id}`;
        // The product_id in dummyData seems to sometimes be Variant ID? 
        // Let's check app.product.jsx logic again.
        // In app.product.jsx: id: value.product_id, productId: value.parent_product_id
        // So product_id is Variant ID and parent_product_id is Product ID.

        let updated = false;
        data.products = data.products.map(p => {
          if (p.parent_product_id === productId) {
            updated = true;
            return {
              ...p,
              title: payload.title,
              img_url: payload.images?.[0]?.src || p.img_url,
              price: payload.variants?.[0]?.price || p.price,
              description: payload.body_html?.replace(/<[^>]*>?/gm, "") || p.description
            };
          }
          return p;
        });

        if (updated) {
          await writeToJson(BUCKET_NAME, key, data);
          console.log(`Updated products for ${productId} in S3 via webhook`);
        }
      }
    } catch (error) {
      console.error("Error updating S3 via webhook:", error);
    }
  }

  return new Response(null, { status: 200 });
};
