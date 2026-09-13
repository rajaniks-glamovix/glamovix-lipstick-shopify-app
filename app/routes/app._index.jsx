import { useState, useEffect } from "react";
import {
  useFetcher,
  useNavigate,
  useLoaderData,
  useSubmit,
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import AnalyticsCard from "../components/AnalyticsCard";
import OnboardingGuide from "../components/OnboardingGuide";
import analyticsData from "../data/analyticsData.json";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getGTMEventAnalytics } from "../analytics.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;
  const shopName = shop.replace(".myshopify.com", "");
  const url = new URL(request.url);
  const timeframe = url.searchParams.get("timeframe") || "three_month";
  const stats = await getGTMEventAnalytics(
    process.env.PROPERTY_ID,
    shopName,
    timeframe,
  );
  return { shop: session.shop, stats, analyticsData, timeframe };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  return {};
};

const MiniChart = ({ data, dataKey, color }) => (
  <div style={{ height: "60px", width: "100%", marginTop: "10px" }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          contentStyle={{ display: "none" }}
          cursor={{ stroke: color, strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          fillOpacity={1}
          fill={`url(#color${dataKey})`}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default function Index() {
  const {
    shop,
    stats,
    analyticsData,
    timeframe: defaultTimeframe,
  } = useLoaderData();
  const submit = useSubmit();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState(defaultTimeframe);

  const handleTimeframeChange = (e) => {
    const newVal = e.target.value;
    setTimeframe(newVal);
    submit({ timeframe: newVal }, { method: "get" });
  };

  const [navigatingProduct, setNavigatingProduct] = useState(false);
  const [navigatingTheme, setNavigatingTheme] = useState(false);

  // Persistence for setup progress
  const [productCompleted, setProductCompleted] = useState(false);
  const [themeCompleted, setThemeCompleted] = useState(false);

  useEffect(() => {
    const pDone = localStorage.getItem("valyatha_product_done") === "true";
    const tDone = localStorage.getItem("valyatha_theme_done") === "true";
    setProductCompleted(pDone);
    setThemeCompleted(tDone);
  }, []);

  const completedCount = (productCompleted ? 1 : 0) + (themeCompleted ? 1 : 0);

  const timeframeOptions = [
    { label: "Last Week", value: "last_week" },
    { label: "Last Month", value: "last_month" },
    { label: "3 Months", value: "three_month" },
    { label: "6 Months", value: "six_month" },
    { label: "1 Year", value: "one_year" },
  ];

  const calculateTrend = (current, previous) => {
    if (previous === 0)
      return { value: current > 0 ? "100.0" : "0.0", isPositive: true };
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentage).toFixed(1),
      isPositive: percentage >= 0,
    };
  };

  const trends = {
    tryons: calculateTrend(
      stats?.tryon_click?.count || 0,
      stats?.tryon_click?.previous_count || 0,
    ),
    users: calculateTrend(
      stats?.tryon_click?.users || 0,
      stats?.tryon_click?.previous_users || 0,
    ),
    cart: calculateTrend(
      stats?.add_to_cart?.count || 0,
      stats?.add_to_cart?.previous_count || 0,
    ),
  };

  const icons = {
    users: (
      <svg viewBox="0 0 20 20" style={{ width: "20px" }}>
        <path
          d="M10 2a4 4 0 100 8 4 4 0 000-8zM7 11a3 3 0 00-3 3v1h12v-1a3 3 0 00-3-3H7z"
          fill="currentColor"
        />
      </svg>
    ),
    lipstick: (
      <svg viewBox="0 0 24 24" style={{ width: "20px" }}>
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"
          fill="currentColor"
        />
      </svg>
    ),
    cart: (
      <svg viewBox="0 0 20 20" style={{ width: "20px" }}>
        <path
          d="M6 2a1 1 0 00-1 1v1H2a1 1 0 000 2h1.22l1.35 7.42a3 3 0 002.93 2.58h6a3 3 0 002.93-2.58L17.78 6H19a1 1 0 100-2h-3V3a1 1 0 00-1-1H6zm1 2h6v1H7V4z"
          fill="currentColor"
        />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 20 20" style={{ width: "20px", height: "20px" }}>
        <path
          d="M14.707 6.293a1 1 0 00-1.414 0L9 10.586 6.707 8.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l5-5a1 1 0 000-1.414z"
          fill="currentColor"
        />
      </svg>
    ),
    product: (
      <svg viewBox="0 0 20 20" style={{ width: "20px", height: "20px" }}>
        <path
          d="M5 2a1 1 0 011-1h8a1 1 0 011 1v2h2a1 1 0 011 1v11a2 2 0 01-2 2H4a2 2 0 01-2-2V5a1 1 0 011-1h2V2zm9 2V3H6v1h8zM4 6v10a1 1 0 001 1h10a1 1 0 001-1V6H4z"
          fill="currentColor"
        />
      </svg>
    ),
    store: (
      <svg viewBox="0 0 20 20" style={{ width: "20px", height: "20px" }}>
        <path
          d="M18 5.5a.5.5 0 01.5.5v2a.5.5 0 01-.5.5H1.5a.5.5 0 01-.5-.5v-2a.5.5 0 01.5-.5H18zm-2.5 4v6.5h-11V9.5h-2V16a1 1 0 001 1h13a1 1 0 001-1V9.5h-2z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  const goToThemeEditor = () => {
    setNavigatingTheme(true);
    localStorage.setItem("valyatha_theme_done", "true");
    setThemeCompleted(true);
    const shopName = shop.replace(".myshopify.com", "");
    const themeEditorUrl = `https://admin.shopify.com/store/${shopName}/themes/current/editor?template=product`;
    window.open(themeEditorUrl, "_top");
    setTimeout(() => setNavigatingTheme(false), 1500);
  };

  const goToProducts = () => {
    setNavigatingProduct(true);
    localStorage.setItem("valyatha_product_done", "true");
    setProductCompleted(true);
    navigate("/app/product");
  };

  return (
    <s-page heading="Home">
      <s-stack rowGap="large">
        <OnboardingGuide
          completedCount={completedCount}
          themeCompleted={themeCompleted}
          productCompleted={productCompleted}
          onGoToTheme={goToThemeEditor}
          onGoToProducts={goToProducts}
          navigatingTheme={navigatingTheme}
          navigatingProduct={navigatingProduct}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <select
              value={timeframe}
              onChange={handleTimeframeChange}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                outline: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
              }}
            >
              {timeframeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "16px", width: "100%", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 250px", minWidth: 0 }}>
              <AnalyticsCard
                value={stats?.tryon_click?.count || 0}
                title={"No of tryons"}
                icon={icons.lipstick}
                trend={trends.tryons}
              >
                <MiniChart
                  data={stats?.tryon_click?.series || []}
                  dataKey="count"
                  color="#005bd3"
                />
              </AnalyticsCard>
            </div>
            <div style={{ flex: "1 1 250px", minWidth: 0 }}>
              <AnalyticsCard
                value={stats?.tryon_click?.users || 0}
                title={"No of users"}
                icon={icons.users}
                trend={trends.users}
              >
                <MiniChart
                  data={stats?.tryon_click?.series || []}
                  dataKey="users"
                  color="#008060"
                />
              </AnalyticsCard>
            </div>
            <div style={{ flex: "1 1 250px", minWidth: 0 }}>
              <AnalyticsCard
                value={stats?.add_to_cart?.count || 0}
                title={"No of add to cart"}
                icon={icons.cart}
                trend={trends.cart}
              >
                <MiniChart
                  data={stats?.add_to_cart?.series || []}
                  dataKey="count"
                  color="#bf0711"
                />
              </AnalyticsCard>
            </div>
          </div>
        </div>
      </s-stack>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
