/**
 * Formats a numeric price into a currency string based on the store's settings.
 * @param {number|string} amount - The price amount.
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD', 'INR').
 * @param {string} locale - Optional locale (defaults to 'en-US').
 * @returns {string} - The formatted currency string.
 */
export function formatPrice(amount, currencyCode, locale = "en-US") {
  if (amount === "" || amount === null || amount === undefined) return "";
  
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return amount;

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).format(numericAmount);
  } catch (error) {
    console.error("Error formatting price:", error);
    return `${currencyCode} ${numericAmount}`;
  }
}
