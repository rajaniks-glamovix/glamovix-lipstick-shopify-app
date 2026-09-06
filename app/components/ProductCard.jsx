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
  disabled = false,
}) {
  const lipstickTypes = [
    "Velvet Matte",
    "Sheer",
    "High Gloss",
    "Soft Satin",
    "Cream",
    "Luminous Shimmer",
    "Metallic",
  ];

  const isChanged =
    !originalProduct ||
    product.color !== originalProduct.color ||
    String(product.intensity) !== String(originalProduct.intensity) ||
    product.lipstick_type !== originalProduct.lipstick_type;

  const buildPreviewUrl = (isPhotoMode = false) => {
    if (!iframeUrl) {
      console.error("Preview URL is not defined in .env");
      return null;
    }

    const isMatte = (product.lipstick_type || "matte").toLowerCase() === "matte";
    const defaultShimmer = isMatte ? "0.0" : "0.8";

    // Build the URL with parameters
    const params = new URLSearchParams({
      preview: "true",
      product: product.title || "",
      price: product.price || "",
      color: (product.color || "").replace("#", ""),
      intensity: String(product.intensity ?? "5"),
      type: product.lipstick_type || "matte",
      companyName: companyName || "",
      specularIntensity: String(product.specularIntensity ?? "0"),
      specularPower: String(product.specularPower ?? "1"),
      glossBoost: String(product.glossBoost ?? "0"),
      saturationMult: String(product.saturationMult ?? "1"),
      opacityMult: String(product.opacityMult ?? "1"),
      blurMult: String(product.blurMult ?? "0.7"),
      shimmerIntensity: String(product.shimmerIntensity ?? defaultShimmer),
      slider: "true",
    });

    if (isPhotoMode) {
      params.set("photo_mode", "true");
    }

    return `${iframeUrl}${iframeUrl.includes("?") ? "&" : "?"}${params.toString()}`;
  };

  const handlePhotoPreview = () => {
    if (disabled) return;
    const fullUrl = buildPreviewUrl(true);
    if (fullUrl) {
      window.open(fullUrl, "_blank");
    }
  };

  const handleLivePreview = () => {
    if (disabled) return;
    const fullUrl = buildPreviewUrl(false);
    if (fullUrl) {
      window.open(fullUrl, "_blank");
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
              disabled={disabled}
              onChange={() => onToggleSelect(product.id)}
              style={{
                width: "18px",
                height: "18px",
                cursor: disabled ? "not-allowed" : "pointer",
                marginTop: "4px",
                flexShrink: 0,
              }}
            />
            <div style={{ height: "auto", flexGrow: 1, overflow: "hidden" }}>
              <s-heading variant="headingMd" as="h3" truncate>
                {product.title}
              </s-heading>
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
            {/* Color Picker Swatch */}
            <div>
              <s-text
                variant="bodySm"
                tone="subdued"
                as="label"
                style={{ fontSize: "11px", color: "var(--gx-neutral-900)", display: "block", marginBottom: "8px" }}
              >
                Color Swatch
              </s-text>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    position: "relative",
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    backgroundColor: product.color,
                    border: "2px solid var(--gx-surface-light)",
                    boxShadow: "0 0 0 2px var(--gx-noir)",
                    transform: "scale(1.08)",
                    transition: "transform 0.2s ease",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.7 : 1,
                  }}
                >
                  <input
                    type="color"
                    value={product.color}
                    disabled={disabled}
                    onChange={(e) =>
                      onAttributeChange(product.id, "color", e.target.value)
                    }
                    style={{
                      opacity: 0,
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      cursor: disabled ? "not-allowed" : "pointer",
                    }}
                  />
                </div>
                <input
                  type="text"
                  value={product.color}
                  disabled={disabled}
                  onChange={(e) =>
                    onAttributeChange(product.id, "color", e.target.value)
                  }
                  style={{
                    border: "1px solid var(--gx-neutral-200)",
                    borderRadius: "8px",
                    width: "80px",
                    height: "36px",
                    fontSize: "13px",
                    fontFamily: "monospace",
                    outline: "none",
                    color: "var(--gx-neutral-900)",
                    backgroundColor: disabled ? "var(--gx-surface-raised-light)" : "var(--gx-surface-light)",
                    padding: "0 8px",
                    textAlign: "center",
                  }}
                />
              </div>
            </div>

            {/* PROGRESSIVE DISCLOSURE: Advanced Tuning */}
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--gx-neutral-200)", paddingTop: "12px" }}>
              <details>
                <summary
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--gx-gold-600)",
                    cursor: "pointer",
                    listStyle: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <span style={{flex: 1}}>Advanced Shader Tuning</span>
                  <svg viewBox="0 0 20 20" style={{ width: "14px", height: "14px", fill: "currentColor" }}>
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </summary>
                <div style={{ paddingTop: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {/* Intensity Input */}
                  <div>
                    <s-text
                      variant="bodySm"
                      tone="subdued"
                      as="label"
                      style={{ fontSize: "11px", color: "var(--gx-neutral-600)", display: "block" }}
                    >
                      Intensity (1-10)
                    </s-text>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={product.intensity}
                      disabled={disabled}
                      onChange={(e) =>
                        onAttributeChange(product.id, "intensity", e.target.value)
                      }
                      style={{
                        marginTop: "6px",
                        width: "100%",
                        height: "36px",
                        padding: "8px",
                        border: "1px solid var(--gx-neutral-300)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        color: "var(--gx-neutral-900)",
                        backgroundColor: disabled ? "var(--gx-surface-raised-light)" : "var(--gx-surface-light)",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  {/* Lipstick Type Select */}
                  <div>
                    <s-text
                      variant="bodySm"
                      tone="subdued"
                      as="label"
                      style={{ fontSize: "11px", color: "var(--gx-neutral-900)", display: "block", marginBottom: "6px" }}
                    >
                      Finish
                    </s-text>
                    <select
                      value={product.lipstick_type}
                      disabled={disabled}
                      onChange={(e) =>
                        onAttributeChange(product.id, "lipstick_type", e.target.value)
                      }
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "0 12px",
                        border: "1px solid var(--gx-neutral-200)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "var(--gx-neutral-900)",
                        backgroundColor: disabled ? "var(--gx-surface-raised-light)" : "var(--gx-surface-light)",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                    >
                      {lipstickTypes.map((type) => (
                        <option key={type} value={type.toLowerCase()}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </details>
            </div>
          </s-stack>

          {/* ACTION: Preview and Save Buttons */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              marginTop: "10px",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                width: "100%",
              }}
            >
              <s-button
                variant="secondary"
                onClick={handlePhotoPreview}
                disabled={disabled}
                title="Match and preview lipstick shade on a photo"
              >
                Photo Preview
              </s-button>
              <s-button
                variant="secondary"
                onClick={handleLivePreview}
                disabled={disabled}
                title="Match and preview lipstick shade on live camera"
              >
                Live Preview
              </s-button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <s-button
                variant="primary"
                onClick={() => onSave(product)}
                disabled={!isChanged || loading || disabled}
                style={{ minWidth: "120px" }}
              >
                {loading ? (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", justifyContent: "center" }}>
                    <style>{`
                      @keyframes pulseOpacity {
                        0%, 100% { opacity: 0.2; transform: scale(0.8); }
                        50% { opacity: 1; transform: scale(1); }
                      }
                      .loading-dot {
                        width: 6px;
                        height: 6px;
                        background-color: currentColor;
                        border-radius: 50%;
                        animation: pulseOpacity 1.2s ease-in-out infinite;
                      }
                    `}</style>
                    <div className="loading-dot" style={{ animationDelay: "0ms" }} />
                    <div className="loading-dot" style={{ animationDelay: "200ms" }} />
                    <div className="loading-dot" style={{ animationDelay: "400ms" }} />
                  </div>
                ) : (
                  "Save"
                )}
              </s-button>
            </div>
          </div>
        </s-stack>
      </s-card>
    </s-section>
  );
}
