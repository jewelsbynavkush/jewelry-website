/**
 * Price formatting utilities for consistent e-commerce display
 */

export const CURRENCY = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
} as const;

/**
 * Format price with currency symbol
 * @param price - Price in number format
 * @param options - Formatting options
 * @returns Formatted price string (e.g., "$1,299.00")
 */
export function formatPrice(
  price: number,
  options: {
    showDecimals?: boolean;
    currency?: string;
  } = {}
): string {
  const { showDecimals = true, currency = CURRENCY.symbol } = options;
  
  if (showDecimals) {
    return `${currency}${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  
  return `${currency}${price.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/**
 * Format price range (for variants or collections)
 * @param minPrice - Minimum price
 * @param maxPrice - Maximum price
 * @returns Formatted price range string (e.g., "$299.00 - $1,299.00")
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice);
  }
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
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
    color: isAvailable ? 'text-green-600' : 'text-red-600',
    bgColor: isAvailable ? 'bg-green-50' : 'bg-red-50',
    borderColor: isAvailable ? 'border-green-200' : 'border-red-200',
    ariaLabel: isAvailable ? 'Product is in stock' : 'Product is out of stock',
    available: isAvailable,
  };
}

