import { useState, useEffect } from "react";
import { useLoaderData, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";
import {
  getGTMEventAnalytics,
  getGTMUserDemographics,
} from "../analytics.server";
import AnalyticsCard from "../components/AnalyticsCard";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shopName = session.shop.replace(".myshopify.com", "");
  const url = new URL(request.url);
  const timeframe = url.searchParams.get("timeframe") || "three_month";

  try {
    const [stats, demographics] = await Promise.all([
      getGTMEventAnalytics(process.env.PROPERTY_ID, shopName, timeframe),
      getGTMUserDemographics(process.env.PROPERTY_ID, shopName, timeframe),
    ]);

    // Transform GA object format { "India": 5 } into chart array [{ name: "India", value: 5 }]
    const toChartArray = (obj) =>
      Object.entries(obj || {})
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const data = {
      stats,
      demographics: {
        countries: toChartArray(demographics.countries),
        cities: toChartArray(demographics.cities),
      },
      technology: {
        browsers: toChartArray(demographics.browsers),
        devices: toChartArray(demographics.devices),
        os: toChartArray(demographics.os),
      },
    };

    return { data, timeframe };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return { data: null, timeframe };
  }
};

const geoUrl =
  "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

// Modern Donut Chart Component
const DonutChart = ({
  data,
  colors = ["#202223", "#8a38ec", "#a855f7", "#8c9196", "#c9cccf"],
  height = "240px",
}) => {
  return (
    <div style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e1e3e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              padding: "8px 12px",
              fontSize: "13px",
            }}
            itemStyle={{ color: "#202223", fontWeight: "600" }}
          />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Modern Horizontal Bar Chart for Cities
const HorizontalBarChart = ({ data, color = "#202223" }) => {
  return (
    <div style={{ height: "200px", width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            style={{ fontSize: "13px", fontWeight: "500", fill: "#6d7175" }}
          />
          <Tooltip
            cursor={{ fill: "#f6f6f7" }}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #e1e3e5",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              padding: "8px 12px",
              fontSize: "13px",
            }}
            itemStyle={{ color: "#202223", fontWeight: "600" }}
          />
          <Bar
            dataKey="value"
            fill={color}
            radius={[0, 4, 4, 0]}
            barSize={16}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const RealWorldMap = ({ data }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [isClient, setIsClient] = useState(false);

  // Only render the map on client side to avoid SSR issues with external GeoJSON fetch
  useEffect(() => {
    setIsClient(true);
  }, []);

  const safeData = Array.isArray(data) && data.length > 0 ? data : [];
  const maxValue = safeData.length > 0 ? safeData[0].value : 1;

  const countryCoords = {
    "United States": [-95.7, 37.1],
    Canada: [-106.3, 56.1],
    "United Kingdom": [-3.4, 55.4],
    India: [78.9, 20.6],
    Australia: [133.7, -25.2],
    Brazil: [-51.9, -14.2],
    Germany: [10.4, 51.1],
    France: [2.2, 46.2],
    Japan: [138.2, 36.2],
    China: [104.2, 35.9],
    "South Korea": [127.8, 35.9],
    Russia: [105.3, 61.5],
    Mexico: [-102.6, 23.6],
    Indonesia: [113.9, -0.8],
    Turkey: [35.2, 38.9],
    "Saudi Arabia": [45.1, 23.9],
    "South Africa": [22.9, -30.6],
    Nigeria: [8.7, 9.1],
    Argentina: [-63.6, -38.4],
    Italy: [12.6, 41.9],
    Spain: [-3.7, 40.5],
    Netherlands: [5.3, 52.1],
    Sweden: [18.6, 60.1],
    Singapore: [103.8, 1.4],
    "United Arab Emirates": [53.8, 23.4],
    Thailand: [100.9, 15.9],
    Vietnam: [108.3, 14.1],
    Philippines: [121.8, 12.9],
    Malaysia: [101.9, 4.2],
    Poland: [19.1, 51.9],
    "(not set)": null,
  };

  const handleCountryClick = (name, coords) => {
    if (selectedCountry === name) {
      setSelectedCountry(null);
      setPosition({ coordinates: [0, 20], zoom: 1 });
    } else {
      setSelectedCountry(name);
      if (coords) {
        setPosition({ coordinates: coords, zoom: 3 });
      }
    }
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  if (!isClient) {
    return (
      <div
        style={{
          width: "100%",
          height: "540px",
          backgroundColor: "#fafafa",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid #e1e3e5",
        }}
      >
        <span style={{ color: "#6d7175", fontSize: "14px" }}>
          Loading map...
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "540px",
        backgroundColor: "#fafafa",
        borderRadius: "12px",
        padding: "0",
        boxSizing: "border-box",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        border: "1px solid #e1e3e5",
      }}
    >
      {/* Zoom Instructions */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 10,
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #e1e3e5",
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          fontSize: "11px",
          color: "#6d7175",
          fontWeight: "500",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
        Scroll to zoom, drag to pan
      </div>

      <ComposableMap
        projectionConfig={{
          scale: 220,
        }}
        width={900}
        height={540}
        style={{ width: "100%", height: "100%", outline: "none" }}
      >
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
          maxZoom={8}
          minZoom={1}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.name || geo.properties.NAME;
                const isSelected = selectedCountry === name;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() =>
                      handleCountryClick(name, countryCoords[name])
                    }
                    fill={isSelected ? "#202223" : "#e4e5e7"}
                    stroke={isSelected ? "#202223" : "#ffffff"}
                    strokeWidth={0.5 / position.zoom}
                    style={{
                      default: { outline: "none", transition: "all 0.2s ease" },
                      hover: {
                        fill: isSelected ? "#202223" : "#c9cccf",
                        outline: "none",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>

          {safeData.map((country, idx) => {
            const coords = countryCoords[country.name];
            if (!coords) return null;

            const isSelected = selectedCountry === country.name;
            const size = Math.max(
              3,
              ((country.value / maxValue) * 12) / Math.sqrt(position.zoom),
            );

            return (
              <Marker key={idx} coordinates={coords}>
                <circle
                  r={size}
                  fill={isSelected ? "#8a38ec" : "#202223"}
                  fillOpacity={0.25}
                >
                  <animate
                    attributeName="r"
                    values={`${size};${size + 2};${size}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  r={size / 2.5}
                  fill={isSelected ? "#8a38ec" : "#202223"}
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "8px 12px",
          borderRadius: "8px",
          backdropFilter: "blur(4px)",
          border: "1px solid #e1e3e5",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#6d7175",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {selectedCountry ? `Selected: ${selectedCountry}` : "Global Activity"}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "4px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#202223",
            }}
          />
          <span
            style={{ fontSize: "12px", color: "#202223", fontWeight: "500" }}
          >
            Live Engagement Hotspots
          </span>
        </div>
      </div>
    </div>
  );
};

export default function AnalyticsPage() {
  const { data, timeframe: defaultTimeframe } = useLoaderData();
  const submit = useSubmit();
  const [timeframe, setTimeframe] = useState(defaultTimeframe);

  const handleTimeframeChange = (e) => {
    const newVal = e.target.value;
    setTimeframe(newVal);
    submit({ timeframe: newVal }, { method: "get" });
  };

  const timeframeOptions = [
    { label: "Last Week", value: "last_week" },
    { label: "Last Month", value: "last_month" },
    { label: "3 Months", value: "three_month" },
    { label: "6 Months", value: "six_month" },
    { label: "1 Year", value: "one_year" },
  ];

  if (!data) return null;

  const { stats, demographics, technology } = data;

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
    photo: (
      <svg viewBox="0 0 20 20" style={{ width: "20px" }}>
        <path
          d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6zm8 2a2 2 0 100 4 2 2 0 000-4z"
          fill="currentColor"
        />
      </svg>
    ),
    orders: (
      <svg viewBox="0 0 20 20" style={{ width: "20px" }}>
        <path
          d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v10h10V6H5z"
          fill="currentColor"
        />
      </svg>
    ),
    view3d: (
      <svg viewBox="0 0 20 20" style={{ width: "20px" }}>
        <path
          d="M10 2L3 6v8l7 4 7-4V6l-7-4zM5 7.15l5 2.85 5-2.85V12.85l-5 2.85-5-2.85V7.15z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return (
    <s-page heading="Analytics Dashboard">
      <div
        style={{
          backgroundColor: "#f6f6f7",
          minHeight: "100vh",
          padding: "40px 32px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "32px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {/* TIMEFRAME DROPDOWN */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "8px",
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

          {/* TOP SECTION: 4 COLUMN GRID */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
            }}
          >
            <AnalyticsCard
              title="Lipstick Try-ons"
              value={stats?.tryon_click?.count || 0}
              subtitle="Virtual application sessions"
              icon={icons.lipstick}
            />
            <AnalyticsCard
              title="Total Users"
              value={stats?.tryon_click?.users || 0}
              subtitle="High-intent visitors reached"
              icon={icons.users}
            />
            <AnalyticsCard
              title="Photo Mode"
              value={stats?.photo_mode?.count || 0}
              subtitle="User Snapshots"
              icon={icons.photo}
            />
            <AnalyticsCard
              title="Add to Cart"
              value={stats?.add_to_cart?.count || 0}
              subtitle="Purchase Intent"
              icon={icons.cart}
            />
          </div>

          {/* MIDDLE SECTION: FULL WIDTH COUNTRY DATA */}
          <div style={{ width: "100%" }}>
            <AnalyticsCard title="Global Reach & User Presence">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.5fr 1fr",
                  gap: "24px",
                  padding: "0",
                }}
              >
                <RealWorldMap data={demographics.countries} />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "16px 0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#6d7175",
                      marginBottom: "16px",
                      textAlign: "center",
                    }}
                  >
                    User Share by Country
                  </div>
                  <DonutChart data={demographics.countries} height="200px" />
                </div>
              </div>
            </AnalyticsCard>
          </div>

          {/* BOTTOM SECTION: 3 COLUMN BREAKDOWN */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            <AnalyticsCard title="Browser Preferences">
              <div style={{ padding: "16px 0 0" }}>
                <DonutChart
                  data={technology.browsers}
                  colors={["#202223", "#8a38ec", "#a855f7", "#8c9196"]}
                />
              </div>
            </AnalyticsCard>
            <AnalyticsCard title="Device Segmentation">
              <div style={{ padding: "16px 0 0" }}>
                <DonutChart
                  data={technology.devices}
                  colors={["#202223", "#8a38ec", "#c9cccf"]}
                />
              </div>
            </AnalyticsCard>
            <AnalyticsCard title="Top Performing Cities">
              <div style={{ padding: "16px 0 0" }}>
                <HorizontalBarChart
                  data={demographics.cities}
                  color="#202223"
                />
              </div>
            </AnalyticsCard>
          </div>

          {/* FINAL 2x2 INSIGHTS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "24px",
            }}
          >
            <AnalyticsCard
              title="Add-to-Cart Rate"
              value={`${stats?.tryon_click?.count ? ((stats.add_to_cart.count / stats.tryon_click.count) * 100).toFixed(1) : 0}%`}
              subtitle="Try-on users who added to cart"
              icon={icons.orders}
            />
            <AnalyticsCard
              title="3D View Engagement"
              value={stats?.model_viewer?.count || 0}
              subtitle="Total interactive model interactions"
              icon={icons.view3d}
            />
          </div>
        </div>
      </div>
    </s-page>
  );
}
