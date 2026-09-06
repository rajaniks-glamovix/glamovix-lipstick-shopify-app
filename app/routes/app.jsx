/* global process */
import { Outlet, useLoaderData, useRouteError, useNavigation, Link } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import * as billingConfigs from "../billing.constants";
import GlamovixChatBot from "../components/GlamovixChatBot";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const { shop } = session;

  const url = new URL(request.url);
  const isBillingPage =
    url.pathname === "/app/billing" || url.pathname === "/app/help";

  // If not on the manual billing selection page, enforce the Essential plan
  if (!isBillingPage) {
    const billingCheck = await billing.check({
      plans: [
        billingConfigs.MONTHLY_PLAN_ESSENTIAL,
        billingConfigs.YEARLY_PLAN_ESSENTIAL,
        billingConfigs.MONTHLY_PLAN_BASIC,
        billingConfigs.YEARLY_PLAN_BASIC,
        billingConfigs.MONTHLY_PLAN_PREMIUM,
        billingConfigs.YEARLY_PLAN_PREMIUM,
        billingConfigs.MONTHLY_PLAN_ENTERPRISE,
        billingConfigs.YEARLY_PLAN_ENTERPRISE,
      ],
    });

    if (!billingCheck.hasActivePayment) {
      const returnUrl = `${process.env.SHOPIFY_APP_URL}/auth/login?shop=${shop}`;

      // Redirect directly to Shopify's billing approval page for the Essential plan
      return await billing.request({
        plan: billingConfigs.MONTHLY_PLAN_ESSENTIAL,
        isTest: false,
        returnUrl,
      });
    }
  }

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData();
  const navigation = useNavigation();
  const isPageLoading = navigation.state === "loading";

  return (
    <AppProvider embedded apiKey={apiKey}>
      <style>{`
        @keyframes glamovixProgressBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {isPageLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            zIndex: 999999,
            overflow: "hidden",
            backgroundColor: "rgba(0, 0, 0, 0.08)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, #1a1a1a, #a855f7, #008060, #1a1a1a)",
              animation:
                "glamovixProgressBar 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
            }}
          />
        </div>
      )}

      <ui-nav-menu>
        <Link to="/app" rel="home">Home</Link>
        <Link to="/app/product">Product</Link>
        <Link to="/app/3d-editor">3D Editor</Link>
        <Link to="/app/analytics">Analytics</Link>
        <Link to="/app/billing">Billing</Link>
        <Link to="/app/help">Help & Support</Link>
      </ui-nav-menu>
      <Outlet />
      <GlamovixChatBot />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
