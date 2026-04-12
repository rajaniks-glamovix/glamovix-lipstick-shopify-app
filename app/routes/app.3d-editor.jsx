import { useState, useRef, useEffect } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import {
  useLoaderData,
  useNavigate,
  useFetcher,
  useRouteError,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  readJson,
  writeToJson,
  BUCKET_NAME,
  getS3Key,
  uploadFile,
  deleteJson,
} from "../s3.server";
import * as billingConfigs from "../billing.constants";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  const billingCheck = await billing.check({
    plans: [
      billingConfigs.MONTHLY_PLAN_PREMIUM,
      billingConfigs.YEARLY_PLAN_PREMIUM,
      billingConfigs.MONTHLY_PLAN_ENTERPRISE,
      billingConfigs.YEARLY_PLAN_ENTERPRISE,
    ],
    isTest: true,
  });

  let settings = { threeDViewerEnabled: true, uploadedModels: [] };
  try {
    const key = getS3Key(session.shop);
    const data = await readJson(BUCKET_NAME, key);
    if (data && data.settings) {
      settings = data.settings;
    }
  } catch (e) {
    // Default settings if error
  }

  return {
    canUpload: billingCheck.hasActivePayment,
    currentPlan: billingCheck.appSubscriptions[0]?.name || "Free/Essential",
    threeDViewerEnabled: settings.threeDViewerEnabled,
    uploadedModels: settings.uploadedModels || [],
    activeModel: settings.active || "/modals/lipstick_animated.glb",
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  const companyName = session.shop.replace(".myshopify.com", "");
  const dataKey = getS3Key(session.shop);

  if (intent === "select_glb") {
    const activeUrl = formData.get("active");
    if (!activeUrl) return { success: false };
    try {
      let data = (await readJson(BUCKET_NAME, dataKey)) || { products: [] };
      if (!data.settings) data.settings = {};
      data.settings.active = activeUrl;
      await writeToJson(BUCKET_NAME, dataKey, data);
      return { success: true, intent, active: activeUrl };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  if (intent === "upload_glb") {
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return { success: false, error: "Invalid file" };
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "");
    const timestamp = Date.now();
    const key = `lipstick/glb/glb-${timestamp}-${fileName}`;

    try {
      await uploadFile(
        BUCKET_NAME,
        key,
        Buffer.from(buffer),
        "model/gltf-binary",
      );
      const publicUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;

      let data = (await readJson(BUCKET_NAME, dataKey)) || { products: [] };
      if (!data.settings) data.settings = {};
      if (!data.settings.uploadedModels) data.settings.uploadedModels = [];

      const newModel = { name: fileName, url: publicUrl, key };
      data.settings.uploadedModels.push(newModel);
      data.settings.active = publicUrl;
      await writeToJson(BUCKET_NAME, dataKey, data);

      return { success: true, intent, model: newModel };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  if (intent === "delete_glb") {
    const key = formData.get("key");
    const url = formData.get("url");
    if (!key) return { success: false };

    try {
      await deleteJson(BUCKET_NAME, key);
      let data = (await readJson(BUCKET_NAME, dataKey)) || { products: [] };
      if (data.settings?.uploadedModels) {
        data.settings.uploadedModels = data.settings.uploadedModels.filter(
          (m) => m.key !== key,
        );
        if (data.settings.active === url) {
           data.settings.active = "/modals/lipstick_animated.glb";
        }
        await writeToJson(BUCKET_NAME, dataKey, data);
      }
      return { success: true, intent, key };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  const enabled = formData.get("enabled") === "true";

  try {
    let data = (await readJson(BUCKET_NAME, dataKey)) || { products: [] };

    if (!data.settings) {
      data.settings = {};
    }

    data.settings.threeDViewerEnabled = enabled;

    await writeToJson(BUCKET_NAME, dataKey, data);
    return { success: true, intent: "toggle" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default function ThreeDEditor() {
  const {
    canUpload,
    currentPlan,
    threeDViewerEnabled: initialEnabled,
    uploadedModels,
    activeModel,
  } = useLoaderData();
  const fetcher = useFetcher();
  const [selectedModel, setSelectedModel] = useState(activeModel);
  const [modelLoading, setModelLoading] = useState(true);
  const [viewerEnabled, setViewerEnabled] = useState(initialEnabled);

  const fileInputRef = useRef(null);
  const modelViewerRef = useRef(null);
  const shopify = useAppBridge();
  const navigate = useNavigate();

  const isUploading =
    fetcher.state === "submitting" &&
    fetcher.formData?.get("intent") === "upload_glb";

  useEffect(() => {
    import("@google/model-viewer").catch(console.error);
  }, []);

  // Watch for successful upload/delete to show toast
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        if (fetcher.data.intent === "upload_glb") {
          shopify.toast.show("Model uploaded successfully");
          if (fetcher.data.model) setSelectedModel(fetcher.data.model.url);
        } else if (fetcher.data.intent === "delete_glb") {
          shopify.toast.show("Model deleted");
        }
      } else if (fetcher.data.error) {
        shopify.toast.show(fetcher.data.error, { isError: true });
      }
    }
  }, [fetcher.state, fetcher.data, shopify]);

  // Reset loading when model changes + listen for load event
  useEffect(() => {
    setModelLoading(true);
    const el = modelViewerRef.current;
    if (!el) return;
    const onLoad = () => setModelLoading(false);
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [selectedModel]);

  const defaultModels = [
    { name: "Lipstick Animated", url: "/modals/lipstick_animated.glb" },
  ];

  const handleSelectModel = (modelUrl) => {
    if (selectedModel === modelUrl) return;
    setSelectedModel(modelUrl);
    const formData = new FormData();
    formData.append("intent", "select_glb");
    formData.append("active", modelUrl);
    fetcher.submit(formData, { method: "post" });
  };

  const handleFileUpload = (event) => {
    if (!canUpload) {
      shopify.toast.show("Upgrade to Premium to upload custom models", {
        isError: true,
      });
      return;
    }

    if (uploadedModels.length >= 4) {
      shopify.toast.show("Maximum limit of 4 uploads reached.", {
        isError: true,
      });
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".glb")) {
      shopify.toast.show("Please upload a .glb file.", { isError: true });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      shopify.toast.show("File size exceeds 10MB limit.", { isError: true });
      return;
    }

    const formData = new FormData();
    formData.append("intent", "upload_glb");
    formData.append("file", file);
    fetcher.submit(formData, {
      method: "post",
      encType: "multipart/form-data",
    });

    // clear input value so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadClick = () => {
    if (!canUpload) {
      shopify.toast.show("Upgrade to Premium to unlock this feature", {
        isError: true,
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDeleteModel = (url, key, event) => {
    event.stopPropagation();
    if (selectedModel === url) {
      setSelectedModel(defaultModels[0].url);
    }

    const formData = new FormData();
    formData.append("intent", "delete_glb");
    formData.append("key", key);
    formData.append("url", url);
    fetcher.submit(formData, { method: "post" });
  };

  const handleToggleViewer = () => {
    const nextValue = !viewerEnabled;
    setViewerEnabled(nextValue);
    fetcher.submit({ enabled: nextValue.toString() }, { method: "post" });
    shopify.toast.show(`3D Viewer ${nextValue ? "enabled" : "disabled"}`);
  };

  const allModels = [...defaultModels, ...uploadedModels];
  const selectedModelData =
    allModels.find((m) => m.url === selectedModel) || allModels[0];

  return (
    <s-page heading="3D Asset Manager">
      <s-stack gap="base">
        {/* Toggle Section */}
        <div
          style={{
            backgroundColor: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            border: "1px solid #e1e3e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <s-text variant="bodyMd">
              <strong>3D Viewer status</strong>
            </s-text>
            <s-text variant="bodySm" tone="subdued">
              Enable or disable the 3D preview button on your storefront
              lipstick try-on app.
            </s-text>
          </div>
          <div
            onClick={handleToggleViewer}
            style={{
              width: "44px",
              height: "24px",
              backgroundColor: viewerEnabled ? "#008060" : "#bf0711",
              borderRadius: "12px",
              position: "relative",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
          >
            <div
              style={{
                width: "18px",
                height: "18px",
                backgroundColor: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "3px",
                left: viewerEnabled ? "23px" : "3px",
                transition: "left 0.2s ease",
                boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
              }}
            />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Left Column: 3D Preview */}
          <s-stack gap="base">
            <s-card>
              <div style={{ padding: "16px" }}>
                <div
                  style={{
                    height: "420px",
                    width: "100%",
                    backgroundColor: "#f1f1f1",
                    borderRadius: "12px",
                    overflow: "hidden",
                    position: "relative",
                    border: "1px solid #e1e3e5",
                    opacity: viewerEnabled ? 1 : 0.6,
                  }}
                >
                  {!viewerEnabled && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(255,255,255,0.4)",
                        zIndex: 20,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backdropFilter: "blur(2px)",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#202223",
                          color: "white",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        Viewer Disabled
                      </div>
                    </div>
                  )}

                  {/* Loading Overlay */}
                  {modelLoading && viewerEnabled && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f1f1f1",
                        zIndex: 10,
                        gap: "12px",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        style={{
                          width: "36px",
                          height: "36px",
                          animation: "spin3d 1s linear infinite",
                          fill: "#5c5f62",
                        }}
                      >
                        <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15ZM5 8.79V15.91L11 19.29V12.16L5 8.79ZM13 19.29L19 15.91V8.79L13 12.16V19.29Z" />
                      </svg>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: "500",
                          color: "#6d7175",
                        }}
                      >
                        Loading model…
                      </span>
                    </div>
                  )}

                  {/* @ts-ignore */}
                  <model-viewer
                    ref={modelViewerRef}
                    key={selectedModel}
                    src={selectedModel}
                    camera-controls
                    auto-rotate
                    interaction-prompt="auto"
                    shadow-intensity="1"
                    environment-image="neutral"
                    exposure="1"
                    ar
                    style={{ width: "100%", height: "100%" }}
                  ></model-viewer>

                  <div
                    style={{
                      position: "absolute",
                      bottom: "16px",
                      left: "16px",
                      backgroundColor: "rgba(255,255,255,0.8)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <s-text variant="bodySm">
                      <strong>{selectedModelData.name}</strong>
                    </s-text>
                  </div>
                </div>
              </div>
            </s-card>

            <s-card>
              <div style={{ padding: "20px" }}>
                <s-stack gap="base">
                  <s-text variant="headingMd">
                    <strong>About this tool</strong>
                  </s-text>
                  <s-text tone="subdued">
                    Preview and manage your 3D assets for the Virtual Try-On
                    experience. High-quality GLB models ensure a realistic
                    representation of your products.
                  </s-text>
                </s-stack>
              </div>
            </s-card>
          </s-stack>

          {/* Right Column: Selection & Upload */}
          <s-stack gap="base">
            <s-card>
              <div style={{ padding: "20px" }}>
                <s-stack gap="base">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <s-text variant="headingMd">
                      <strong>Models</strong>
                    </s-text>
                    <s-text tone="subdued" variant="bodyXs">
                      {allModels.length} Total
                    </s-text>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      maxHeight: "400px",
                      overflowY: "auto",
                      paddingRight: "4px",
                    }}
                  >
                    {allModels.map((model, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectModel(model.url)}
                        style={{
                          cursor: "pointer",
                          padding: "10px",
                          border:
                            selectedModel === model.url
                              ? "1.5px solid #005bd3"
                              : "1px solid #e1e3e5",
                          borderRadius: "10px",
                          backgroundColor:
                            selectedModel === model.url ? "#f0f7ff" : "white",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            backgroundColor: "#f4f6f8",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            style={{
                              width: "20px",
                              height: "20px",
                              fill:
                                selectedModel === model.url
                                  ? "#005bd3"
                                  : "#5c5f62",
                            }}
                          >
                            <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15ZM5 8.79V15.91L11 19.29V12.16L5 8.79ZM13 19.29L19 15.91V8.79L13 12.16V19.29Z" />
                          </svg>
                        </div>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                          <s-text variant="bodySm">
                            <span
                              style={{
                                display: "block",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight:
                                  selectedModel === model.url ? "600" : "400",
                              }}
                            >
                              {model.name}
                            </span>
                          </s-text>
                        </div>
                        {uploadedModels.some((m) => m.url === model.url) && (
                          <div
                            onClick={(e) =>
                              handleDeleteModel(model.url, model.key, e)
                            }
                            style={{
                              padding: "4px",
                              borderRadius: "4px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "rgba(0,0,0,0.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "transparent")
                            }
                          >
                            <svg
                              viewBox="0 0 20 20"
                              style={{
                                width: "16px",
                                height: "16px",
                                fill: "#bf0711",
                              }}
                            >
                              <path d="M14 4h-1.5v-1c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v1h-1.5c-.55 0-1 .45-1 1v1h8c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1zm-6-1h4v1h-4v-1zm7 5h-10v8c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-8zm-7 7h-1v-5h1v5zm3 0h-1v-5h1v5zm3 0h-1v-5h1v5z" />
                            </svg>
                          </div>
                        )}
                        {selectedModel === model.url &&
                          !uploadedModels.some((m) => m.url === model.url) && (
                            <div
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                backgroundColor: "#005bd3",
                              }}
                            />
                          )}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    <div
                      onClick={handleUploadClick}
                      style={{
                        cursor: canUpload ? "pointer" : "not-allowed",
                        padding: "16px",
                        border: "2px dashed #e1e3e5",
                        borderRadius: "12px",
                        backgroundColor: canUpload ? "#fafafa" : "#f1f1f1",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        opacity: canUpload ? 1 : 0.7,
                        transition: "background-color 0.2s",
                      }}
                    >
                      {!canUpload ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            style={{
                              width: "24px",
                              height: "24px",
                              fill: "#8c9196",
                            }}
                          >
                            <path d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM9 6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9V6ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17Z" />
                          </svg>
                          <s-text variant="bodySm">
                            <strong>Upload Locked</strong>
                          </s-text>
                          <s-button
                            variant="tertiary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/app/billing");
                            }}
                          >
                            Upgrade to Premium
                          </s-button>
                        </>
                      ) : uploadedModels.length >= 4 ? (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            style={{
                              width: "24px",
                              height: "24px",
                              fill: "#8c9196",
                            }}
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                          </svg>
                          <s-text variant="bodySm">
                            <strong>Limit Reached</strong>
                          </s-text>
                          <s-text variant="bodyXs" tone="subdued">
                            4/4 slots used
                          </s-text>
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 24 24"
                            style={{
                              width: "24px",
                              height: "24px",
                              fill: "#005bd3",
                            }}
                          >
                            <path d="M11 16V7.85L8.4 10.45L7 9L12 4L17 9L15.6 10.45L13 7.85V16H11ZM6 20C5.45 20 4.979 19.804 4.587 19.412C4.195 19.02 3.99933 18.5493 4 18V15H6V18H18V15H20V18C20 18.55 19.804 19.021 19.412 19.413C19.02 19.805 18.5493 20.0007 18 20H6Z" />
                          </svg>
                          <s-text variant="bodySm">
                            <strong>
                              {isUploading ? "Uploading..." : "Upload GLB"}
                            </strong>
                          </s-text>
                          <s-text variant="bodyXs" tone="subdued">
                            {uploadedModels.length}/4 slots used
                          </s-text>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Technical Requirement Notice - Only visible to eligible users */}
                  {canUpload && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        backgroundColor: "#f9fafb",
                        borderRadius: "8px",
                        border: "1px solid #e1e3e5",
                      }}
                    >
                      <s-stack gap="tight">
                        <s-text variant="bodySm">
                          <strong>Internal Mesh Naming</strong>
                        </s-text>
                        <s-text variant="bodyXs" tone="subdued">
                          Within your 3D file, the specific mesh component for
                          the lipstick stick must be named{" "}
                          <code
                            style={{
                              color: "#bf0711",
                              fontWeight: "600",
                              backgroundColor: "rgba(0,0,0,0.03)",
                              padding: "2px 4px",
                              borderRadius: "4px",
                            }}
                          >
                            color_stick
                          </code>
                          . This allows the system to target that exact part for
                          dynamic shade changes.
                        </s-text>
                      </s-stack>
                    </div>
                  )}
                </s-stack>
              </div>
            </s-card>

            <s-card>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "0 0 12px 12px",
                }}
              >
                <s-stack gap="extraTight">
                  <s-text variant="bodyXs" tone="subdued">
                    CURRENT PLAN
                  </s-text>
                  <s-text variant="bodySm">
                    <strong>{currentPlan}</strong>
                  </s-text>
                </s-stack>
              </div>
            </s-card>
          </s-stack>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".glb"
            onChange={handleFileUpload}
          />
        </div>
      </s-stack>
      <style>{`
        @keyframes spin3d {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </s-page>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
