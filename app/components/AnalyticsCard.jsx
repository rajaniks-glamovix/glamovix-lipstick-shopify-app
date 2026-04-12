import React from "react";

export default function AnalyticsCard({
  title,
  value,
  subtitle,
  children,
  icon,
  trend,
}) {
  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "20px",
        border: "1px solid #e1e1e1",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        transition: "box-shadow 0.15s ease",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
        width: "100%",
        boxSizing: "border-box",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Header: Title + Trend */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              backgroundColor: "#f6f6f7",
              borderRadius: "8px",
              color: "#5c5f62",
            }}
          >
            {icon || (
              <svg
                viewBox="0 0 20 20"
                style={{ width: "16px", height: "16px", fill: "currentColor" }}
              >
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm-1 4a1 1 0 112 0 1 1 0 01-2 0zm1 11a7 7 0 110-14 7 7 0 010 14zm1-8h-2v1h1v3h-1v1h3v-1h-1V9z" />
              </svg>
            )}
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: "500",
              color: "#6d7175",
            }}
          >
            {title}
          </span>
        </div>

        {trend && (
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: trend.isPositive ? "#1a7346" : "#b5200e",
              backgroundColor: trend.isPositive ? "#e3f1df" : "#fbeae5",
              padding: "2px 8px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "2px",
              lineHeight: "1.4",
            }}
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                width: "10px",
                height: "10px",
                transform: trend.isPositive ? "none" : "rotate(180deg)",
              }}
            >
              <path d="M6 9V3M3 5l3-3 3 3" />
            </svg>
            {trend.value}%
          </div>
        )}
      </div>

      {/* Value */}
      {value !== undefined && (
        <div
          style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a1a",
            lineHeight: "1",
            letterSpacing: "-0.5px",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      )}

      {subtitle && (
        <div
          style={{
            fontSize: "12px",
            color: "#8c9196",
            fontWeight: "400",
            marginTop: "4px",
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Chart / Children */}
      {children && (
        <div
          style={{
            marginTop: "12px",
            width: "100%",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
