# 💄 Glamovix Lipstick Try-On — Shopify AR App

[![Shopify App](https://img.shields.io/badge/Shopify-App_Bridge-96bf48?style=for-the-badge&logo=shopify&logoColor=white)](https://shopify.dev/docs/apps)
[![React Router 7](https://img.shields.io/badge/React_Router_7-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![React 18](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)
[![AWS S3 & SES](https://img.shields.io/badge/AWS-S3_%26_SES-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)

**Glamovix Lipstick Try-On** is an immersive, real-time 3D and Augmented Reality (AR) virtual lipstick try-on platform built for Shopify merchants. Powered by **React Router 7**, **Shopify Polaris**, and **WebAR**, Glamovix empowers beauty brands to showcase interactive virtual try-ons, customize 3D product models, track detailed shopper analytics, and drive higher conversion rates directly on their online storefronts.

---

## ✨ Key Features

- **🎨 Interactive 3D & AR Shade Editor (`app.3d-editor.jsx`)**
  - Upload, preview, and manage 3D `.glb` product models via [@google/model-viewer](https://modelviewer.dev/).
  - Customize virtual lipstick shades, textures, shimmer effects, and finishes in real-time.
  - Seamless AWS S3 cloud integration for lightning-fast asset delivery and configuration storage.

- **🛍️ Seamless Shopify Product & Catalog Mapping (`app.product.jsx`)**
  - Connect your Shopify inventory directly to virtual try-on shades and models.
  - Automated catalog sync and product updating via Shopify Admin GraphQL API and webhooks (`api.update-product.jsx`).

- **📊 Storefront Analytics & Engagement Tracking (`app.analytics.jsx`)**
  - Integrated with Google Tag Manager (GTM) and Google Analytics Data API.
  - Monitor virtual try-on sessions, shade popularity, shopper engagement, and conversion metrics across custom timeframes.
  - Beautiful, interactive data charts powered by [Recharts](https://recharts.org/).

- **💳 Tiered Subscription & Billing Management (`app.billing.jsx`)**
  - Built-in Shopify Billing API integration supporting **Essential**, **Basic**, **Premium**, and **Enterprise** plans.
  - Includes an automated **7-Day Free Trial** on the Essential tier.
  - Flexible monthly and annual billing options.

- **🔌 Plug-and-Play Storefront Extension (`extensions/glamovix-tryon-button`)**
  - Shopify 2.0 Theme App Extension that embeds an interactive **"Try-On"** button and virtual modal directly onto Product Details Pages (PDPs).
  - Zero code modifications required—install and configure with drag-and-drop ease inside the Shopify Theme Editor.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | React Router 7, React 18, Vite, TailwindCSS / Custom Vanilla CSS |
| **UI Components** | [Shopify Polaris](https://polaris.shopify.com/) v13, App Bridge v4, Recharts |
| **3D & AR Rendering** | `@google/model-viewer`, WebGL, WebAR |
| **Backend & ORM** | Node.js, Prisma ORM (SQLite / MySQL / PostgreSQL compatible) |
| **Shopify APIs** | Shopify Admin GraphQL API, App-Specific Webhooks, Theme App Extensions |
| **Cloud Services** | AWS S3 (3D GLB Asset & JSON Storage), AWS SES (Email Notifications), Google Analytics Data API |

---

## 🗂️ Project Structure

```text
glamovix-lipstick-tryon/
├── app/
│   ├── components/            # Reusable UI components (AnalyticsCard, ProductCard)
│   ├── data/                  # Static & mock analytics data payloads
│   ├── routes/                # Application routes and API handlers
│   │   ├── app._index.jsx     # Dashboard & main overview with analytics summary
│   │   ├── app.3d-editor.jsx  # Interactive 3D model & AR shade editor
│   │   ├── app.product.jsx    # Storefront product mapping & shade configuration
│   │   ├── app.analytics.jsx  # Deep-dive GTM & engagement analytics dashboard
│   │   ├── app.billing.jsx    # Subscription tiers & Shopify billing checkout
│   │   ├── app.help.jsx       # Merchant onboarding & troubleshooting center
│   │   ├── api.update-product # API endpoint for syncing shade metadata
│   │   └── webhooks.*.jsx     # Shopify compliance, product, and uninstall webhooks
│   ├── utils/                 # Currency formatting & helper utilities
│   ├── analytics.server.js    # GTM & Google Analytics server-side fetchers
│   ├── billing.constants.js   # Subscription plan names and tier identifiers
│   ├── s3.server.js           # AWS S3 client for uploading models & JSON settings
│   ├── ses.server.js          # AWS SES email service integration
│   └── shopify.server.js      # Shopify App configuration, auth, and billing rules
├── extensions/
│   └── glamovix-tryon-button/ # Shopify Storefront Theme App Extension (Liquid / Blocks)
├── prisma/
│   └── schema.prisma          # Prisma database schema for Shopify session storage
├── shopify.app.toml           # Shopify App manifest (scopes, webhooks, embeds)
└── package.json               # Dependencies and scripts
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: Version `>= 20.19 < 22` or `>= 22.12`
- **Shopify CLI**: [Install Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)
- **AWS Account**: S3 Bucket and IAM user credentials with read/write permissions for storing 3D models.
- **Shopify Partner Account**: To create development stores and test app installations.

### 2. Environment Variables (`.env`)
Create a `.env` file in the project root with the following configuration:

```ini
# Shopify App Credentials
SHOPIFY_API_KEY=your_shopify_api_key
SHOPIFY_API_SECRET=your_shopify_api_secret
SCOPES=write_products,write_metaobjects,write_metaobject_definitions
SHOPIFY_APP_URL=https://your-tunnel-url.trycloudflare.com

# AWS Cloud Services
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-south-1
S3_BUCKET=your-glamovix-s3-bucket

# Application Config & Analytics
IFRAME_URL=https://app.glamovix.com
PROPERTY_ID=your_google_analytics_property_id
```

### 3. Installation & Database Setup
Install project dependencies and initialize the database schema:

```shell
# Install dependencies using npm
npm install

# Initialize Prisma database schema and run migrations
npm run setup
```

### 4. Local Development Server
Start your local development server with Shopify CLI tunnel:

```shell
npm run dev
# OR using shopify CLI directly:
shopify app dev
```
Press `P` in the terminal to open your Shopify Partner dashboard link, install the app onto your development store, and begin testing!

---

## 💎 Subscription Plans & Pricing

Glamovix offers flexible billing tiers tailored to businesses of all sizes. All plans are managed natively through the **Shopify Billing API**:

| Plan Tier | Monthly Price | Yearly Price | Product Limit | Included Features |
| :--- | :--- | :--- | :--- | :--- |
| **Essential** | **$39 / mo** | **$390 / yr** | Up to **30** Products | **✨ 7-Day Free Trial**, 3D Model Viewer, Standard AR Try-On |
| **Basic** | **$89 / mo** | **$890 / yr** | Up to **100** Products | Full Shade Editor, Shimmer Effects, Basic Analytics |
| **Premium** | **$199 / mo** | **$1,990 / yr**| Up to **600** Products | Priority AR Rendering, Advanced GTM Analytics Dashboard |
| **Enterprise**| **$499 / mo** | **$4,990 / yr**| **Unlimited** Products | Dedicated Cloud Storage, Custom Branding, 24/7 Priority Support |

---

## 🎨 Installing the Storefront Try-On Button

The **Glamovix Tryon Button** extension injects an AR Try-On button directly into your product pages without editing code:

1. Open your Shopify Admin and navigate to **Online Store > Themes**.
2. Click **Customize** next to your active theme to open the Shopify Theme Editor.
3. Use the top page selector to switch to **Products > Default product**.
4. In the left-hand sidebar under **Product information**, click **Add block** or **Add section**.
5. Select **Glamovix Tryon Button** from the list of App Blocks.
6. Position the button wherever you prefer (e.g., right below the *Add to Cart* or *Buy Now* button).
7. Click **Save** in the top right corner. Your product pages will now feature an interactive AR Try-On modal!

---

## 🌐 Deployment & Hosting

### Building for Production
Build the optimized React Router bundle and server assets:

```shell
npm run build
```

### Production Database Storage
By default, this project uses **SQLite** via Prisma for session storage (`prisma/schema.prisma`). While suitable for single-instance deployments, high-traffic production environments should use a managed database:

- **PostgreSQL**: [DigitalOcean Managed Postgres](https://www.digitalocean.com/products/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)
- **MySQL**: [PlanetScale](https://planetscale.com/), [DigitalOcean MySQL](https://www.digitalocean.com/products/managed-databases-mysql)
- **MongoDB**: [MongoDB Atlas](https://www.mongodb.com/atlas/database) *(Note: check [Prisma MongoDB gotchas](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma#mongodb))*

To switch databases, update the `datasource db` provider in `prisma/schema.prisma` and run `npx prisma migrate deploy`.

### Recommended Hosting Providers
- **[Google Cloud Run](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run)**: Ideal for containerized Node.js apps requiring auto-scaling and load balancing across regions.
- **[Fly.io](https://fly.io/docs/js/shopify/)**: Fast deployment using the Fly.io CLI to launch Docker instances close to your users.
- **[Render](https://render.com/docs/deploy-shopify-app)**: Simple, automated Git-based Docker deployments.

When configuring your production host, ensure `NODE_ENV=production` is set along with all required environment variables.

---

## ❓ Troubleshooting & Gotchas

> [!WARNING]
> **Database tables don't exist error (`main.Session does not exist`)**  
> If you encounter this error during development, run `npm run setup` in your terminal to generate the Prisma client and execute SQLite database migrations.

> [!NOTE]
> **Navigating inside Embedded iFrames**  
> Because embedded Shopify apps run inside an iframe, standard browser navigation can break user sessions. Always follow these rules:
> 1. Use `<Link>` from `react-router` or `@shopify/polaris` instead of raw `<a>` tags.
> 2. For server-side redirects, always use `redirect` returned from `authenticate.admin(request)`, not from React Router directly.
> 3. Use `useSubmit` or `<Form>` from `react-router` for mutations.

> [!IMPORTANT]
> **Webhook HMAC Validation Failures**  
> Webhook subscriptions created manually via the Shopify Admin UI will fail HMAC validation because they are not signed with your app's secret. Always use **app-specific webhooks** defined directly in `shopify.app.toml`. Shopify automatically syncs these whenever you run `shopify app deploy`.

> [!TIP]
> **Windows ARM64 Prisma Error (`query_engine-windows.dll.node`)**  
> If you cannot load the Prisma query engine on Windows ARM64, set the following environment variable in your shell or `.env`:
> ```shell
> PRISMA_CLIENT_ENGINE_TYPE=binary
> ```

---

## 📚 Official Resources

- [Shopify App React Router Documentation](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify Polaris Design System & Web Components](https://polaris.shopify.com/)
- [Shopify Theme App Extensions Guide](https://shopify.dev/docs/apps/online-store/theme-app-extensions)
- [React Router 7 Documentation](https://reactrouter.com/)
- [AWS SDK for JavaScript v3 Docs](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/welcome.html)
- [@google/model-viewer Documentation](https://modelviewer.dev/)

---

<p align="center">
  Built with ❤️ for Shopify brands by the <b>Glamovix</b> Team.
</p>
