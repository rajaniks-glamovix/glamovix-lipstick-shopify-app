import React from "react";

export default function ProductCard({
  product,
  originalProduct,
  isSelected,
  onToggleSelect,
  onAttributeChange,
  onSave,
  iframeUrl,
  loading,
  companyName,
}) {
  const lipstickTypes = [
    "Matte",
    "Sheer",
    "Glossy",
    "Satin",
    "Cream",
    "Shimmer",
    "Metallic",

  ];

  const isChanged =
    !originalProduct ||
    product.color !== originalProduct.color ||
    String(product.intensity) !== String(originalProduct.intensity) ||
    product.lipstick_type !== originalProduct.lipstick_type;


  const handlePreview = () => {
    if (iframeUrl) {
      // Build the URL with parameters
      const params = new URLSearchParams({
        preview: "true",
        product: product.title,
        price: product.price,
        color: product.color.replace("#", ""),
        intensity: product.intensity,
        type: product.lipstick_type,
        companyName,
        specularIntensity: product.specularIntensity,
        specularPower: product.specularPower,
        glossBoost: product.glossBoost,
        saturationMult: product.saturationMult,
        opacityMult: product.opacityMult,
        blurMult: product.blurMult,

      });

      const fullUrl = `${iframeUrl}${iframeUrl.includes("?") ? "&" : "?"}${params.toString()}&photo_mode=true&slider=true`;

      // Opening in a new tab bypasses Shopify's iframe permission restrictions
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } else {
      console.error("Preview URL is not defined in .env");
    }
  };

  return (
    <s-section>
      <s-card>
        <s-stack gap="400">
          {/* CARD HEADER ROW (Checkbox + Title) */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              width: "100%",
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(product.id)}
              style={{
                width: "18px",
                height: "18px",
                cursor: "pointer",
                marginTop: "4px",
                flexShrink: 0,
              }}
            />
            <div style={{ height: "auto", flexGrow: 1, overflow: "hidden" }}>
              <s-heading variant="headingMd" as="h3" truncate>
                {product.title}
              </s-heading>
              {/* <s-text tone="subdued" variant="bodySm">
                {product.price}
              </s-text> */}
            </div>
          </div>

          {/* MIDDLE: Image */}
          <div
            style={{
              width: "100%",
              height: "140px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              overflow: "hidden",
              border: isSelected ? "2px solid #005bd3" : "1px solid #ebebeb",
              boxSizing: "border-box",
            }}
          >
            {product.image ? (
              <img
                src={product.image}
                alt={product.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div style={{ color: "#8c9196" }}>No Image</div>
            )}
          </div>

          {/* BOTTOM: Configuration Fields */}
          <s-stack gap="400">
            {/* Color Picker */}
            <div>
              <s-text
                variant="bodySm"
                tone="subdued"
                as="label"
                style={{ fontSize: "11px", color: "#6d7175", display: "block" }}
              >
                Color
              </s-text>
              <div
                style={{
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "1px solid #8a8a8a",
                  borderRadius: "8px",
                  padding: "4px 12px 4px 4px",
                  height: "36px",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                }}
              >
                <input
                  type="color"
                  value={product.color}
                  onChange={(e) =>
                    onAttributeChange(product.id, "color", e.target.value)
                  }
                  style={{
                    border: "none",
                    width: "40px",
                    height: "26px",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                    padding: "0",
                  }}
                />
                <input
                  type="text"
                  value={product.color}
                  onChange={(e) =>
                    onAttributeChange(product.id, "color", e.target.value)
                  }
                  style={{
                    border: "none",
                    width: "70px",
                    height: "100%",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    outline: "none",
                    color: "#4a4a4a",
                    backgroundColor: "transparent",
                    padding: "0",
                    textAlign: "right",
                  }}
                />
              </div>
            </div>

            {/* Intensity Input */}
            <div>
              <s-text
                variant="bodySm"
                tone="subdued"
                as="label"
                style={{ fontSize: "11px", color: "#6d7175", display: "block" }}
              >
                Intensity (1-10)
              </s-text>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={product.intensity}
                onChange={(e) =>
                  onAttributeChange(product.id, "intensity", e.target.value)
                }
                style={{
                  marginTop: "6px",
                  width: "100%",
                  height: "36px",
                  padding: "8px",
                  border: "1px solid #8a8a8a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#4a4a4a",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Lipstick Type Dropdown */}
            <div>
              <s-text
                variant="bodySm"
                tone="subdued"
                as="label"
                style={{ fontSize: "11px", color: "#6d7175", display: "block" }}
              >
                Type
              </s-text>
              <select
                value={product.lipstick_type}
                onChange={(e) =>
                  onAttributeChange(product.id, "lipstick_type", e.target.value)
                }
                style={{
                  marginTop: "6px",
                  width: "100%",
                  height: "36px",
                  padding: "0 8px",
                  border: "1px solid #8a8a8a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#4a4a4a",
                  backgroundColor: "#fff",
                  boxSizing: "border-box",
                }}
              >
                {lipstickTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </s-stack>

          {/* ACTION: Save and Preview Buttons */}
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <s-button
              variant="primary"
              onClick={() => onSave(product)}
              disabled={!isChanged || loading}
            >
              {loading ? (
                <svg
                  className="spin"
                  viewBox="0 0 20 20"
                  style={{ width: "16px", height: "16px" }}
                >
                  <style>
                    {`
                      .spin { animation: rotate 2s linear infinite; }
                      @keyframes rotate {
                        100% { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                  <path
                    d="M10 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 2c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z"
                    fill="currentColor"
                    opacity="0.2"
                  />
                  <path
                    d="M10 2c4.418 0 8 3.582 8 8h-2c0-3.314-2.686-6-6-6V2z"
                    fill="currentColor"
                  />
                </svg>
              ) : (
                "Save"
              )}
            </s-button>
            <s-button variant="secondary" onClick={handlePreview}>
              Preview
            </s-button>
          </div>
        </s-stack>
      </s-card>
    </s-section>
  );
}
