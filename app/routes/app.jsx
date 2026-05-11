import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import * as billingConfigs from "../billing.constants";

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

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        <s-link href="/app">Home</s-link>
        <s-link href="/app/product">Product</s-link>
        <s-link href="/app/3d-editor">3D Editor</s-link>
        <s-link href="/app/analytics">Analytics</s-link>
        <s-link href="/app/billing">Billing</s-link>
        <s-link href="/app/help">Help & Support</s-link>
      </s-app-nav>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
