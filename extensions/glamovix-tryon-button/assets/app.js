//************************************************svgs**************************************//
const sparkleSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 21.75L10.3256 16.9242C10.666 15.6853 11.6425 14.7088 12.8814 14.3685L17.7071 13.0429L12.8814 11.7174C11.6425 11.377 10.666 10.4005 10.3256 9.16164L9 4.33594L7.67439 9.16164C7.33403 10.4005 6.35753 11.377 5.11863 11.7174L0.292893 13.0429L5.11863 14.3685C6.35753 14.7088 7.33403 15.6853 7.67439 16.9242L9 21.75Z"/>
  <path d="M19.5 10.5L20.0895 8.35526C20.2408 7.80461 20.6749 7.37055 21.2255 7.21921L23.3703 6.62969L21.2255 6.04016C20.6749 5.88883 20.2408 5.45476 20.0895 4.90412L19.5 2.75938L18.9105 4.90412C18.7592 5.45476 18.3251 5.88883 17.7745 6.04016L15.6297 6.62969L17.7745 7.21921C18.3251 7.37055 18.7592 7.80461 18.9105 8.35526L19.5 10.5Z"/>
</svg>`;

const lipstickSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 12.2V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-8.8"></path>
  <path d="M9.8 12.2a4 4 0 0 0 4.4 0"></path>
  <path d="M10.4 8.7a2 2 0 0 1 3.2 0"></path>
  <path d="M11 2.2a2 2 0 0 1 2 0v6.5h-2z"></path>
</svg>`;

const tryonSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
  <circle cx="12" cy="13" r="4"></circle>
</svg>`;

//*********************attributes and variables*******************************//

let companyGlamovixLipstick = window.Shopify.shop;
const isEditorGlamovixLipstick = window.Shopify && Shopify.designMode;

const GlamovixLipstickButton = document.getElementById("glamovix-lipstick");
let glamovixLipstickIframe = document.getElementById(
  "glamovix-lipstick-iframe",
);

const buttonSettings = {
  productTitle: GlamovixLipstickButton.dataset.productTitle,
  productId: GlamovixLipstickButton.dataset.productId,
  buttonText: GlamovixLipstickButton.dataset.buttonText,
  buttonColor: GlamovixLipstickButton.dataset.buttonColor,
  buttonTextColor: GlamovixLipstickButton.dataset.buttonTextColor,
  buttonIcon: GlamovixLipstickButton.dataset.buttonIcon,
  borderRadius: GlamovixLipstickButton.dataset.borderRadius,
  fontSize: GlamovixLipstickButton.dataset.fontSize,
  fontWeight: GlamovixLipstickButton.dataset.fontWeight,
};

if (typeof companyGlamovixLipstick === "string") {
  const match = companyGlamovixLipstick.match(
    /^([a-zA-Z0-9-]+)\.myshopify\.com$/,
  );
  if (match && match[1]) {
    companyGlamovixLipstick = match[1];
  }
}
const s3Url = `https://glamovix-bucket.s3.ap-south-1.amazonaws.com/lipstick/${companyGlamovixLipstick}-lipstick.json`;
// ***********************************functions****************************************//
const validateCompanyAndProduct = async (productId) => {
  const cacheBuster = `?t=${Date.now()}`;
  let productDetails = {};

  try {
    const response = await fetch(s3Url + cacheBuster, {
      method: "GET",
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    if (!response.ok) {
      throw new Error(`File missing:`);
    }

    productDetails = await response.json();

    if (productDetails && Array.isArray(productDetails.products)) {
      return productDetails.products.some((product) => {
        const parentId = product.parent_product_id
          ? String(product.parent_product_id).split("/").pop()
          : null;
        const variantId = product.product_id
          ? String(product.product_id).split("/").pop()
          : null;
        return String(productId) === parentId || String(productId) === variantId;
      });
    }

    return false;
  } catch (error) {
    console.error("Error validating product:", error);
    return false;
  }
};
//analytics

const initGTM = () => {
  window.dataLayer = window.dataLayer || [];

  // Initialize GTM DataLayer
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    event: 'gtm.js'
  });

  // Load GTM Script
  let scriptTag = document.createElement('script');
  scriptTag.async = true;
  scriptTag.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-59RRWJ3Q';
  document.head.appendChild(scriptTag);

  // Load noscript GTM
  let noscriptTag = document.createElement('noscript');
  let iframe = document.createElement('iframe');
  iframe.src = 'https://www.googletagmanager.com/ns.html?id=GTM-59RRWJ3Q';
  iframe.height = "0";
  iframe.width = "0";
  iframe.style.display = "none";
  iframe.style.visibility = "hidden";
  noscriptTag.appendChild(iframe);
  document.body.appendChild(noscriptTag);


  //listen to postmessage to push to dataLayer

  //this is how the events are passes
  //ex window.parent.postMessage(
  //   {
  //     type: 'add_to_cart',
  //     productId: product.product_id,
  //     product_name: product.title || 'Unknown Product',
  //     company_name: companyName,
  //   },
  //   '*',
  // );




}

const buttonConfigLipstickVTO = () => {
  GlamovixLipstickButton.style.display = "flex";
  const findMySizeIconContainer =
    GlamovixLipstickButton.querySelector(".glamovix-icon");

  const iconType = GlamovixLipstickButton.dataset.buttonIcon;

  switch (iconType) {
    case "magic":
      findMySizeIconContainer.innerHTML = sparkleSvg;
      break;
    case "lipstick":
      findMySizeIconContainer.innerHTML = lipstickSvg;
      break;
    case "tryon":
      findMySizeIconContainer.innerHTML = tryonSvg;
      break;
    default:
      findMySizeIconContainer.style.display = "none"; // hide when invalid or "none"
  }
};

const closeLipstickTryon = () => {
  glamovixLipstickIframe.setAttribute("src", "");
  glamovixLipstickIframe.style.display = "none";

  let glamovixLipstickIframeEl = document.getElementById(
    "glamovix-lipstick-iframe",
  );
  glamovixLipstickIframeEl.parentNode.removeChild(glamovixLipstickIframeEl);
  document.body.classList.remove("overflow");
  glamovixLipstickIframe = null;
};

//main
(async () => {
  const isProductExist = await validateCompanyAndProduct(
    buttonSettings.productId,
  );
  if (!isProductExist) {
    if (isEditorGlamovixLipstick) {
      buttonConfigLipstickVTO();
    }
    return;
  }

  initGTM();

  // button config
  buttonConfigLipstickVTO();

  //append iframe
  document.body.appendChild(glamovixLipstickIframe);

  // listen to close the iframe and other events
  window.addEventListener("message", (event) => {
    if (event.origin !== "https://app.glamovix.com") {
      return;
    }
    if (event.data === "closeLipstickTryon") {
      closeLipstickTryon();
      return;
    }

    if (event.data && typeof event.data === "object") {

      if (event.data.type === "photo_mode") {
        window.dataLayer.push({
          event: "photo_mode",
          company_name: event.data.company_name,

        });
      }
      if (event.data.type === "model_viewer") {
        window.dataLayer.push({
          event: "model_viewer",
          company_name: event.data.company_name,


        });
      }
      if (event.data.type === "tryon_click") {
        window.dataLayer.push({
          event: "tryon_click",
          company_name: event.data.company_name,
        });
      }
    }

    if (event.data && typeof event.data === "object") {
      if (event.data.type === "add_to_cart" && event.data.productId) {

        window.dataLayer.push({
          event: "add_to_cart",
          company_name: event.data.company_name,
          product_id: event.data.productId,
          product_name: event.data.product_name,
        });
        // Extract numeric ID from Shopify GID if necessary
        const productIdStr = String(event.data.productId);
        const numericId = productIdStr.includes("/")
          ? productIdStr.split("/").pop()
          : productIdStr;

        // Call Shopify Cart Ajax API
        const cartAddUrl =
          window.Shopify && window.Shopify.routes && window.Shopify.routes.root
            ? window.Shopify.routes.root + "cart/add.js"
            : "/cart/add.js";

        fetch(cartAddUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: [
              {
                id: numericId,
                quantity: 1,
              },
            ],
          }),
        })
          .then((response) => response.json())
          .then(() => {
            // Redirect to cart
            const cartUrl =
              window.Shopify &&
                window.Shopify.routes &&
                window.Shopify.routes.root
                ? window.Shopify.routes.root + "cart"
                : "/cart";
            window.location.href = cartUrl;
          })
          .catch((error) => {
            console.error("Error adding to cart:", error);
            alert("Could not add item to cart. Please try again.");
          });
      }
    }
  });
})();

GlamovixLipstickButton.onclick = async () => {
  //if no iframe create one.
  if (!glamovixLipstickIframe) {
    glamovixLipstickIframe = document.createElement("iframe");
    glamovixLipstickIframe.id = "glamovix-lipstick-iframe";
    glamovixLipstickIframe.classList.add("glamovix-lipstick-iframe");

    glamovixLipstickIframe.allow = "camera *; web-share;";
    document.body.appendChild(glamovixLipstickIframe);
  } else {
    glamovixLipstickIframe.allow = "camera *; web-share;";
  }

  //At last show iframe
  glamovixLipstickIframe.src = `https://app.glamovix.com/?companyName=${companyGlamovixLipstick}&product=${buttonSettings.productId}`;
  glamovixLipstickIframe.style.display = "block";

  document.body.classList.add("overflow");
};
