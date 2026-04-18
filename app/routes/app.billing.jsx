import { useState } from "react";
import { useLoaderData, useNavigation, useSubmit, Form } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import * as billingConfigs from "../billing.constants";

export const loader = async ({ request }) => {
  const { billing } = await authenticate.admin(request);

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
    isTest: false,
  });

  return {
    billingCheck,
  };
};

export const action = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const { shop } = session;
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (!plan) return null;

  const returnUrl = `${process.env.SHOPIFY_APP_URL}/auth/login?shop=${shop}`;

  return await billing.request({
    plan,
    isTest: false,
    returnUrl,
  });
};

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    style={{ width: "18px", height: "18px", fill: "#008060" }}
  >
    <path
      fillRule="evenodd"
      d="M15.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L8 11.586l6.293-6.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export default function BillingPage() {
  const { billingCheck } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: "Essential",
      monthlyPrice: 39,
      yearlyPrice: 390,
      monthlyPlan: billingConfigs.MONTHLY_PLAN_ESSENTIAL,
      yearlyPlan: billingConfigs.YEARLY_PLAN_ESSENTIAL,
      features: [
        "Unlimited Try-ons",
        "30 products",
        "3D Models support",
        "Basic Email support",
        "Standard analytics",
      ],
    },
    {
      name: "Basic",
      monthlyPrice: 89,
      yearlyPrice: 890,
      monthlyPlan: billingConfigs.MONTHLY_PLAN_BASIC,
      yearlyPlan: billingConfigs.YEARLY_PLAN_BASIC,
      features: [
        "Everything in Essential",
        "100 products",
        "Priority email support",
        "Standard analytics",
      ],
      popular: true,
    },
    {
      name: "Premium",
      monthlyPrice: 399,
      yearlyPrice: 3990,
      monthlyPlan: billingConfigs.MONTHLY_PLAN_PREMIUM,
      yearlyPlan: billingConfigs.YEARLY_PLAN_PREMIUM,
      features: [
        "Everything in Basic",
        "600 products",
        "Custom 3D models upload",
        "requests 3D model creation",
        "24 * 7 Priority support",
        "Custom branding",
        "Advanced analytics",
      ],
    },
    {
      name: "Enterprise",
      monthlyPrice: 799,
      yearlyPrice: 7990,
      monthlyPlan: billingConfigs.MONTHLY_PLAN_ENTERPRISE,
      yearlyPlan: billingConfigs.YEARLY_PLAN_ENTERPRISE,
      features: [
        "Everything in Premium",
        "Unlimited products",
        "Full 3D model management",
        "Dedicated 24 * 7 support",
        "Custom Branding & UI",
        "Enterprise analytics",
        "Custom integrations",
      ],
    },
  ];

  const currentPlan = billingCheck?.appSubscriptions?.[0]?.name;

  return (
    <s-page heading="Billing & Subscription">
      <div
        style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 20px" }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Billing Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f1f1f1",
              padding: "4px",
              borderRadius: "30px",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              style={{
                border: "none",
                padding: "8px 24px",
                borderRadius: "26px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: !isYearly ? "white" : "transparent",
                color: !isYearly ? "#1a1c1d" : "#6d7175",
                boxShadow: !isYearly ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              style={{
                border: "none",
                padding: "8px 24px",
                borderRadius: "26px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                backgroundColor: isYearly ? "white" : "transparent",
                color: isYearly ? "#1a1c1d" : "#6d7175",
                boxShadow: isYearly ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              Yearly
              <span
                style={{
                  fontSize: "11px",
                  backgroundColor: "#e3f1df",
                  color: "#008060",
                  padding: "2px 8px",
                  borderRadius: "10px",
                }}
              >
                2 MONTHS FREE
              </span>
            </button>
          </div>

          {/* Plans Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
              width: "100%",
              alignItems: "stretch",
            }}
          >
            {plans.map((plan) => {
              const planId = isYearly ? plan.yearlyPlan : plan.monthlyPlan;
              const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
              const isCurrent = currentPlan === planId;
              const savings = plan.monthlyPrice * 12 - plan.yearlyPrice;
              const isSubmitting =
                navigation.state !== "idle" &&
                navigation.formData?.get("plan") === planId;

              return (
                <div
                  key={plan.name}
                  style={{
                    background: isCurrent
                      ? "linear-gradient(135deg, #f0fdf4 0%, #ffffff 40%)"
                      : plan.popular
                        ? "linear-gradient(135deg, #eef2ff 0%, #ffffff 40%)"
                        : "#ffffff",
                    borderRadius: "20px",
                    border: isCurrent
                      ? "2px solid #16a34a"
                      : plan.popular
                        ? "2px solid #6366f1"
                        : "1px solid #e5e7eb",
                    padding: "32px 24px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    boxShadow: isCurrent
                      ? "0 8px 32px rgba(22,163,74,0.12)"
                      : plan.popular
                        ? "0 8px 32px rgba(99,102,241,0.15)"
                        : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = isCurrent
                      ? "0 16px 48px rgba(22,163,74,0.18)"
                      : plan.popular
                        ? "0 16px 48px rgba(99,102,241,0.22)"
                        : "0 8px 32px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isCurrent
                      ? "0 8px 32px rgba(22,163,74,0.12)"
                      : plan.popular
                        ? "0 8px 32px rgba(99,102,241,0.15)"
                        : "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)";
                  }}
                >
                  {/* Badge */}
                  {isCurrent && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-13px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #16a34a, #15803d)",
                        color: "white",
                        padding: "5px 18px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        whiteSpace: "nowrap",
                        width: "max-content",
                        boxShadow: "0 2px 8px rgba(22,163,74,0.3)",
                      }}
                    >
                      ✓ Active Plan
                    </div>
                  )}

                  {!isCurrent && plan.popular && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-13px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color: "white",
                        padding: "5px 18px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        fontWeight: "700",
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        whiteSpace: "nowrap",
                        width: "max-content",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
                      }}
                    >
                      ★ Most Popular
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: "700",
                      color: "#111827",
                      margin: "0 0 16px 0",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "4px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "36px",
                        fontWeight: "800",
                        color: "#111827",
                        letterSpacing: "-0.02em",
                        lineHeight: "1",
                      }}
                    >
                      ${price}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#9ca3af",
                        fontWeight: "500",
                      }}
                    >
                      /{isYearly ? "year" : "mo"}
                    </span>
                  </div>

                  {isYearly && (
                    <div
                      style={{
                        marginTop: "4px",
                        marginBottom: "4px",
                        fontSize: "13px",
                        color: "#16a34a",
                        fontWeight: "600",
                        backgroundColor: "#f0fdf4",
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "6px",
                        width: "fit-content",
                      }}
                    >
                      Save ${savings}/yr
                    </div>
                  )}

                  {/* CTA Button — placed BEFORE features */}
                  <div style={{ marginTop: "20px", marginBottom: "24px" }}>
                    <Form method="post">
                      <input type="hidden" name="plan" value={planId} />
                      <s-button
                        variant={
                          isCurrent
                            ? "secondary"
                            : plan.popular
                              ? "primary"
                              : "secondary"
                        }
                        full-width
                        onClick={(e) => {
                          if (!isCurrent) {
                            submit(e.currentTarget.closest("form"));
                          }
                        }}
                        disabled={
                          isCurrent
                            ? "true"
                            : navigation.state !== "idle"
                              ? "true"
                              : undefined
                        }
                        loading={isSubmitting ? "true" : undefined}
                      >
                        {isCurrent ? "✓ Current Plan" : "Get Started"}
                      </s-button>
                    </Form>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, #e5e7eb, transparent)",
                      marginBottom: "20px",
                    }}
                  />

                  {/* Features */}
                  <div
                    style={{
                      flexGrow: 1,
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: "#9ca3af",
                        margin: "0 0 14px 0",
                      }}
                    >
                      What's included
                    </p>
                    <ul
                      style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              backgroundColor: isCurrent
                                ? "#dcfce7"
                                : plan.popular
                                  ? "#e0e7ff"
                                  : "#f3f4f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <svg
                              viewBox="0 0 20 20"
                              style={{
                                width: "12px",
                                height: "12px",
                                fill: isCurrent
                                  ? "#16a34a"
                                  : plan.popular
                                    ? "#6366f1"
                                    : "#6b7280",
                              }}
                            >
                              <path
                                fillRule="evenodd"
                                d="M15.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L8 11.586l6.293-6.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span
                            style={{
                              fontSize: "13.5px",
                              color: "#374151",
                              lineHeight: "1.4",
                              fontWeight: "450",
                            }}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
