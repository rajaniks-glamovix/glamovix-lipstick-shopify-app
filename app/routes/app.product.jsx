/* global process */
import { useState, useEffect, useRef } from "react";
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
import { detectLipstickColor, detectLipstickType } from "../utils/color-detector";

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

    const initialProducts = (data.products || []).map((value) => {
      const isMatte = (value.lipstick_type || "matte").toLowerCase() === "matte";
      const defaultShimmer = isMatte ? "0.0" : "0.8";
      return {
        id: value.product_id || value.title,
        productId: value.parent_product_id, // Load parent ID
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
        shimmerIntensity:
          value.shimmerIntensity !== undefined
            ? String(value.shimmerIntensity)
            : defaultShimmer,
      };
    });

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
        const isMatte =
          (productData.lipstick_type || "matte").toLowerCase() === "matte";
        const defaultShimmer = isMatte ? "0.0" : "0.8";

        const newProduct = {
          color: productData.color,
          description: productData.description,
          price: productData.price,
          intensity: String(productData.intensity ?? "5"),
          title: productData.title,
          img_url: productData.image,
          lipstick_type: productData.lipstick_type || "matte",
          product_id: productData.id,
          parent_product_id: productData.productId, // Save parent ID
          specularIntensity: String(productData.specularIntensity ?? "0"),
          specularPower: String(productData.specularPower ?? "1"),
          glossBoost: String(productData.glossBoost ?? "0"),
          saturationMult: String(productData.saturationMult ?? "1"),
          opacityMult: String(productData.opacityMult ?? "1"),
          blurMult: String(productData.blurMult ?? "0.7"),
          shimmerIntensity: String(
            productData.shimmerIntensity ?? defaultShimmer,
          ),
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
      return { success: true, count: productsToSave.length };
    }

    const productData = JSON.parse(formData.get("product"));
    const isMatte =
      (productData.lipstick_type || "matte").toLowerCase() === "matte";
    const defaultShimmer = isMatte ? "0.0" : "0.8";

    const newProduct = {
      color: productData.color,
      description: productData.description,
      price: productData.price,
      intensity: String(productData.intensity ?? "5"),
      title: productData.title,
      img_url: productData.image,
      lipstick_type: productData.lipstick_type || "matte",
      product_id: productData.id,
      parent_product_id: productData.productId, // Save parent ID
      specularIntensity: String(productData.specularIntensity ?? "0"),
      specularPower: String(productData.specularPower ?? "1"),
      glossBoost: String(productData.glossBoost ?? "0"),
      saturationMult: String(productData.saturationMult ?? "1"),
      opacityMult: String(productData.opacityMult ?? "1"),
      blurMult: String(productData.blurMult ?? "0.7"),
      shimmerIntensity: String(productData.shimmerIntensity ?? defaultShimmer),
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
    return { success: true, count: 1 };
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
  const shopify = useAppBridge();
  const revalidator = useRevalidator();

  const [products, setProducts] = useState(initialProducts || []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [savingId, setSavingId] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);

  const prevInitialProductsRef = useRef(initialProducts);

  useEffect(() => {
    if (fetcher.state === "idle") {
      setSavingId(null);
    }
  }, [fetcher.state]);

  // Toast feedback on action completion
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        if (fetcher.data.message) {
          shopify.toast.show(fetcher.data.message);
        } else if (fetcher.data.count > 1) {
          shopify.toast.show(`${fetcher.data.count} products saved successfully`);
        } else {
          shopify.toast.show("Product saved successfully");
        }
      } else if (fetcher.data.error) {
        shopify.toast.show(`Error: ${fetcher.data.error}`, { isError: true });
      }
    }
  }, [fetcher.data, shopify]);

  // Sync local state when revalidation brings new data from S3 without overwriting other unsaved products
  useEffect(() => {
    if (!initialProducts) return;

    setProducts((prevProducts) => {
      if (prevProducts.length === 0) {
        prevInitialProductsRef.current = initialProducts;
        return initialProducts;
      }

      const prevSavedMap = new Map(
        (prevInitialProductsRef.current || []).map((p) => [p.id, p]),
      );
      const newSavedMap = new Map(initialProducts.map((p) => [p.id, p]));

      // Update existing products: update newly saved ones from S3, preserve unsaved local edits only if S3 didn't change
      const updated = prevProducts.map((p) => {
        if (newSavedMap.has(p.id)) {
          const newSaved = newSavedMap.get(p.id);
          const prevSaved = prevSavedMap.get(p.id);

          // If this card was explicitly saved via UI
          if (savingId === p.id) {
            return newSaved;
          }

          // Check if S3 data changed compared to what was previously loaded
          const isS3Updated =
            !prevSaved ||
            newSaved.color !== prevSaved.color ||
            String(newSaved.intensity) !== String(prevSaved.intensity) ||
            newSaved.lipstick_type !== prevSaved.lipstick_type ||
            newSaved.specularIntensity !== prevSaved.specularIntensity ||
            newSaved.specularPower !== prevSaved.specularPower ||
            newSaved.glossBoost !== prevSaved.glossBoost ||
            newSaved.saturationMult !== prevSaved.saturationMult ||
            newSaved.opacityMult !== prevSaved.opacityMult ||
            newSaved.blurMult !== prevSaved.blurMult ||
            newSaved.shimmerIntensity !== prevSaved.shimmerIntensity;

          if (isS3Updated) {
            // S3 has newer data (e.g. from Live Preview "Apply changes" or external sync) -> adopt new data immediately!
            return newSaved;
          }

          // If S3 hasn't changed, check if user locally made unsaved edits on this card in the admin UI
          const isLocallyModified =
            prevSaved &&
            (p.color !== prevSaved.color ||
              String(p.intensity) !== String(prevSaved.intensity) ||
              p.lipstick_type !== prevSaved.lipstick_type);

          if (isLocallyModified) {
            return p;
          }

          return newSaved;
        }

        // Newly added variant not yet in S3: keep it
        return p;
      });

      // Add any products that exist in initialProducts but not in prevProducts
      for (const saved of initialProducts) {
        if (!prevProducts.some((p) => p.id === saved.id)) {
          updated.push(saved);
        }
      }

      prevInitialProductsRef.current = initialProducts;
      return updated;
    });
  }, [initialProducts, savingId]);

  // Revalidate immediately on tab focus or visibility change
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (
        document.visibilityState === "visible" &&
        revalidator.state === "idle" &&
        fetcher.state === "idle"
      ) {
        revalidator.revalidate();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [revalidator, fetcher.state]);

  // Listen for postMessage from Live Preview / Glamovix iframe or opened window
  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;

      const isSaveEvent =
        event.data?.type === "product_updated" ||
        event.data?.type === "apply_changes" ||
        event.data?.action === "apply_changes" ||
        event.data?.event === "apply_changes" ||
        event.data === "apply_changes" ||
        event.data === "product_updated";

      if (isSaveEvent) {
        // If message contains product payload, update state immediately
        const payload =
          event.data?.product ||
          event.data?.data ||
          (typeof event.data === "object" ? event.data : null);

        if (
          payload &&
          (payload.productName ||
            payload.title ||
            payload.productId ||
            payload.id)
        ) {
          const title = payload.productName || payload.title;
          const id = payload.productId || payload.id;
          setProducts((prev) =>
            prev.map((p) => {
              const matches =
                (id && (p.id === id || p.productId === id)) ||
                (title &&
                  p.title &&
                  p.title.toLowerCase() === title.toLowerCase());
              if (!matches) return p;

              const isMatte =
                (
                  payload.type ||
                  payload.lipstick_type ||
                  p.lipstick_type ||
                  ""
                ).toLowerCase() === "matte";
              return {
                ...p,
                ...(payload.color ? { color: payload.color } : {}),
                ...(payload.intensity !== undefined
                  ? { intensity: String(payload.intensity) }
                  : {}),
                ...(payload.type || payload.lipstick_type
                  ? { lipstick_type: payload.type || payload.lipstick_type }
                  : {}),
                ...(payload.specularIntensity !== undefined
                  ? { specularIntensity: String(payload.specularIntensity) }
                  : {}),
                ...(payload.specularPower !== undefined
                  ? { specularPower: String(payload.specularPower) }
                  : {}),
                ...(payload.glossBoost !== undefined
                  ? { glossBoost: String(payload.glossBoost) }
                  : {}),
                ...(payload.saturationMult !== undefined
                  ? { saturationMult: String(payload.saturationMult) }
                  : {}),
                ...(payload.opacityMult !== undefined
                  ? { opacityMult: String(payload.opacityMult) }
                  : {}),
                ...(payload.blurMult !== undefined
                  ? { blurMult: String(payload.blurMult) }
                  : {}),
                ...(payload.shimmerIntensity !== undefined
                  ? { shimmerIntensity: String(payload.shimmerIntensity) }
                  : isMatte
                  ? { shimmerIntensity: "0.0" }
                  : {}),
              };
            }),
          );
        }

        // Trigger loader revalidation to sync with S3 only when changes are explicitly applied/saved
        if (revalidator.state === "idle" && fetcher.state === "idle") {
          revalidator.revalidate();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [revalidator, fetcher.state]);

  // Gentle periodic polling (3s) when active to catch changes if preview and dashboard are side-by-side
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        document.visibilityState === "visible" &&
        revalidator.state === "idle" &&
        fetcher.state === "idle" &&
        aiStatus?.state !== "analyzing"
      ) {
        revalidator.revalidate();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [revalidator, fetcher.state, aiStatus?.state]);

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
          const detectedColor = detectLipstickColor(v, p);
          const detectedType = detectLipstickType(
            `${v.title || ""} ${v.displayName || ""} ${p.title || ""}`
          );
          const isMatte = (detectedType || "").toLowerCase() === "matte";

          return {
            id: v.id, // Use Variant ID as the unique ID
            productId: p.id, // Store Parent Product ID for pre-selection
            title: title,
            image: v.image?.originalSrc || p.images[0]?.originalSrc,
            color: detectedColor,
            description: p.descriptionHtml?.replace(/<[^>]*>?/gm, "") || "",
            price: formatPrice(v.price, currencyCode),
            intensity: "5",
            lipstick_type: detectedType,
            shimmerIntensity: isMatte ? "0.0" : "0.8",
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

      // Background AI Color & Texture Detection with Gemini Vision (Progressive Chunked Queue)
      const variantsToAnalyze = newProductsToAdd.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        productTitle: item.title,
      }));

      if (variantsToAnalyze.length > 0) {
        const total = variantsToAnalyze.length;
        setAiStatus({ state: "analyzing", processed: 0, total });

        // Process queue in small chunks of 3 for sub-2s responses, zero timeouts, and rate pacing
        const queue = [...variantsToAnalyze];
        const CHUNK_SIZE = 3;
        let processed = 0;

        (async () => {
          while (queue.length > 0) {
            const chunk = queue.splice(0, CHUNK_SIZE);
            try {
              const res = await fetch("/api/ai-color-detector", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ variants: chunk }),
              });
              const data = await res.json();
              if (data.success && Array.isArray(data.results)) {
                const resultMap = new Map(data.results.map((r) => [r.id, r]));
                setProducts((prev) =>
                  prev.map((p) => {
                    const aiResult = resultMap.get(p.id);
                    if (aiResult && aiResult.color) {
                      const finalType =
                        aiResult.lipstick_type || p.lipstick_type || "matte";
                      const isMatteType = finalType.toLowerCase() === "matte";
                      return {
                        ...p,
                        color: aiResult.color,
                        lipstick_type: finalType,
                        intensity: aiResult.intensity || p.intensity,
                        shimmerIntensity: isMatteType
                          ? "0.0"
                          : p.shimmerIntensity === "0.0"
                          ? "0.8"
                          : p.shimmerIntensity || "0.8",
                      };
                    }
                    return p;
                  }),
                );
              }
            } catch (err) {
              console.warn(
                "AI detection chunk failed, fallback preserved:",
                err,
              );
            }

            processed += chunk.length;
            setAiStatus({
              state: "analyzing",
              processed: Math.min(processed, total),
              total,
            });

            // Gentle pacing delay (250ms) between chunks to stay well below rate limits
            if (queue.length > 0) {
              await new Promise((resolve) => setTimeout(resolve, 250));
            }
          }

          setAiStatus({ state: "completed", processed: total, total });
          setTimeout(() => {
            setAiStatus(null);
          }, 3500);
        })();
      }
    }
  };

  const isAiAnalyzing = aiStatus?.state === "analyzing";
  const isBatchSaving =
    fetcher.state !== "idle" &&
    fetcher.formData?.get("intent") === "save_multiple";

  const handleSave = (product) => {
    if (isAiAnalyzing || fetcher.state !== "idle") return;
    setSavingId(product.id);
    fetcher.submit({ product: JSON.stringify(product) }, { method: "post" });
  };

  const handleSaveSelected = () => {
    if (isAiAnalyzing || fetcher.state !== "idle") return;
    const selectedProducts = products.filter((p) => selectedIds.includes(p.id));
    if (selectedProducts.length === 0) return;
    fetcher.submit(
      { intent: "save_multiple", products: JSON.stringify(selectedProducts) },
      { method: "post" },
    );
    setSelectedIds([]);
  };

  const handleAttributeChange = (id, attribute, newValue) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = { ...p, [attribute]: newValue };
        if (attribute === "lipstick_type") {
          if (newValue.toLowerCase() === "matte") {
            updated.shimmerIntensity = "0.0";
          } else if (p.shimmerIntensity === "0.0") {
            updated.shimmerIntensity = "0.8";
          }
        }
        return updated;
      }),
    );
  };

  const handleToggleSelect = (id) => {
    if (isAiAnalyzing) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleDeleteSelected = () => {
    if (isAiAnalyzing || fetcher.state !== "idle") return;
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

  const handleDeleteProduct = (productToDelete) => {
    if (isAiAnalyzing || fetcher.state !== "idle") return;
    fetcher.submit(
      { intent: "delete", titles: JSON.stringify([productToDelete.title]) },
      { method: "post" },
    );

    setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
    setSelectedIds((prev) => prev.filter((id) => id !== productToDelete.id));
    shopify.toast.show(`Removed ${productToDelete.title}`);
  };

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch = product.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesType =
        typeFilter === "all" ||
        (product.lipstick_type || "").toLowerCase() ===
          typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return 0;
      } else if (sortBy === "name_asc") {
        return (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "name_desc") {
        return (b.title || "").localeCompare(a.title || "");
      } else if (sortBy === "intensity_desc") {
        return (Number(b.intensity) || 0) - (Number(a.intensity) || 0);
      } else if (sortBy === "intensity_asc") {
        return (Number(a.intensity) || 0) - (Number(b.intensity) || 0);
      }
      return 0;
    });

  return (
    <s-page heading="Products">
      {/* Top Floating AI Notification Pill */}
      {aiStatus && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 20px",
            borderRadius: "30px",
            backgroundColor:
              aiStatus.state === "analyzing" ? "#18181b" : "#064e3b",
            color: "#ffffff",
            boxShadow:
              "0 10px 25px -5px rgba(0,0,0,0.3), 0 8px 10px -6px rgba(0,0,0,0.3)",
            fontSize: "13px",
            fontWeight: "500",
            animation: "aiSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <style>
            {`
              @keyframes aiSlideDown {
                from { transform: translate(-50%, -100%); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
              }
              @keyframes aiSpin {
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          {aiStatus.state === "analyzing" ? (
            <>
              <svg
                viewBox="0 0 24 24"
                style={{
                  width: "16px",
                  height: "16px",
                  animation: "aiSpin 1s linear infinite",
                  fill: "#818cf8",
                }}
              >
                <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a7 7 0 017 7h-2a5 5 0 00-5-5V5z" />
              </svg>
              <span>
                AI is analyzing lipstick shades ({aiStatus.processed}/
                {aiStatus.total})...
              </span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 20 20"
                style={{ width: "16px", height: "16px", fill: "#34d399" }}
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                AI shade &amp; finish detection complete! ({aiStatus.total}/
                {aiStatus.total})
              </span>
            </>
          )}
        </div>
      )}

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
          <s-button
            variant="primary"
            onClick={handleAddProduct}
            disabled={isAiAnalyzing}
          >
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
              <s-button
                variant="primary"
                onClick={handleAddProduct}
                disabled={isAiAnalyzing}
              >
                Add product
              </s-button>
            </div>
          </s-card>
        ) : (
          <div style={{ width: "100%", paddingBottom: "80px" }}>
            <div className="products-filter-bar">
              {/* Search Bar on Left */}
              <div className="products-search-wrap">
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    left: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    height: "38px",
                    padding: "8px 12px 8px 38px",
                    border: "1.5px solid #E5E7EB",
                    borderRadius: "10px",
                    fontSize: "13.5px",
                    color: "#111827",
                    backgroundColor: "#FFFFFF",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#635BFF")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
              </div>

              {/* Filter & Sort Controls on Right */}
              <div className="products-controls-wrap">
                {/* Type Filter */}
                <div className="products-select-box">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      width: "100%",
                      height: "38px",
                      padding: "8px 32px 8px 14px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontWeight: "500",
                      color: "#374151",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="matte">Matte</option>
                    <option value="glossy">Glossy</option>
                    <option value="sheer">Sheer</option>
                    <option value="satin">Satin</option>
                    <option value="cream">Cream</option>
                    <option value="shimmer">Shimmer</option>
                    <option value="metallic">Metallic</option>
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>

                {/* Sort By */}
                <div className="products-select-box">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      appearance: "none",
                      WebkitAppearance: "none",
                      width: "100%",
                      height: "38px",
                      padding: "8px 32px 8px 14px",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontWeight: "500",
                      color: "#374151",
                      backgroundColor: "#FFFFFF",
                      cursor: "pointer",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="oldest">Sort by: Oldest</option>
                    <option value="name_asc">Sort by: Name (A-Z)</option>
                    <option value="name_desc">Sort by: Name (Z-A)</option>
                    <option value="intensity_desc">Sort by: Intensity (High-Low)</option>
                    <option value="intensity_asc">Sort by: Intensity (Low-High)</option>
                  </select>
                  <svg
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                    }}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            <style>
              {`
                .products-filter-bar {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 20px;
                  flex-wrap: wrap;
                  gap: 12px;
                }
                .products-search-wrap {
                  position: relative;
                  width: 320px;
                  max-width: 100%;
                }
                .products-controls-wrap {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                .products-select-box {
                  position: relative;
                }
                .product-grid {
                  display: grid;
                  grid-template-columns: repeat(4, 1fr);
                  gap: 16px;
                  width: 100%;
                }
                @media (max-width: 1200px) {
                  .product-grid {
                    grid-template-columns: repeat(3, 1fr);
                  }
                }
                @media (max-width: 860px) {
                  .products-filter-bar {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                  }
                  .products-search-wrap {
                    width: 100%;
                  }
                  .products-controls-wrap {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    width: 100%;
                  }
                  .products-select-box {
                    width: 100%;
                  }
                  .product-grid {
                    grid-template-columns: 1fr;
                    gap: 14px;
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
                  disabled={isAiAnalyzing}
                  onToggleSelect={handleToggleSelect}
                  onAttributeChange={handleAttributeChange}
                  onSave={handleSave}
                  onDelete={handleDeleteProduct}
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
                  opacity: isAiAnalyzing || fetcher.state !== "idle" ? 0.85 : 1,
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
                <s-button
                  variant="primary"
                  onClick={handleSaveSelected}
                  loading={isAiAnalyzing || isBatchSaving ? "true" : undefined}
                  disabled={isAiAnalyzing || fetcher.state !== "idle"}
                >
                  <span style={{ color: "white" }}>
                    {isAiAnalyzing
                      ? `AI Analyzing (${aiStatus.processed}/${aiStatus.total})...`
                      : isBatchSaving
                      ? "Saving..."
                      : "Save selected"}
                  </span>
                </s-button>
                <s-button
                  tone="critical"
                  variant="primary"
                  onClick={handleDeleteSelected}
                  disabled={isAiAnalyzing || fetcher.state !== "idle"}
                >
                  <span style={{ color: "white" }}>Delete selected</span>
                </s-button>
                <s-button
                  variant="tertiary"
                  onClick={() => setSelectedIds([])}
                  disabled={isAiAnalyzing || fetcher.state !== "idle"}
                >
                  <span style={{ color: "white" }}>Cancel</span>
                </s-button>
              </div>
            )}

            {products.length > 0 && filteredProducts.length === 0 && (
              <div
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                No products found matching &quot;{searchQuery}&quot;
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
