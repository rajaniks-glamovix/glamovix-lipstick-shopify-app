import { BetaAnalyticsDataClient } from "@google-analytics/data";
import path from "path";

/**
 * Note: Place your 'gtm.json' in the parent directory of your project folder.
 */
const CREDENTIALS_PATH = path.join(process.cwd(), "..", "credentials/gtm.json");

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: CREDENTIALS_PATH,
});

/**
 * Fetches REAL-TIME analytics data (last 30 minutes) for ALL companies.
 * (Modified for testing: custom dimension removed)
 */
export async function getGTMRealtimeAnalytics(propertyId) {
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: {
        filter: {
          fieldName: "eventName",
          inListFilter: {
            values: ["add_to_cart", "photo_mode", "model_viewer"],
            caseSensitive: true,
          },
        },
      },
    });

    const results = { add_to_cart: 0, photo_mode: 0, model_viewer: 0 };

    if (response.rows) {
      response.rows.forEach((row) => {
        const eventName = row.dimensionValues[0].value;
        if (results.hasOwnProperty(eventName)) {
          results[eventName] += parseInt(row.metricValues[0].value, 10);
        }
      });
    }
    console.log("results:", results);
    return results;
  } catch (error) {
    console.error("Realtime Error:", error.message);
    return { add_to_cart: 0, photo_mode: 0, model_viewer: 0 };
  }
}
/**
 * Fetches standard processed analytics data filtered by a specific company.
 * Note: Custom dimensions (like company_name) take 24-48 hours to process.
 */
/**
 * Shared helper: converts a timeframe string into GA4-compatible date ranges.
 */
function getDateRangeForTimeframe(timeframe = "last_month") {
  let currentStart, currentEnd = "today";
  let prevStart, prevEnd;
  let timeDimension = "date";

  switch (timeframe) {
    case "last_week":
      currentStart = "7daysAgo"; prevStart = "14daysAgo"; prevEnd = "8daysAgo"; break;
    case "last_month":
      currentStart = "30daysAgo"; prevStart = "60daysAgo"; prevEnd = "31daysAgo"; break;
    case "three_month":
      currentStart = "90daysAgo"; prevStart = "180daysAgo"; prevEnd = "91daysAgo"; break;
    case "six_month":
      currentStart = "180daysAgo"; prevStart = "360daysAgo"; prevEnd = "181daysAgo";
      timeDimension = "yearMonth"; break;
    case "one_year":
      currentStart = "365daysAgo"; prevStart = "730daysAgo"; prevEnd = "366daysAgo";
      timeDimension = "yearMonth"; break;
    default:
      currentStart = "30daysAgo"; prevStart = "60daysAgo"; prevEnd = "31daysAgo";
  }

  return { currentStart, currentEnd, prevStart, prevEnd, timeDimension };
}

export async function getGTMEventAnalytics(
  propertyId,
  companyName,
  timeframe = "last_month",
) {
  const { currentStart, currentEnd, prevStart, prevEnd, timeDimension } = getDateRangeForTimeframe(timeframe);

  const commonFilter = {
    andGroup: {
      expressions: [
        {
          filter: {
            fieldName: "eventName",
            inListFilter: {
              values: [
                "add_to_cart",
                "photo_mode",
                "model_viewer",
                "tryon_click",
              ],
              caseSensitive: true,
            },
          },
        },
        {
          filter: {
            fieldName: "customEvent:company_name",
            stringFilter: { value: companyName, caseSensitive: true },
          },
        },
      ],
    },
  };

  try {
    const [[seriesRes], [currentTotalsRes], [prevTotalsRes]] =
      await Promise.all([
        // 1. Time-series data for sparkline charts
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: currentStart, endDate: currentEnd }],
          dimensions: [{ name: "eventName" }, { name: timeDimension }],
          metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
          dimensionFilter: commonFilter,
          orderBys: [{ dimension: { dimensionName: timeDimension } }],
        }),
        // 2. Current Totals
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: currentStart, endDate: currentEnd }],
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
          dimensionFilter: commonFilter,
        }),
        // 3. Previous Totals
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: prevStart, endDate: prevEnd }],
          dimensions: [{ name: "eventName" }],
          metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
          dimensionFilter: commonFilter,
        }),
      ]);

    const results = {
      tryon_click: {
        count: 0,
        users: 0,
        previous_count: 0,
        previous_users: 0,
        series: [],
      },
      add_to_cart: {
        count: 0,
        users: 0,
        previous_count: 0,
        previous_users: 0,
        series: [],
      },
      photo_mode: {
        count: 0,
        users: 0,
        previous_count: 0,
        previous_users: 0,
        series: [],
      },
      model_viewer: {
        count: 0,
        users: 0,
        previous_count: 0,
        previous_users: 0,
        series: [],
      },
    };

    // Parse Current Totals
    if (currentTotalsRes.rows) {
      currentTotalsRes.rows.forEach((row) => {
        const eventName = row.dimensionValues[0].value;
        const count = parseInt(row.metricValues[0].value, 10);
        const users = parseInt(row.metricValues[1].value, 10);

        if (results[eventName]) {
          results[eventName].count += count;
          results[eventName].users += users;
        }
      });
    }

    // Parse Previous Totals
    if (prevTotalsRes.rows) {
      prevTotalsRes.rows.forEach((row) => {
        const eventName = row.dimensionValues[0].value;
        const count = parseInt(row.metricValues[0].value, 10);
        const users = parseInt(row.metricValues[1].value, 10);

        if (results[eventName]) {
          results[eventName].previous_count += count;
          results[eventName].previous_users += users;
        }
      });
    }

    // Parse Series into a lookup map per event
    const seriesMap = {};
    Object.keys(results).forEach((ev) => {
      seriesMap[ev] = {};
    });

    if (seriesRes.rows) {
      seriesRes.rows.forEach((row) => {
        const eventName = row.dimensionValues[0].value;
        const timePoint = row.dimensionValues[1].value;
        const count = parseInt(row.metricValues[0].value, 10);
        const users = parseInt(row.metricValues[1].value, 10);

        if (seriesMap[eventName]) {
          seriesMap[eventName][timePoint] = { count, users };
        }
      });
    }

    // Generate full date range and fill zeros
    const generateDateRange = (daysAgoStr) => {
      const match = daysAgoStr.match(/(\d+)daysAgo/);
      return match ? parseInt(match[1], 10) : 0;
    };

    const startDays = generateDateRange(currentStart);
    const allDates = [];
    const today = new Date();

    if (timeDimension === "date") {
      for (let i = startDays; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        // GA4 date format: YYYYMMDD
        const key =
          d.getFullYear().toString() +
          (d.getMonth() + 1).toString().padStart(2, "0") +
          d.getDate().toString().padStart(2, "0");
        allDates.push(key);
      }
    } else {
      // yearMonth format: YYYYMM
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - startDays);
      const current = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1,
      );
      const end = new Date(today.getFullYear(), today.getMonth(), 1);
      while (current <= end) {
        const key =
          current.getFullYear().toString() +
          (current.getMonth() + 1).toString().padStart(2, "0");
        allDates.push(key);
        current.setMonth(current.getMonth() + 1);
      }
    }

    // Build padded series for each event
    Object.keys(results).forEach((eventName) => {
      results[eventName].series = allDates.map((time) => ({
        time,
        count: seriesMap[eventName][time]?.count || 0,
        users: seriesMap[eventName][time]?.users || 0,
      }));
    });

    return results;
  } catch (error) {
    console.error("Error:", error.message);
    return {
      tryon_click: {
        count: 0,
        users: 0,
        previous_count: 0,
        previous_users: 0,
        series: [],
      },
      add_to_cart: {
        count: 0,
        users: 0,
        previous_count: 0,
        previous_users: 0,
        series: [],
      },
    };
  }
}

/**
 * Fetches User demographics (Country, City) and Tech (Browser, Device, OS)
 * filtered for a specific company.
 */
export async function getGTMUserDemographics(
  propertyId,
  companyName,
  timeframe = "last_month",
) {
  const { currentStart, currentEnd } = getDateRangeForTimeframe(timeframe);
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: currentStart, endDate: currentEnd }],

      // Requesting 5 dimensions: Geography + Hardware + Software
      dimensions: [
        { name: "country" },
        { name: "city" },
        { name: "browser" },
        { name: "deviceCategory" },
        { name: "operatingSystem" }, // Added OS here
      ],
      metrics: [{ name: "totalUsers" }],

      dimensionFilter: {
        filter: {
          fieldName: "customEvent:company_name",
          stringFilter: {
            value: companyName,
            caseSensitive: true,
          },
        },
      },
    });

    const results = {
      countries: {},
      cities: {},
      browsers: {},
      devices: {},
      os: {}, // New category for Operating Systems
    };

    if (response.rows) {
      response.rows.forEach((row) => {
        const country = row.dimensionValues[0].value;
        const city = row.dimensionValues[1].value;
        const browser = row.dimensionValues[2].value;
        const device = row.dimensionValues[3].value;
        const os = row.dimensionValues[4].value;
        const userCount = parseInt(row.metricValues[0].value, 10);

        results.countries[country] =
          (results.countries[country] || 0) + userCount;
        results.cities[city] = (results.cities[city] || 0) + userCount;
        results.browsers[browser] =
          (results.browsers[browser] || 0) + userCount;
        results.devices[device] = (results.devices[device] || 0) + userCount;
        results.os[os] = (results.os[os] || 0) + userCount;
      });
    }

    console.log("GA4 demographics:", results);
    return results;
  } catch (error) {
    console.error("Error fetching GA4 demographics:", error.message);
    return { countries: {}, cities: {}, browsers: {}, devices: {}, os: {} };
  }
}
