/* eslint-disable react/prop-types */
import { useState, useRef, useEffect, useCallback } from "react";

export default function ProductCard({
  product,
  isSelected,
  onToggleSelect,
  onDelete,
  iframeUrl,
  loading = false,
  companyName,
  disabled = false,
}) {
  const isActionDisabled = disabled || loading;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [modalIframeUrl, setModalIframeUrl] = useState("");

  const menuRef = useRef(null);
  const iframeRef = useRef(null);
  const modalContainerRef = useRef(null);

  const buildPreviewUrl = useCallback(
    (isPhotoMode = true, targetProd = product) => {
      if (!iframeUrl) {
        console.error("Preview URL is not defined in .env");
        return null;
      }

      const isMatte =
        (targetProd.lipstick_type || "matte").toLowerCase() === "matte";
      const defaultShimmer = isMatte ? "0.0" : "0.8";

      const params = new URLSearchParams({
        preview: "true",
        product: targetProd.title || "",
        price: targetProd.price || "",
        color: (targetProd.color || "").replace("#", ""),
        intensity: String(targetProd.intensity ?? "5"),
        type: targetProd.lipstick_type || "matte",
        companyName: companyName || "",
        specularIntensity: String(targetProd.specularIntensity ?? "0"),
        specularPower: String(targetProd.specularPower ?? "1"),
        glossBoost: String(targetProd.glossBoost ?? "0"),
        saturationMult: String(targetProd.saturationMult ?? "1"),
        opacityMult: String(targetProd.opacityMult ?? "1"),
        blurMult: String(targetProd.blurMult ?? "0.7"),
        shimmerIntensity: String(targetProd.shimmerIntensity ?? defaultShimmer),
        slider: "true",
        temp: String(Date.now()),
      });

      if (isPhotoMode) {
        params.set("photo_mode", "true");
      }

      return `${iframeUrl}${iframeUrl.includes("?") ? "&" : "?"}${params.toString()}`;
    },
    [companyName, iframeUrl, product]
  );

  const handleCloseEditPopup = useCallback(() => {
    setEditModalOpen(false);
    setModalIframeUrl("");
  }, []);

  const handleOpenTryonPreview = useCallback(() => {
    if (isActionDisabled) return;
    const variantId = String(product.id || "").split("/").pop();
    const cleanCompany = (companyName || "").replace(".myshopify.com", "");
    const baseUrl = (iframeUrl || "https://app.glamovix.com").replace(/\/+$/, "");
    const url = `${baseUrl}/?companyName=${encodeURIComponent(cleanCompany)}&product=${encodeURIComponent(variantId)}`;
    window.open(url, "_blank");
  }, [companyName, iframeUrl, isActionDisabled, product.id]);

  const handleOpenNewTab = useCallback(() => {
    const url = modalIframeUrl || buildPreviewUrl(true, product);
    if (url) {
      window.open(url, "_blank");
    }
  }, [modalIframeUrl, buildPreviewUrl, product]);

  // Close modal on Escape
  useEffect(() => {
    if (!editModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseEditPopup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editModalOpen, handleCloseEditPopup]);

  // Listen for messages from edit iframe
  useEffect(() => {
    if (!editModalOpen) return;
    const handleModalMessage = (event) => {
      if (!event.data) return;
      const type =
        event.data?.type ||
        event.data?.action ||
        event.data?.event ||
        event.data;
      if (
        type === "close" ||
        type === "close_modal" ||
        type === "close_popup" ||
        type === "close_edit_popup" ||
        type === "close_studio"
      ) {
        handleCloseEditPopup();
      }
    };
    window.addEventListener("message", handleModalMessage);
    return () => window.removeEventListener("message", handleModalMessage);
  }, [editModalOpen, handleCloseEditPopup]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenEditPopup = () => {
    if (isActionDisabled) return;
    setModalIframeUrl(buildPreviewUrl(true, product));
    setEditModalOpen(true);
  };

  const formattedType = (product.lipstick_type || "Glossy")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

  return (
    <>
      <style>{`
        .glamovix-product-card {
          background-color: #ffffff;
          border-radius: 16px;
          padding: 16px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .glamovix-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 12px;
          position: relative;
          order: 1;
        }

        .glamovix-card-image-wrap {
          width: 100%;
          height: 170px;
          background-color: #F9FAFB;
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 8px;
          box-sizing: border-box;
          order: 2;
        }

        .glamovix-card-color-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          order: 3;
        }

        .glamovix-card-specs-row {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #F3F4F6;
          order: 4;
        }

        .glamovix-card-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
          position: relative;
          order: 5;
        }

        /* Responsive Horizontal Card on Tablet & Mobile (<= 860px) */
        @media (max-width: 860px) {
          .glamovix-product-card {
            display: grid !important;
            grid-template-columns: 140px 1fr !important;
            grid-template-rows: auto auto auto auto !important;
            grid-template-areas:
              "image header"
              "image color"
              "image specs"
              "image actions" !important;
            gap: 0 16px !important;
            align-items: start !important;
            padding: 14px !important;
          }

          .glamovix-card-image-wrap {
            grid-area: image !important;
            width: 140px !important;
            height: 140px !important;
            border-radius: 12px !important;
            padding: 6px !important;
            margin-bottom: 0 !important;
          }

          .glamovix-card-header {
            grid-area: header !important;
            margin-bottom: 6px !important;
          }

          .glamovix-card-header h3 {
            font-size: 14px !important;
            min-height: auto !important;
            line-height: 1.25 !important;
          }

          .glamovix-card-color-row {
            grid-area: color !important;
            margin-top: 0 !important;
            margin-bottom: 8px !important;
          }

          .glamovix-card-specs-row {
            grid-area: specs !important;
            margin-top: 0 !important;
            padding-top: 8px !important;
            margin-bottom: 10px !important;
          }

          .glamovix-card-actions {
            grid-area: actions !important;
            margin-top: 0 !important;
            gap: 8px !important;
          }

          .glamovix-card-actions button {
            min-height: 38px !important;
            padding: 6px 8px !important;
          }
        }

        @media (max-width: 480px) {
          .glamovix-product-card {
            grid-template-columns: 110px 1fr !important;
            gap: 0 12px !important;
            padding: 12px !important;
          }

          .glamovix-card-image-wrap {
            width: 110px !important;
            height: 110px !important;
          }

          .glamovix-card-header h3 {
            font-size: 13.5px !important;
          }

          .glamovix-card-color-row span {
            font-size: 12px !important;
          }

          .glamovix-card-actions button {
            font-size: 12px !important;
          }
        }

        @keyframes glamovixModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes glamovixModalScaleIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div
        className="glamovix-product-card"
        style={{
          border: isSelected ? "1.5px solid #635BFF" : "1px solid #E5E7EB",
          boxShadow: isSelected
            ? "0 0 0 3px rgba(99, 91, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)"
            : "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        }}
      >
        {/* CARD HEADER ROW: Checkbox, Title, Three-dots menu */}
        <div className="glamovix-card-header">
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              flex: 1,
              minWidth: 0,
            }}
          >
            {/* Custom styled checkbox */}
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: disabled ? "not-allowed" : "pointer",
                marginTop: "2px",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                disabled={disabled}
                onChange={() => onToggleSelect(product.id)}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  width: "18px",
                  height: "18px",
                  border: isSelected
                    ? "2px solid #635BFF"
                    : "1.5px solid #CBD5E1",
                  borderRadius: "4px",
                  backgroundColor: isSelected ? "#635BFF" : "#FFFFFF",
                  display: "inline-grid",
                  placeContent: "center",
                  cursor: disabled ? "not-allowed" : "pointer",
                  transition: "all 0.15s ease",
                  margin: 0,
                }}
              />
              {isSelected && (
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  style={{
                    position: "absolute",
                    width: "11px",
                    height: "11px",
                    pointerEvents: "none",
                  }}
                >
                  <path
                    d="M3 7.5L5.5 10L11 4.5"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </label>

            {/* Product Title */}
            <h3
              title={product.title}
              style={{
                margin: 0,
                fontSize: "14.5px",
                fontWeight: "700",
                color: "#111827",
                lineHeight: "1.3",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minHeight: "38px",
                flex: 1,
              }}
            >
              {product.title}
            </h3>
          </div>

          {/* Three Dots Menu Button */}
          <div style={{ position: "relative" }} ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              disabled={disabled}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px",
                borderRadius: "6px",
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#9CA3AF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "26px",
                height: "26px",
                transition: "all 0.15s ease",
              }}
              title="Card options"
              onMouseEnter={(e) => (e.currentTarget.style.color = "#4B5563")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9CA3AF")}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {/* Three Dots Dropdown Menu */}
            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  right: "0",
                  width: "160px",
                  backgroundColor: "#FFFFFF",
                  borderRadius: "8px",
                  boxShadow:
                    "0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)",
                  border: "1px solid #E5E7EB",
                  padding: "4px",
                  zIndex: 100,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleOpenEditPopup();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 10px",
                    fontSize: "12.5px",
                    fontWeight: "500",
                    color: "#374151",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F3F4F6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleOpenTryonPreview();
                  }}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 10px",
                    fontSize: "12.5px",
                    fontWeight: "500",
                    color: "#374151",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#F3F4F6")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#635BFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span style={{ flex: 1 }}>Try-On Preview</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
                {onDelete && (
                  <>
                    <div
                      style={{
                        height: "1px",
                        backgroundColor: "#E5E7EB",
                        margin: "4px 0",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(product);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "7px 10px",
                        fontSize: "12.5px",
                        fontWeight: "500",
                        color: "#DC2626",
                        backgroundColor: "transparent",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#FEE2E2")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE: Product Image */}
        <div className="glamovix-card-image-wrap">
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                color: "#9CA3AF",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span style={{ fontSize: "12px" }}>No Image</span>
            </div>
          )}
        </div>

        {/* COLOR & TYPE PILL ROW */}
        <div className="glamovix-card-color-row">
          {/* Swatch circle */}
          <div
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: product.color || "#b1022e",
              boxShadow:
                "inset 0 0 0 1px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)",
              flexShrink: 0,
            }}
          />
          {/* Hex code text */}
          <span
            style={{
              fontSize: "13px",
              fontWeight: "500",
              color: "#4B5563",
              letterSpacing: "0.2px",
            }}
          >
            {product.color || "#b1022e"}
          </span>

          {/* Type Badge Pill */}
          <span
            style={{
              marginLeft: "6px",
              padding: "3px 10px",
              backgroundColor: "#FAF5FF",
              color: "#7C3AED",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
              letterSpacing: "0.1px",
            }}
          >
            {formattedType}
          </span>
        </div>

        {/* ATTRIBUTES ROW: Intensity & Type */}
        <div className="glamovix-card-specs-row">
          {/* Left: Intensity */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Intensity
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#1F2937",
                  fontWeight: "600",
                  lineHeight: "1.3",
                }}
              >
                {product.intensity || 5} / 10
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div
            style={{
              width: "1px",
              height: "28px",
              backgroundColor: "#E5E7EB",
              margin: "0 6px",
            }}
          />

          {/* Right: Type */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B7280"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#9CA3AF",
                  fontWeight: "500",
                  lineHeight: "1.2",
                }}
              >
                Type
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#1F2937",
                  fontWeight: "600",
                  lineHeight: "1.3",
                }}
              >
                {formattedType}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS: Preview and Edit */}
        <div className="glamovix-card-actions">
          {/* Preview Button (Direct Try-On Experience with External Redirect Icon) */}
          <button
            type="button"
            onClick={handleOpenTryonPreview}
            disabled={disabled}
            title="Open live try-on in new tab"
            style={{
              width: "100%",
              minHeight: "42px",
              backgroundColor: "#FAF8FF",
              border: "1.5px solid #EDE9FE",
              borderRadius: "10px",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              cursor: disabled ? "not-allowed" : "pointer",
              color: "#5B21B6",
              fontSize: "13.5px",
              fontWeight: "600",
              transition: "all 0.15s ease",
              outline: "none",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = "#F0EEFE";
                e.currentTarget.style.borderColor = "#635BFF";
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = "#FAF8FF";
                e.currentTarget.style.borderColor = "#EDE9FE";
              }
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#635BFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>Preview</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#635BFF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, opacity: 0.85 }}
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </button>

          {/* Edit Button -> Opens Split Popup with Sliders + Iframe Preview */}
          <button
            type="button"
            onClick={handleOpenEditPopup}
            disabled={disabled}
            style={{
              width: "100%",
              minHeight: "42px",
              backgroundColor: "#635BFF",
              border: "none",
              borderRadius: "10px",
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              cursor: disabled ? "not-allowed" : "pointer",
              color: "#FFFFFF",
              fontSize: "13.5px",
              fontWeight: "600",
              transition: "background 0.15s ease",
              outline: "none",
              boxSizing: "border-box",
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.backgroundColor = "#5348E8";
            }}
            onMouseLeave={(e) => {
              if (!disabled) e.currentTarget.style.backgroundColor = "#635BFF";
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* EDIT MODAL: FULLSCREEN IFRAME WEBAPP WITH CLOSE ICON */}
      {editModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "#000000",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            margin: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            animation: "glamovixModalFadeIn 0.2s ease-out",
          }}
        >
          {/* Modal Container */}
          <div
            ref={modalContainerRef}
            style={{
              backgroundColor: "#FFFFFF",
              width: "100%",
              height: "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Top Navigation Bar: Title, Redirection to New Tab, Fullscreen & Close */}
            <div
              style={{
                height: "48px",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 16px",
                borderBottom: "1px solid #E5E7EB",
                backgroundColor: "#FFFFFF",
                flexShrink: 0,
                zIndex: 10,
                boxSizing: "border-box",
              }}
            >
              {/* Left: Product Title & Shade Dot */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor: product.color || "#b1022e",
                    border: "1px solid rgba(0, 0, 0, 0.15)",
                    flexShrink: 0,
                  }}
                />
                <h3
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {product.title}
                </h3>
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "#6B7280",
                    backgroundColor: "#F3F4F6",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Shade Studio
                </span>
              </div>

              {/* Right: Actions (Open in New Tab, Close) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                {/* Redirection to New Tab Button */}
                <button
                  type="button"
                  title="Open in new browser tab for full room"
                  onClick={handleOpenNewTab}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    fontSize: "12.5px",
                    fontWeight: "600",
                    color: "#374151",
                    backgroundColor: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#E5E7EB";
                    e.currentTarget.style.color = "#111827";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                    e.currentTarget.style.color = "#374151";
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Open in New Tab</span>
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  aria-label="Close edit studio"
                  title="Close"
                  onClick={handleCloseEditPopup}
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "8px",
                    border: "1px solid #E5E7EB",
                    backgroundColor: "#F3F4F6",
                    color: "#4B5563",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FEE2E2";
                    e.currentTarget.style.color = "#DC2626";
                    e.currentTarget.style.borderColor = "#FCA5A5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F3F4F6";
                    e.currentTarget.style.color = "#4B5563";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Iframe Viewport: Takes 100% remaining space */}
            <div
              style={{
                flex: 1,
                width: "100%",
                height: "calc(100% - 48px)",
                position: "relative",
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              <iframe
                ref={iframeRef}
                title={`Edit ${product.title}`}
                src={modalIframeUrl || buildPreviewUrl(true, product)}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  display: "block",
                  backgroundColor: "#FFFFFF",
                }}
                allow="camera; microphone; clipboard-write; fullscreen;"
                allowFullScreen={true}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
