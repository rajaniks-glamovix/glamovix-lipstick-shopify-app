import { useState, useEffect } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { readJson, writeToJson, BUCKET_NAME, getS3Key } from "../s3.server";
import ProductCard from "../components/ProductCard";
import {
  MONTHLY_PLAN_ESSENTIAL,
  YEARLY_PLAN_ESSENTIAL,
  MONTHLY_PLAN_BASIC,
  YEARLY_PLAN_BASIC,
  MONTHLY_PLAN_PREMIUM,
  YEARLY_PLAN_PREMIUM,
  MONTHLY_PLAN_ENTERPRISE,
  YEARLY_PLAN_ENTERPRISE,
} from "../billing.constants";
import { formatPrice } from "../utils/currency-utils";

export const loader = async ({ request }) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const iframeUrl = process.env.IFRAME_URL || "https://app.glamovix.com";
  let companyName = session.shop;
  companyName = companyName.replace(".myshopify.com", "");
  const response = await admin.graphql(
    `#graphql
    query getShopCurrency {
      shop {
        currencyCode
      }
    }`,
  );
  const { data: shopData } = await response.json();
  const { currencyCode } = shopData.shop;

  const billingCheck = await billing.check({
    plans: [
      MONTHLY_PLAN_ESSENTIAL,
      YEARLY_PLAN_ESSENTIAL,
      MONTHLY_PLAN_BASIC,
      YEARLY_PLAN_BASIC,
      MONTHLY_PLAN_PREMIUM,
      YEARLY_PLAN_PREMIUM,
      MONTHLY_PLAN_ENTERPRISE,
      YEARLY_PLAN_ENTERPRISE,
    ],
  });

  const activeSubscriptions = billingCheck.appSubscriptions;
  let currentPlan = "None";
  let productLimit = 5; // Default trial limit if no plan

  if (activeSubscriptions.length > 0) {
    currentPlan = activeSubscriptions[0].name;
    if (currentPlan.includes("Essential")) productLimit = 30;
    else if (currentPlan.includes("Basic")) productLimit = 100;
    else if (currentPlan.includes("Premium")) productLimit = 600;
    else if (currentPlan.includes("Enterprise")) productLimit = Infinity;
  }

  try {
    const key = getS3Key(session.shop);
    const data = (await readJson(BUCKET_NAME, key)) || { products: [] };

    const initialProducts = (data.products || []).map((value) => ({
      id: value.product_id,
      productId: value.parent_product_id, // Store for pre-selection
      title: value.title,
      image: value.img_url,
      color: value.color || "#A2142F",
      description: value.description || "",
      price: formatPrice(value.price, currencyCode),
      intensity: value.intensity || "5",
      lipstick_type: value.lipstick_type || "matte",
      specularIntensity: value.specularIntensity || "0",
      specularPower: value.specularPower || "1",
      glossBoost: value.glossBoost || "0",
      saturationMult: value.saturationMult || "1",
      opacityMult: value.opacityMult || "1",
      blurMult: value.blurMult || "0.7",
      shimmerIntensity: value.shimmerIntensity || "0.8",
    }));

    const originalProducts = initialProducts.reduce((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {});

    return {
      initialProducts,
      originalProducts,
      iframeUrl,
      productLimit,
      currentPlan,
      currencyCode,
      companyName,
    };
  } catch (error) {
    console.error("Error reading data from S3:", error);
    return {
      initialProducts: [],
      originalProducts: {},
      iframeUrl,
      productLimit,
      currentPlan,
      currencyCode,
    };
  }
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    const key = getS3Key(session.shop);
    let data = (await readJson(BUCKET_NAME, key)) || { products: [] };
    if (!data.products) data.products = [];

    if (intent === "delete") {
      const titlesToDelete = JSON.parse(formData.get("titles"));
      data.products = data.products.filter(
        (p) => !titlesToDelete.includes(p.title),
      );
      await writeToJson(BUCKET_NAME, key, data);
      return { success: true, message: "Products deleted" };
    }

    if (intent === "save_multiple") {
      const productsToSave = JSON.parse(formData.get("products"));
      productsToSave.forEach((productData) => {
        const newProduct = {
          color: productData.color,
          description: productData.description,
          price: productData.price,
          intensity: productData.intensity,
          title: productData.title,
          img_url: productData.image,
          lipstick_type: productData.lipstick_type,
          product_id: productData.id,
          parent_product_id: productData.productId, // Save parent ID
        };
        const index = data.products.findIndex(
          (p) =>
            p.product_id === productData.id || p.title === productData.title,
        );
        if (index > -1) {
          data.products[index] = newProduct;
        } else {
          data.products.push(newProduct);
        }
      });
      await writeToJson(BUCKET_NAME, key, data);
      return { success: true };
    }

    const productData = JSON.parse(formData.get("product"));
    const newProduct = {
      color: productData.color,
      description: productData.description,
      price: productData.price,
      intensity: productData.intensity,
      title: productData.title,
      img_url: productData.image,
      lipstick_type: productData.lipstick_type,
      product_id: productData.id,
      parent_product_id: productData.productId, // Save parent ID
    };

    const index = data.products.findIndex(
      (p) => p.product_id === productData.id || p.title === productData.title,
    );
    if (index > -1) {
      data.products[index] = newProduct;
    } else {
      data.products.push(newProduct);
    }

    await writeToJson(BUCKET_NAME, key, data);
    return { success: true };
  } catch (error) {
    console.error("Error in action:", error);
    return { success: false, error: error.message };
  }
};

export default function Index() {
  const {
    initialProducts,
    originalProducts,
    iframeUrl,
    productLimit,
    currentPlan,
    currencyCode,
    companyName,
  } = useLoaderData();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const shopify = useAppBridge();

  const [products, setProducts] = useState(initialProducts || []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    if (fetcher.state === "idle") {
      setSavingId(null);
    }
  }, [fetcher.state]);

  // Revalidate (fetch latest data from loader) when returning to the tab
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        revalidator.revalidate();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [revalidator]);

  // Sync local state when revalidation brings new data
  useEffect(() => {
    setProducts(initialProducts || []);
  }, [initialProducts]);

  const handleAddProduct = async () => {
    const remainingSlots = productLimit - products.length;

    if (remainingSlots <= 0) {
      shopify.toast.show(
        `Limit reached! Your ${currentPlan} plan allows up to ${productLimit} products.`,
        { isError: true },
      );
      return;
    }

    // Group current variants by product ID for pre-selection
    const selectionIds = products.reduce((acc, p) => {
      if (!p.productId) return acc;
      const existing = acc.find((item) => item.id === p.productId);
      if (existing) {
        if (!existing.variants) existing.variants = [];
        existing.variants.push({ id: p.id });
      } else {
        acc.push({ id: p.productId, variants: [{ id: p.id }] });
      }
      return acc;
    }, []);

    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: productLimit === Infinity ? true : productLimit,
      selectionIds: selectionIds,
    });

    if (selected) {
      // Flatten all selected variants from all selected products
      const allSelectedVariants = selected.flatMap((p) =>
        p.variants.map((v) => {
          const title =
            v.title === "Default Title"
              ? p.title
              : v.displayName || `${p.title} - ${v.title}`;
          return {
            id: v.id, // Use Variant ID as the unique ID
            productId: p.id, // Store Parent Product ID for pre-selection
            title: title,
            image: v.image?.originalSrc || p.images[0]?.originalSrc,
            color: "#A2142F",
            description: p.descriptionHtml?.replace(/<[^>]*>?/gm, "") || "",
            price: formatPrice(v.price, currencyCode),
            intensity: "5",
            lipstick_type: "matte",
          };
        }),
      );

      // Identify variants that aren't already in our list
      const existingIds = new Set(products.map((p) => p.id));
      const trulyNewVariants = allSelectedVariants.filter(
        (v) => !existingIds.has(v.id),
      );

      if (trulyNewVariants.length > remainingSlots) {
        shopify.toast.show(
          `Your plan only has ${remainingSlots} slots left. Some variants were omitted.`,
          { isError: true },
        );
      }

      const newProductsToAdd = trulyNewVariants.slice(0, remainingSlots);

      setProducts((prev) => [...prev, ...newProductsToAdd]);

      // Automatically select only the newly added products
      const newIds = newProductsToAdd.map((p) => p.id);
      setSelectedIds((prev) => {
        const combined = new Set([...prev, ...newIds]);
        return Array.from(combined);
      });
    }
  };

  const handleSave = (product) => {
    setSavingId(product.id);
    fetcher.submit({ product: JSON.stringify(product) }, { method: "post" });
    shopify.toast.show("Product saved successfully");
  };

  const handleSaveSelected = () => {
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    fetcher.submit(
      { intent: "save_multiple", products: JSON.stringify(selectedProducts) },
      { method: "post" },
    );
    shopify.toast.show(`${selectedIds.length} products saved successfully`);
    setSelectedIds([]);
  };

  const handleAttributeChange = (id, attribute, newValue) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [attribute]: newValue } : p)),
    );
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = () => {
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    const titlesToDelete = selectedProducts.map((p) => p.title);

    fetcher.submit(
      { intent: "delete", titles: JSON.stringify(titlesToDelete) },
      { method: "post" },
    );

    setProducts((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    shopify.toast.show("Products removed");
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <s-page heading="Products">
      <s-stack gap="large">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            backgroundColor: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <s-text tone="subdued">
            <span
              style={{
                fontWeight: "600",
                fontSize: "16px",
                color: products.length >= productLimit ? "#bf0711" : "#1a1c1d",
              }}
            >
              {products.length} /{" "}
              {productLimit === Infinity ? "∞" : productLimit}
            </span>{" "}
            products used
          </s-text>
          <s-button variant="primary" onClick={handleAddProduct}>
            Add product
          </s-button>
        </div>

        {products.length === 0 ? (
          <s-card>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: "#f1f1f1",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                <svg
                  viewBox="0 0 20 20"
                  style={{ width: "40px", height: "40px", fill: "#5c5f62" }}
                >
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 4a1 1 0 112 0 1 1 0 01-2 0zm1 11a7 7 0 110-14 7 7 0 010 14zm1-8h-2v1h1v3h-1v1h3v-1h-1V9z" />
                </svg>
              </div>
              <s-text variant="headingLg" as="h2">
                No products added yet
              </s-text>
              <div style={{ maxWidth: "400px", margin: "12px 0 24px" }}>
                <s-text tone="subdued">
                  Select the products you want to enable for the lipstick
                  virtual try-on experience. You can configure individual colors
                  for each product.
                </s-text>
              </div>
              <s-button variant="primary" onClick={handleAddProduct}>
                Add product
              </s-button>
            </div>
          </s-card>
        ) : (
          <div style={{ width: "100%", paddingBottom: "80px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
                height: "36px",
              }}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  fontSize: "14px",
                  width: "250px",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <style>
              {`
                .product-grid {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 10px;
                  width: 100%;
                }
                @media (max-width: 768px) {
                  .product-grid {
                    grid-template-columns: repeat(2, 1fr);
                  }
                }
              `}
            </style>
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  originalProduct={originalProducts[product.id]}
                  isSelected={selectedIds.includes(product.id)}
                  loading={savingId === product.id}
                  onToggleSelect={handleToggleSelect}
                  onAttributeChange={handleAttributeChange}
                  onSave={handleSave}
                  iframeUrl={iframeUrl}
                  companyName={companyName}
                />
              ))}
            </div>

            {/* Floating Selection Bar */}
            {selectedIds.length > 0 && (
              <div
                style={{
                  position: "fixed",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#1a1a1a",
                  color: "white",
                  padding: "12px 24px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  zIndex: 1000,
                  animation: "slideUp 0.3s ease-out",
                }}
              >
                <style>
                  {`
                    @keyframes slideUp {
                      from { transform: translate(-50%, 100%); opacity: 0; }
                      to { transform: translate(-50%, 0); opacity: 1; }
                    }
                  `}
                </style>
                <s-text>
                  <span style={{ color: "white" }}>
                    {selectedIds.length}{" "}
                    {selectedIds.length === 1 ? "product" : "products"} selected
                  </span>
                </s-text>
                <s-button variant="primary" onClick={handleSaveSelected}>
                  <span style={{ color: "white" }}>Save selected</span>
                </s-button>
                <s-button
                  tone="critical"
                  variant="primary"
                  onClick={handleDeleteSelected}
                >
                  <span style={{ color: "white" }}>Delete selected</span>
                </s-button>
                <s-button variant="tertiary" onClick={() => setSelectedIds([])}>
                  <span style={{ color: "white" }}>Cancel</span>
                </s-button>
              </div>
            )}

            {products.length > 0 && filteredProducts.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                No products found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </s-stack>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
