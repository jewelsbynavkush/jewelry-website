/**
 * Price formatting utilities for consistent e-commerce display
 * 
 * Supports multiple currencies: INR, USD, EUR
 * Default currency: INR (Indian Rupees)
 */

/**
 * Default currency configuration
 * Aligned with ECOMMERCE.currency in lib/constants.ts for consistency
 */
export const CURRENCY = {
  code: 'INR',
  symbol: '₹',
  name: 'Indian Rupee',
} as const;

/**
 * Currency configuration mapping
 */
export const CURRENCY_CONFIG = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    locale: 'en-IN',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'en-GB',
  },
} as const;

/**
 * Get currency symbol by currency code
 * @param currencyCode - Currency code (INR, USD, EUR)
 * @returns Currency symbol
 */
/**
 * Get currency symbol by currency code
 * Falls back to default INR symbol if currency not found
 * 
 * @param currencyCode - Currency code (INR, USD, EUR)
 * @returns Currency symbol
 */
export function getCurrencySymbol(currencyCode: string = CURRENCY.code): string {
  const currency = currencyCode.toUpperCase() as keyof typeof CURRENCY_CONFIG;
  return CURRENCY_CONFIG[currency]?.symbol || CURRENCY.symbol;
}

/**
 * Get currency locale by currency code
 * @param currencyCode - Currency code (INR, USD, EUR)
 * @returns Locale string for number formatting
 */
export function getCurrencyLocale(currencyCode: string = CURRENCY.code): string {
  const currency = currencyCode.toUpperCase() as keyof typeof CURRENCY_CONFIG;
  return CURRENCY_CONFIG[currency]?.locale || 'en-IN';
}

/**
 * Format price with currency symbol
 * Respects product currency field for multi-currency support
 * 
 * @param price - Price in number format
 * @param options - Formatting options
 * @param options.showDecimals - Show decimal places (default: true)
 * @param options.currencyCode - Currency code (INR, USD, EUR) - uses product currency if available
 * @param options.currency - Currency symbol override (deprecated, use currencyCode)
 * @returns Formatted price string (e.g., "₹1,299.00" or "$1,299.00")
 */
export function formatPrice(
  price: number,
  options: {
    showDecimals?: boolean;
    currencyCode?: string;
    currency?: string; // Deprecated: use currencyCode instead
  } = {}
): string {
  const { 
    showDecimals = true, 
    currencyCode = CURRENCY.code,
    currency: legacyCurrency 
  } = options;
  
  // Support legacy currency parameter for backward compatibility
  const symbol = legacyCurrency || getCurrencySymbol(currencyCode);
  const locale = getCurrencyLocale(currencyCode);
  
  if (showDecimals) {
    return `${symbol}${price.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  
  return `${symbol}${price.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format price range (for variants or collections)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @param currencyCode - Currency code (INR, USD, EUR)
 * @returns Formatted price range string (e.g., "₹299.00 - ₹1,299.00")
 */
export function formatPriceRange(
  minPrice: number, 
  maxPrice: number,
  currencyCode: string = CURRENCY.code
): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, { currencyCode });
  }
  return `${formatPrice(minPrice, { currencyCode })} - ${formatPrice(maxPrice, { currencyCode })}`;
}

/**
 * Get stock status text and styling
 * @param inStock - Stock status
 * @returns Object with status text, color, and aria-label
 */
export function getStockStatus(inStock: boolean | undefined) {
  const isAvailable = inStock !== false;
  
  return {
    text: isAvailable ? 'In Stock' : 'Out of Stock',
    color: isAvailable ? 'text-[var(--success-text)]' : 'text-[var(--error-text)]',
    bgColor: isAvailable ? 'bg-[var(--success-bg)]' : 'bg-[var(--error-bg)]',
    borderColor: isAvailable ? 'border-[var(--success-border)]' : 'border-[var(--error-border)]',
    ariaLabel: isAvailable ? 'Product is in stock' : 'Product is out of stock',
    available: isAvailable,
  };
}


