import { useState, useEffect } from "react";
import {
  useLoaderData,
  useNavigation,
  useSubmit,
  useActionData,
  Form,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { sendSupportEmail, sendAutoReplyEmail } from "../ses.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);
  const shop = session.shop || "";
  const shopName = shop.replace(/\.myshopify\.com$/, "");

  // Try to fetch the shop email via the Admin API
  let shopEmail = "";
  try {
    const response = await admin.graphql(`{ shop { email } }`);
    const data = await response.json();
    shopEmail = data?.data?.shop?.email || "";
  } catch (e) {
    // Fail silently — email field will just be empty
  }

  return {
    shopName,
    shopEmail,
    shopFetched: !!shop,
  };
};

export const action = async ({ request }) => {
  await authenticate.admin(request);
  const formData = await request.formData();

  const email = formData.get("email")?.toString().trim();
  const shopName = formData.get("shopName")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!email || !shopName || !subject || !message) {
    return { error: "All fields are required." };
  }

  try {
    await sendSupportEmail({ email, shopName, subject, message });

    // Fire-and-forget auto-reply — don't block the response
    sendAutoReplyEmail({ email, shopName, subject, message }).catch((err) =>
      console.error("Auto-reply failed:", err),
    );

    return { success: true };
  } catch (err) {
    console.error("SES Error:", err);
    return { error: "Failed to send your message. Please try again later." };
  }
};

// ─── SVG Icons (monochrome) ──────────────────────────────────────────────────

const MailIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "18px", height: "18px", flexShrink: 0 }}
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M22 7l-10 7L2 7" />
  </svg>
);

const ShopIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "18px", height: "18px", flexShrink: 0 }}
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const SubjectIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "18px", height: "18px", flexShrink: 0 }}
  >
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="14" y2="15" />
    <line x1="4" y1="21" x2="8" y2="21" />
  </svg>
);

const MessageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#999"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "18px", height: "18px", flexShrink: 0 }}
  >
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const SendIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "16px", height: "16px" }}
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ─── Styles (Shopify B&W) ────────────────────────────────────────────────────

const inputBase = {
  width: "100%",
  padding: "10px 12px 10px 38px",
  fontSize: "13px",
  fontWeight: "400",
  color: "#1a1a1a",
  border: "1px solid #ccc",
  borderRadius: "8px",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
  backgroundColor: "#fff",
  boxSizing: "border-box",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

const inputDisabled = {
  ...inputBase,
  backgroundColor: "#f6f6f7",
  color: "#6d7175",
  cursor: "not-allowed",
};

const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "600",
  color: "#1a1a1a",
  marginBottom: "4px",
};

const iconWrap = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function HelpPage() {
  const { shopName, shopEmail, shopFetched } = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const isSubmitting =
    navigation.state !== "idle" && navigation.formMethod === "POST";

  const [formState, setFormState] = useState({
    email: shopEmail || "",
    shopName: shopName || "",
    subject: "",
    message: "",
  });

  const [toast, setToast] = useState(null);
  const [selectedTab, setSelectedTab] = useState("docs");

  // Handle action response
  useEffect(() => {
    if (actionData?.success) {
      setToast({
        type: "success",
        message: "Message sent successfully! We'll get back to you shortly.",
      });
      // Reset form fields
      setFormState((prev) => ({ ...prev, subject: "", message: "" }));
    } else if (actionData?.error) {
      setToast({ type: "error", message: actionData.error });
    }
  }, [actionData]);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleChange = (field) => (e) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(e.currentTarget, { method: "post" });
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = "#1a1a1a";
    e.target.style.boxShadow = "0 0 0 1px #1a1a1a";
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = "#ccc";
    e.target.style.boxShadow = "none";
  };

  return (
    <s-page heading="Help & Support">
      {/* Shopify-style Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            animation: "toastSlideUp 0.3s cubic-bezier(0.21, 1.02, 0.73, 1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              borderRadius: "8px",
              backgroundColor: "#303030",
              color: "#e3e5e7",
              fontSize: "13px",
              fontWeight: "450",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              boxShadow:
                "0 4px 16px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)",
              whiteSpace: "nowrap",
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: "none",
                border: "none",
                color: "#b5b5b5",
                cursor: "pointer",
                padding: "0 0 0 8px",
                fontSize: "13px",
                fontWeight: "500",
                fontFamily: "inherit",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#fff")}
              onMouseLeave={(e) => (e.target.style.color = "#b5b5b5")}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div
        style={{ maxWidth: "720px", margin: "0 auto", padding: "16px 0 60px" }}
      >
        {/* Hero */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            padding: "32px 24px",
            backgroundColor: "#fafafa",
            borderRadius: "12px",
            border: "1px solid #e1e1e1",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              backgroundColor: "#1a1a1a",
              marginBottom: "16px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: "30px", height: "30px" }}
            >
              <path d="M3 18v-6a9 9 0 0118 0v6" />
              <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "650",
              color: "#1a1a1a",
              margin: "0 0 6px",
            }}
          >
            How can we help you?
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#6d7175",
              margin: 0,
              lineHeight: "1.5",
              maxWidth: "420px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Have a question or ran into an issue? Send us a message and we'll
            get back to you shortly.
          </p>
        </div>

        {/* Form Card */}
        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "1px solid #e1e1e1",
            padding: "28px 24px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <Form method="post" onSubmit={handleSubmit}>
            {/* Row 1: Email + Shop */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {/* Email — always editable */}
              <div>
                <label style={labelStyle} htmlFor="email">
                  Email address
                </label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}>
                    <MailIcon />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formState.email}
                    onChange={handleChange("email")}
                    style={inputBase}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label style={labelStyle} htmlFor="shopName">
                  Shop name
                </label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}>
                    <ShopIcon />
                  </div>
                  <input
                    id="shopName"
                    name="shopName"
                    type="text"
                    placeholder="your-shop"
                    required
                    value={formState.shopName}
                    onChange={handleChange("shopName")}
                    readOnly={shopFetched}
                    style={shopFetched ? inputDisabled : inputBase}
                    onFocus={(e) => {
                      if (!shopFetched) focusStyle(e);
                    }}
                    onBlur={blurStyle}
                  />
                </div>
              </div>
            </div>

            {/* Subject */}
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle} htmlFor="subject">
                Subject
              </label>
              <div style={{ position: "relative" }}>
                <div style={iconWrap}>
                  <SubjectIcon />
                </div>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  placeholder="What do you need help with?"
                  required
                  value={formState.subject}
                  onChange={handleChange("subject")}
                  style={inputBase}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle} htmlFor="message">
                Message
              </label>
              <div style={{ position: "relative" }}>
                <div style={{ ...iconWrap, top: "16px", transform: "none" }}>
                  <MessageIcon />
                </div>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Describe your issue or question in detail…"
                  required
                  rows={5}
                  value={formState.message}
                  onChange={handleChange("message")}
                  style={{
                    ...inputBase,
                    paddingTop: "12px",
                    resize: "vertical",
                    minHeight: "110px",
                    lineHeight: "1.5",
                  }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                width: "100%",
                padding: "12px 24px",
                fontSize: "14px",
                fontWeight: "600",
                color: "#fff",
                backgroundColor: isSubmitting ? "#999" : "#1a1a1a",
                border: "none",
                borderRadius: "8px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background-color 0.15s, box-shadow 0.15s",
                fontFamily:
                  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.target.style.backgroundColor = "#333";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.target.style.backgroundColor = "#1a1a1a";
              }}
            >
              {isSubmitting ? (
                <>
                  <svg
                    style={{
                      width: "16px",
                      height: "16px",
                      animation: "spin 1s linear infinite",
                    }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 019.17 6" />
                  </svg>
                  Sending…
                </>
              ) : (
                <>
                  <SendIcon />
                  Send Message
                </>
              )}
            </button>
          </Form>

          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes toastSlideUp {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(16px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `}</style>
        </div>

        {/* Tab Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          {[
            {
              id: "docs",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "22px", height: "22px" }}
                >
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              ),
              title: "Documentation",
              desc: "Guides and tutorials",
            },
            {
              id: "faqs",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "22px", height: "22px" }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ),
              title: "FAQs",
              desc: "Common questions answered",
            },
            {
              id: "flow",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "22px", height: "22px" }}
                >
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
              ),
              title: "Integration Flow",
              desc: "Setup walkthrough",
            },
          ].map((card) => {
            const isActive = selectedTab === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedTab(card.id)}
                style={{
                  backgroundColor: isActive ? "#1a1a1a" : "#fff",
                  border: isActive ? "1px solid #1a1a1a" : "1px solid #e1e1e1",
                  borderRadius: "10px",
                  padding: "18px 16px",
                  textAlign: "center",
                  transition:
                    "border-color 0.15s, box-shadow 0.15s, background-color 0.15s, color 0.15s",
                  cursor: "pointer",
                  color: isActive ? "#fff" : "#1a1a1a",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "#1a1a1a";
                    e.currentTarget.style.boxShadow =
                      "0 1px 4px rgba(0,0,0,0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.borderColor = "#e1e1e1";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
              >
                <div style={{ marginBottom: "8px" }}>{card.icon}</div>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    margin: "0 0 2px",
                  }}
                >
                  {card.title}
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    color: isActive ? "#a1a1aa" : "#8c9196",
                    margin: 0,
                    lineHeight: "1.4",
                  }}
                >
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ─── Tab Content ─────────────────────────────────────────── */}

        {selectedTab === "docs" && (
          <div
            style={{
              marginTop: "24px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e1e1e1",
              overflow: "hidden",
            }}
          >
            {/* Video Tutorial */}
            <div
              style={{
                backgroundColor: "#f4f4f5",
                borderBottom: "1px solid #e1e1e1",
                padding: "40px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  maxWidth: "560px",
                  margin: "0 auto",
                  aspectRatio: "16 / 9",
                  backgroundColor: "#e4e4e7",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  border: "1px solid #d4d4d8",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ width: "40px", height: "40px" }}
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#71717a",
                    fontWeight: "500",
                  }}
                >
                  Video tutorial coming soon
                </span>
              </div>
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#71717a",
                }}
              >
                Watch a quick walkthrough of how to set up and use Glamovix.
              </p>
            </div>

            {/* Documentation */}
            <div style={{ padding: "28px 24px" }}>
              <h3
                style={{
                  fontSize: "16px",
                  fontWeight: "650",
                  color: "#1a1a1a",
                  margin: "0 0 20px",
                }}
              >
                Getting Started with Glamovix
              </h3>

              {/* Step sections */}
              {[
                {
                  step: "1",
                  title: "Home — Your Dashboard",
                  content:
                    "When you open the app, you'll land on the Home page. This is your dashboard — it shows a quick overview of your try-on stats like number of try-ons, users, and add-to-carts. You'll also see a \"Complete your setup\" checklist to help you get started.",
                },
                {
                  step: "2",
                  title: "Products — Add Your Lipsticks",
                  content: null,
                  bullets: [
                    'Click "Add product" to pick products from your Shopify store.',
                    "Each variant (shade) becomes its own card.",
                    "For each shade, set the matching color by clicking the color circle.",
                    "Adjust the intensity slider and lipstick type (matte, glossy, etc.).",
                    'Click the checkbox to select products, then hit "Save selected" at the bottom.',
                    "That's it — your shades are now ready for customers to try on!",
                  ],
                },
                {
                  step: "3",
                  title: "3D Editor — Customize the Try-On Look",
                  content: null,
                  bullets: [
                    "The 3D Editor lets you preview and manage the lipstick model shown in the try-on experience.",
                    "You can toggle the 3D viewer on or off for your storefront.",
                    "Premium and Enterprise plans can upload custom GLB models (up to 4).",
                    "Select which model to use by clicking on it in the list.",
                  ],
                },
                {
                  step: "4",
                  title: "Enable the Try-On on Your Store",
                  content: null,
                  bullets: [
                    'Go back to your Home page and click "Go to Theme" under the theme extension step.',
                    "This opens your Shopify theme editor.",
                    'Find "Glamovix" in the app blocks and enable it on your product page.',
                    "Save the theme — the try-on button will now appear on your store!",
                  ],
                },
                {
                  step: "5",
                  title: "Analytics — Track Your Performance",
                  content:
                    "The Analytics page shows detailed insights: how many customers used the try-on, which countries they're from, browser/device breakdowns, and add-to-cart conversion rates. Use the time filter to view data for the last week, month, or year.",
                },
                {
                  step: "6",
                  title: "Billing — Manage Your Plan",
                  content:
                    "Visit the Billing page to view your current plan, switch between monthly and yearly billing, or upgrade. Higher plans unlock more product slots, custom 3D models, and priority support.",
                },
              ].map((section, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: "20px",
                    paddingBottom: "20px",
                    borderBottom: idx < 5 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "700",
                        flexShrink: 0,
                        marginTop: "1px",
                      }}
                    >
                      {section.step}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#1a1a1a",
                          margin: "0 0 6px",
                        }}
                      >
                        {section.title}
                      </h4>
                      {section.content && (
                        <p
                          style={{
                            fontSize: "13px",
                            color: "#6d7175",
                            margin: 0,
                            lineHeight: "1.6",
                          }}
                        >
                          {section.content}
                        </p>
                      )}
                      {section.bullets && (
                        <ul
                          style={{
                            margin: "0",
                            paddingLeft: "18px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px",
                          }}
                        >
                          {section.bullets.map((b, i) => (
                            <li
                              key={i}
                              style={{
                                fontSize: "13px",
                                color: "#6d7175",
                                lineHeight: "1.6",
                              }}
                            >
                              {b}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Tip */}
              <div
                style={{
                  marginTop: "8px",
                  padding: "14px 16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    width: "18px",
                    height: "18px",
                    flexShrink: 0,
                    marginTop: "1px",
                  }}
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#374151",
                    margin: 0,
                    lineHeight: "1.5",
                  }}
                >
                  <strong>Need help?</strong> Use the contact form above to
                  reach our support team. We typically respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedTab === "faqs" && (
          <div
            style={{
              marginTop: "24px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e1e1e1",
              padding: "28px 24px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "650",
                color: "#1a1a1a",
                margin: "0 0 20px",
              }}
            >
              Frequently Asked Questions
            </h3>

            {[
              {
                q: "How does the virtual try-on work?",
                a: 'Customers click the "Try On" button on your product page. Their phone or laptop camera opens, and they can see the lipstick shade applied to their lips in real-time using augmented reality.',
              },
              {
                q: "Which devices are supported?",
                a: "The try-on works on most modern smartphones and laptops with a front-facing camera. It supports Chrome, Safari, and Edge browsers.",
              },
              {
                q: "Do my customers need to install anything?",
                a: "No. The try-on runs directly in the browser — no app download or plugin required.",
              },
              {
                q: "How do I match the color to my actual lipstick shade?",
                a: "On the Products page, click the color circle on each product card. Use the color picker to match it to your real product. Adjust the intensity slider for a more accurate look.",
              },
              {
                q: "Can I change my plan later?",
                a: "Yes! Go to the Billing page anytime to upgrade or switch between monthly and yearly billing. Changes are applied immediately.",
              },
              {
                q: 'What counts as a "product" in my plan limit?',
                a: "Each product variant (shade) counts as one product. For example, a lipstick with 5 shade variants counts as 5 products.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "16px",
                  paddingBottom: "16px",
                  borderBottom: idx < 5 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    margin: "0 0 6px",
                  }}
                >
                  {faq.q}
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6d7175",
                    margin: 0,
                    lineHeight: "1.6",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {selectedTab === "flow" && (
          <div
            style={{
              marginTop: "24px",
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e1e1e1",
              padding: "32px 24px",
              overflow: "hidden",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "650",
                color: "#1a1a1a",
                margin: "0 0 4px",
              }}
            >
              How Glamovix Works
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#6d7175",
                margin: "0 0 28px",
                lineHeight: "1.5",
              }}
            >
              From installation to your first customer try-on — here’s the
              complete flow.
            </p>

            {/* Visual Flow */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: "0",
                overflowX: "auto",
                padding: "8px 0 16px",
              }}
            >
              {[
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  ),
                  label: "Install App",
                  sub: "From Shopify Store",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  ),
                  label: "Add Products",
                  sub: "Pick your lipsticks",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <circle cx="13.5" cy="6.5" r="2.5" />
                      <path d="M17.5 15.5l-4-4-8 8" />
                    </svg>
                  ),
                  label: "Set Color & Type",
                  sub: "Match your shades",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  ),
                  label: "Enable Try-on Button ",
                  sub: "Add Theme extension (app block)",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ),
                  label: "Button Appears",
                  sub: "On product page",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  ),
                  label: "Customer Clicks",
                  sub: "Try On button",
                },
                {
                  icon: (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "16px", height: "16px" }}
                    >
                      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                    </svg>
                  ),
                  label: "Try-On Opens",
                  sub: "AR experience live!",
                  highlight: true,
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* Step */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "6px",
                      width: "70px",
                    }}
                  >
                    {/* Circle */}
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        backgroundColor: step.highlight ? "#1a1a1a" : "#f4f4f5",
                        border: step.highlight
                          ? "2px solid #1a1a1a"
                          : "1.5px solid #d4d4d8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: step.highlight ? "#fff" : "#52525b",
                        position: "relative",
                      }}
                    >
                      {step.icon}
                      {/* Step number badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          width: "15px",
                          height: "15px",
                          borderRadius: "50%",
                          backgroundColor: step.highlight
                            ? "#16a34a"
                            : "#1a1a1a",
                          color: "#fff",
                          fontSize: "9px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #fff",
                        }}
                      >
                        {idx + 1}
                      </div>
                    </div>
                    {/* Label */}
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: step.highlight ? "#1a1a1a" : "#374151",
                          margin: "0",
                          lineHeight: "1.3",
                        }}
                      >
                        {step.label}
                      </p>
                      <p
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          margin: "2px 0 0",
                          lineHeight: "1.3",
                        }}
                      >
                        {step.sub}
                      </p>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  {idx < 6 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "0 2px",
                        marginBottom: "32px",
                      }}
                    >
                      <div
                        style={{
                          width: "12px",
                          height: "1.5px",
                          backgroundColor: "#d4d4d8",
                        }}
                      />
                      <svg
                        viewBox="0 0 8 12"
                        fill="#d4d4d8"
                        style={{ width: "6px", height: "10px" }}
                      >
                        <path d="M0 0 L8 6 L0 12 Z" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Summary */}
            <div
              style={{
                marginTop: "20px",
                padding: "14px 16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  width: "18px",
                  height: "18px",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <p
                style={{
                  fontSize: "13px",
                  color: "#374151",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                <strong>That’s it!</strong> Once setup is complete, every
                customer visiting your product page will see the try-on button.
                No extra steps needed.
              </p>
            </div>
          </div>
        )}
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
