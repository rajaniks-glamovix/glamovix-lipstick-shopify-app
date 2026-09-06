import { useState } from "react";

const RocketIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#5E4BF8"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91-.79-.79-2.08-.8-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    <circle cx="15" cy="9" r="1.3" fill="#5E4BF8" />
  </svg>
);

const ThemeExtensionIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3.5a1.5 1.5 0 0 1 1.5 1.5v1.2a4 4 0 0 1 1.6.68l.85-.85a1.5 1.5 0 1 1 2.12 2.12l-.85.85a4 4 0 0 1 .68 1.6H19a1.5 1.5 0 0 1 0 3h-1.1a4 4 0 0 1-.68 1.6l.85.85a1.5 1.5 0 1 1-2.12 2.12l-.85-.85a4 4 0 0 1-1.6.68V19a1.5 1.5 0 0 1-3 0v-1.1a4 4 0 0 1-1.6-.68l-.85.85a1.5 1.5 0 1 1-2.12-2.12l.85-.85a4 4 0 0 1-.68-1.6H5a1.5 1.5 0 0 1 0-3h1.1a4 4 0 0 1 .68-1.6l-.85-.85a1.5 1.5 0 1 1 2.12-2.12l.85.85a4 4 0 0 1 1.6-.68V5a1.5 1.5 0 0 1 1.5-1.5z" />
  </svg>
);

const PackageIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ArrowRightIcon = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SingleLipstickGraphic = () => (
  <svg
    width="28"
    height="52"
    viewBox="0 0 32 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="glamGoldBase" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#C8972E" />
        <stop offset="35%" stopColor="#F9E8B2" />
        <stop offset="70%" stopColor="#E0B64D" />
        <stop offset="100%" stopColor="#A37415" />
      </linearGradient>
      <linearGradient id="glamSilverCollar" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="40%" stopColor="#FFFFFF" />
        <stop offset="80%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      <linearGradient id="glamRedBullet" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#991B1B" />
        <stop offset="30%" stopColor="#DC2626" />
        <stop offset="70%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="glamRedBevel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
    {/* Base Shadow */}
    <ellipse cx="16" cy="55" rx="10" ry="2.2" fill="#CBD5E1" opacity="0.6" />
    {/* Gold Base Cylinder */}
    <rect x="7.5" y="30" width="17" height="24" rx="2" fill="url(#glamGoldBase)" />
    {/* Gold Ring */}
    <rect x="7.5" y="28" width="17" height="2.5" fill="#D9A835" />
    {/* Silver Neck */}
    <rect x="10.5" y="19" width="11" height="10" rx="1" fill="url(#glamSilverCollar)" />
    {/* Red Lipstick Bullet */}
    <path
      d="M11.5 19V10C11.5 7.5 13 5 16 2.5C18.5 5.5 20.5 7.5 20.5 10V19H11.5Z"
      fill="url(#glamRedBullet)"
    />
    {/* Angled Facet Tip */}
    <path
      d="M12.5 10C12.5 7.5 13.5 5 16 2.5C18 5.5 19.5 7.5 19.5 10L12.5 10Z"
      fill="url(#glamRedBevel)"
      opacity="0.95"
    />
  </svg>
);

const DualLipstickGraphic = () => (
  <svg
    width="42"
    height="52"
    viewBox="0 0 48 58"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ flexShrink: 0 }}
  >
    <defs>
      <linearGradient id="glamGoldBase2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#C8972E" />
        <stop offset="35%" stopColor="#F9E8B2" />
        <stop offset="70%" stopColor="#E0B64D" />
        <stop offset="100%" stopColor="#A37415" />
      </linearGradient>
      <linearGradient id="glamGoldCap" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="30%" stopColor="#FFF2C6" />
        <stop offset="60%" stopColor="#DFB244" />
        <stop offset="100%" stopColor="#8C660D" />
      </linearGradient>
      <linearGradient id="glamSilverCollar2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#94A3B8" />
        <stop offset="40%" stopColor="#FFFFFF" />
        <stop offset="80%" stopColor="#CBD5E1" />
        <stop offset="100%" stopColor="#64748B" />
      </linearGradient>
      <linearGradient id="glamRedBullet2" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#991B1B" />
        <stop offset="30%" stopColor="#DC2626" />
        <stop offset="70%" stopColor="#B91C1C" />
        <stop offset="100%" stopColor="#7F1D1D" />
      </linearGradient>
      <linearGradient id="glamRedBevel2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#EF4444" />
        <stop offset="100%" stopColor="#B91C1C" />
      </linearGradient>
    </defs>
    {/* Base Shadows */}
    <ellipse cx="13" cy="55" rx="9" ry="2.2" fill="#CBD5E1" opacity="0.6" />
    <ellipse cx="33" cy="55" rx="9" ry="2.2" fill="#CBD5E1" opacity="0.6" />

    {/* Left Lipstick (Open) */}
    <rect x="6.5" y="30" width="13" height="24" rx="2" fill="url(#glamGoldBase2)" />
    <rect x="6.5" y="28" width="13" height="2.5" fill="#D9A835" />
    <rect x="9" y="19" width="8" height="10" rx="1" fill="url(#glamSilverCollar2)" />
    <path
      d="M9.5 19V11C9.5 8.5 11 6.5 13 4C15 6.5 16.5 8.5 16.5 11V19H9.5Z"
      fill="url(#glamRedBullet2)"
    />
    <path
      d="M10.5 11C10.5 8.5 11.5 6.5 13 4C14.5 6.5 15.5 8.5 15.5 11L10.5 11Z"
      fill="url(#glamRedBevel2)"
      opacity="0.95"
    />

    {/* Right Lipstick (Closed Gold Tube) */}
    <rect x="26.5" y="16" width="14" height="38" rx="2.5" fill="url(#glamGoldCap)" />
    {/* Sheen lines */}
    <line x1="29.5" y1="18" x2="29.5" y2="52" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
    <line x1="33" y1="18" x2="33" y2="52" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1" />
    <line x1="36.5" y1="18" x2="36.5" y2="52" stroke="#B38A20" strokeOpacity="0.5" strokeWidth="0.8" />
    {/* Cap divider line */}
    <line x1="26.5" y1="34" x2="40.5" y2="34" stroke="#8C660D" strokeWidth="0.8" />
  </svg>
);

export default function OnboardingGuide({
  completedCount: propCompletedCount,
  themeCompleted = false,
  productCompleted = false,
  onGoToTheme,
  onGoToProducts,
  navigatingTheme = false,
  navigatingProduct = false,
}) {
  const completedCount =
    typeof propCompletedCount === "number"
      ? propCompletedCount
      : (themeCompleted ? 1 : 0) + (productCompleted ? 1 : 0);
  const [hoverBtn1, setHoverBtn1] = useState(false);
  const [hoverBtn2, setHoverBtn2] = useState(false);

  return (
    <div
      className="glamovix-onboarding-container"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "18px",
        padding: "28px 32px",
        border: "1px solid #ECEAFD",
        boxShadow: "0 4px 20px -2px rgba(99, 102, 241, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <style>{`
        .glamovix-onboarding-container {
          box-sizing: border-box;
          width: 100%;
        }

        .glamovix-header {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .glamovix-steps-container {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          gap: 14px;
          margin-top: 24px;
          margin-bottom: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        .glamovix-step-card {
          flex: 1 1 0;
          min-width: 0;
          background-color: #FFFFFF;
          border: 1.5px solid #ECEAFD;
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.03);
          box-sizing: border-box;
        }

        .glamovix-step-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1 1 auto;
          min-width: 0;
        }

        .glamovix-flow-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6366F1;
          flex-shrink: 0;
          align-self: center;
          transition: transform 0.25s ease;
        }

        .glamovix-mockup-wrapper {
          width: 150px;
          min-width: 150px;
          height: 116px;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .glamovix-bottom-bar {
          background-color: #F8F9FE;
          border: 1px solid #ECEAFD;
          border-radius: 14px;
          padding: 16px 22px 22px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: nowrap;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
        }

        .glamovix-stepper-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex-shrink: 0;
        }

        /* Tablets & Smaller Desktops (769px to 1024px) */
        @media (max-width: 1024px) {
          .glamovix-onboarding-container {
            padding: 24px 20px !important;
          }
          .glamovix-step-card {
            padding: 18px 16px !important;
            gap: 12px !important;
          }
          .glamovix-mockup-wrapper {
            width: 135px !important;
            min-width: 135px !important;
            height: 112px !important;
          }
        }

        /* Tablets & Mobile (max-width: 768px) */
        @media (max-width: 768px) {
          .glamovix-onboarding-container {
            padding: 20px 16px !important;
            border-radius: 14px !important;
          }
          .glamovix-steps-container {
            flex-direction: column !important;
            gap: 12px !important;
            margin-top: 18px !important;
            margin-bottom: 18px !important;
          }
          .glamovix-step-card {
            flex: none !important;
            width: 100% !important;
          }
          .glamovix-flow-arrow {
            transform: rotate(90deg);
            padding: 2px 0;
          }
          .glamovix-bottom-bar {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 16px 16px 20px 16px !important;
            gap: 16px !important;
          }
          .glamovix-stepper-wrapper {
            width: 100% !important;
            max-width: 100% !important;
            justify-content: flex-start !important;
            gap: 10px !important;
            padding-top: 4px;
          }
        }

        /* Small Mobile Phones (max-width: 520px) */
        @media (max-width: 520px) {
          .glamovix-step-card {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }
          .glamovix-mockup-wrapper {
            width: 100% !important;
            min-width: 100% !important;
            height: 112px !important;
            align-self: center !important;
          }
          .glamovix-step-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          .glamovix-header {
            align-items: flex-start !important;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="glamovix-header" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            backgroundColor: "#F0EEFE",
            color: "#6366F1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <RocketIcon />
        </div>
        <div>
          <h2
            style={{
              fontSize: "19px",
              fontWeight: "700",
              color: "#111827",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Get started with Glamovix
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "#6B7280",
              margin: "3px 0 0 0",
              lineHeight: 1.4,
            }}
          >
            Set up your store in two simple steps and start offering virtual try-on for your lipstick products.
          </p>
        </div>
      </div>

      {/* Steps Cards Container with Central Flow Arrow */}
      <div
        className="glamovix-steps-container"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: "14px",
          marginTop: "24px",
          marginBottom: "24px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Step 1 Card: Add Theme Extension */}
        <div
          className="glamovix-step-card"
          style={{
            flex: "1 1 0",
            minWidth: 0,
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #ECEAFD",
            borderRadius: "16px",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            boxShadow: "0 2px 10px rgba(99, 102, 241, 0.03)",
            boxSizing: "border-box",
          }}
        >
          {/* Left info */}
          <div
            className="glamovix-step-info"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            <span
              style={{
                backgroundColor: "#EDE9FE",
                color: "#6D28D9",
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 9px",
                borderRadius: "6px",
                marginBottom: "8px",
                display: "inline-block",
              }}
            >
              Step 1
            </span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                margin: "0 0 6px 0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              Add Theme Extension
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "#6B7280",
                lineHeight: "1.45",
                margin: "0 0 16px 0",
              }}
            >
              Integrate the Glamovix extension into your store's front-end theme. This adds the virtual try-on button to your product pages.
            </p>
            <button
              className="glamovix-step-btn"
              onClick={onGoToTheme}
              disabled={navigatingTheme}
              onMouseEnter={() => setHoverBtn1(true)}
              onMouseLeave={() => setHoverBtn1(false)}
              style={{
                backgroundColor: hoverBtn1 ? "#4F3DE8" : "#5E4BF8",
                color: "#FFFFFF",
                fontSize: "12.5px",
                fontWeight: "600",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: navigatingTheme ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 6px rgba(94, 75, 248, 0.28)",
                transition: "background-color 0.15s ease",
              }}
            >
              <ThemeExtensionIcon />
              <span>{navigatingTheme ? "Opening..." : "Add Theme Extension"}</span>
              <ArrowRightIcon size={13} />
            </button>
          </div>

          {/* Right Illustration: Store PDP with lipstick & Try On button */}
          <div
            className="glamovix-mockup-wrapper"
            style={{
              width: "150px",
              minWidth: "150px",
              height: "116px",
              backgroundColor: "#F6F5FD",
              border: "1px solid #ECEAFD",
              borderRadius: "12px",
              padding: "7px 8px 9px 8px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 14px rgba(99, 102, 241, 0.05)",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            {/* Mockup Top Bar (Browser dots) */}
            <div style={{ display: "flex", gap: "4px", paddingBottom: "4px" }}>
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#D4D2F5" }} />
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#D4D2F5" }} />
              <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#D4D2F5" }} />
            </div>

            {/* Inner Mock Store Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "6px 8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                flex: 1,
                position: "relative",
              }}
            >
              <SingleLipstickGraphic />

              <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: "44px",
                    height: "5px",
                    backgroundColor: "#ECEBFC",
                    borderRadius: "3px",
                  }}
                />
                <div
                  style={{
                    width: "30px",
                    height: "5px",
                    backgroundColor: "#ECEBFC",
                    borderRadius: "3px",
                  }}
                />

                {/* Try On Button inside preview */}
                <div style={{ position: "relative", alignSelf: "flex-start", marginTop: "2px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      backgroundColor: "#5E4BF8",
                      color: "#FFFFFF",
                      borderRadius: "5px",
                      padding: "3px 7px",
                      fontSize: "9px",
                      fontWeight: "600",
                      boxShadow: "0 2px 5px rgba(94, 75, 248, 0.35)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>Try On</span>
                  </div>
                  {/* Floating sparkles */}
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="#7C3AED"
                    style={{
                      position: "absolute",
                      top: -5,
                      right: -6,
                      opacity: 0.9,
                    }}
                  >
                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central Connecting Flow Arrow */}
        <div
          className="glamovix-flow-arrow"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6366F1",
            flexShrink: 0,
            alignSelf: "center",
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>

        {/* Step 2 Card: Add Products */}
        <div
          className="glamovix-step-card"
          style={{
            flex: "1 1 0",
            minWidth: 0,
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #ECEAFD",
            borderRadius: "16px",
            padding: "20px 22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.02)",
            boxSizing: "border-box",
          }}
        >
          {/* Left info */}
          <div
            className="glamovix-step-info"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            <span
              style={{
                backgroundColor: "#EDE9FE",
                color: "#6D28D9",
                fontSize: "11px",
                fontWeight: "600",
                padding: "3px 9px",
                borderRadius: "6px",
                marginBottom: "8px",
                display: "inline-block",
              }}
            >
              Step 2
            </span>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#111827",
                margin: "0 0 6px 0",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "100%",
              }}
            >
              Add Products
            </h3>
            <p
              style={{
                fontSize: "12px",
                color: "#6B7280",
                lineHeight: "1.45",
                margin: "0 0 16px 0",
              }}
            >
              Choose your lipstick products and manage their settings, shades and try-on experience from your dashboard.
            </p>
            <button
              className="glamovix-step-btn"
              onClick={onGoToProducts}
              disabled={navigatingProduct}
              onMouseEnter={() => setHoverBtn2(true)}
              onMouseLeave={() => setHoverBtn2(false)}
              style={{
                backgroundColor: hoverBtn2 ? "#F9FAFB" : "#FFFFFF",
                color: "#1F2937",
                fontSize: "12.5px",
                fontWeight: "600",
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1px solid #D1D5DB",
                cursor: navigatingProduct ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                whiteSpace: "nowrap",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                transition: "background-color 0.15s ease, border-color 0.15s ease",
              }}
            >
              <PackageIcon />
              <span>{navigatingProduct ? "Loading..." : "Manage Products"}</span>
              <ArrowRightIcon size={13} />
            </button>
          </div>

          {/* Right Illustration: Dual lipsticks + plus badge */}
          <div
            className="glamovix-mockup-wrapper"
            style={{
              width: "150px",
              minWidth: "150px",
              height: "116px",
              backgroundColor: "#F8F9FE",
              border: "1px solid #ECEAFD",
              borderRadius: "12px",
              padding: "9px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.02)",
              flexShrink: 0,
              boxSizing: "border-box",
            }}
          >
            {/* Top Right Floating Plus Badge */}
            <div
              style={{
                position: "absolute",
                top: "7px",
                right: "7px",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "#6366F1",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0 2px 5px rgba(99, 102, 241, 0.35)",
                lineHeight: 1,
                zIndex: 2,
              }}
            >
              +
            </div>

            {/* Inner White Card */}
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "8px 10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <DualLipstickGraphic />

              {/* Skeleton lines */}
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: "40px",
                    height: "5px",
                    backgroundColor: "#ECEBFC",
                    borderRadius: "3px",
                  }}
                />
                <div
                  style={{
                    width: "32px",
                    height: "5px",
                    backgroundColor: "#ECEBFC",
                    borderRadius: "3px",
                  }}
                />
                <div
                  style={{
                    width: "22px",
                    height: "5px",
                    backgroundColor: "#ECEBFC",
                    borderRadius: "3px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Setup Progress & Stepper */}
      <div
        className="glamovix-bottom-bar"
        style={{
          backgroundColor: "#F8F9FE",
          border: "1px solid #ECEAFD",
          borderRadius: "14px",
          padding: "16px 22px 22px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "nowrap",
          gap: "12px",
        }}
      >
        {/* Left: Checkmark + Text */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              backgroundColor: "#818CF8",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div
              style={{
                fontSize: "13.5px",
                fontWeight: "700",
                color: "#111827",
                lineHeight: 1.2,
              }}
            >
              Setup progress
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#6B7280",
                marginTop: "2px",
              }}
            >
              {completedCount} of 2 steps completed
            </div>
          </div>
        </div>

        {/* Right: Stepper */}
        <div
          className="glamovix-stepper-wrapper"
          style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
        >
          {/* Step 1 Node */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#5E4BF8",
                color: "#FFFFFF",
                fontSize: "11px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              1
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#5E4BF8",
                marginTop: "6px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              Theme Extension
            </span>
          </div>

          {/* Stepper Connecting Bar */}
          <div
            style={{
              width: "60px",
              height: "3px",
              backgroundColor: "#E5E7EB",
              borderRadius: "2px",
              marginTop: "9.5px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: productCompleted ? "100%" : "60%",
                height: "100%",
                backgroundColor: "#5E4BF8",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          {/* Step 2 Node */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                border: productCompleted ? "none" : "1.5px solid #D1D5DB",
                backgroundColor: productCompleted ? "#5E4BF8" : "#FFFFFF",
                color: productCompleted ? "#FFFFFF" : "#9CA3AF",
                fontSize: "11px",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              2
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: productCompleted ? "600" : "500",
                color: productCompleted ? "#5E4BF8" : "#6B7280",
                marginTop: "6px",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              Products
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
