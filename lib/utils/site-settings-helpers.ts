/**
 * Site Settings Helper Functions
 * 
 * Provides convenient access to site settings with fallbacks to constants.
 * Reuses values and variables as much as possible.
 */

import { getSiteSettings } from '@/lib/data/site-settings';
import { DEFAULTS, ECOMMERCE } from '@/lib/constants';
import type { SiteSettings } from '@/types/data';

/**
 * Get brand name with fallback
 */
export async function getBrandName(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.brand?.name || DEFAULTS.brandName;
}

/**
 * Get hero title with fallback
 */
export async function getHeroTitle(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.hero?.title || DEFAULTS.heroTitle;
}

/**
 * Get hero button text with fallback
 */
export async function getHeroButtonText(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.hero?.buttonText || DEFAULTS.heroButtonText;
}

/**
 * Get about button text with fallback
 */
export async function getAboutButtonText(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.about?.buttonText || DEFAULTS.aboutButtonText;
}

/**
 * Get right column slogan with fallback
 */
export async function getRightColumnSlogan(): Promise<string> {
  const settings = await getSiteSettings();
  return settings.intro?.rightColumnSlogan || DEFAULTS.rightColumnSlogan;
}

/**
 * Get e-commerce settings with fallback
 * Reuses ECOMMERCE constant as fallback
 */
export async function getEcommerceSettings(): Promise<NonNullable<SiteSettings['ecommerce']>> {
  const settings = await getSiteSettings();
  
  if (settings.ecommerce) {
    return {
      currency: settings.ecommerce.currency ?? ECOMMERCE.currency,
      currencySymbol: settings.ecommerce.currencySymbol ?? ECOMMERCE.currencySymbol,
      defaultShippingDays: settings.ecommerce.defaultShippingDays ?? ECOMMERCE.defaultShippingDays,
      freeShippingThreshold: settings.ecommerce.freeShippingThreshold ?? ECOMMERCE.freeShippingThreshold,
      defaultShippingCost: settings.ecommerce.defaultShippingCost ?? ECOMMERCE.defaultShippingCost,
      returnWindowDays: settings.ecommerce.returnWindowDays ?? ECOMMERCE.returnWindowDays,
      taxRate: settings.ecommerce.taxRate ?? ECOMMERCE.taxRate,
      calculateTax: settings.ecommerce.calculateTax ?? ECOMMERCE.calculateTax,
      priceVarianceThreshold: settings.ecommerce.priceVarianceThreshold ?? ECOMMERCE.priceVarianceThreshold,
      guestCartExpirationDays: settings.ecommerce.guestCartExpirationDays ?? ECOMMERCE.guestCartExpirationDays,
      userCartExpirationDays: settings.ecommerce.userCartExpirationDays ?? ECOMMERCE.userCartExpirationDays,
      maxQuantityPerItem: settings.ecommerce.maxQuantityPerItem ?? ECOMMERCE.maxQuantityPerItem,
      maxCartItems: settings.ecommerce.maxCartItems ?? ECOMMERCE.maxCartItems,
    };
  }
  
  return {
    currency: ECOMMERCE.currency,
    currencySymbol: ECOMMERCE.currencySymbol,
    defaultShippingDays: ECOMMERCE.defaultShippingDays,
    freeShippingThreshold: ECOMMERCE.freeShippingThreshold,
    defaultShippingCost: ECOMMERCE.defaultShippingCost,
    returnWindowDays: ECOMMERCE.returnWindowDays,
    taxRate: ECOMMERCE.taxRate,
    calculateTax: ECOMMERCE.calculateTax,
    priceVarianceThreshold: ECOMMERCE.priceVarianceThreshold,
    guestCartExpirationDays: ECOMMERCE.guestCartExpirationDays,
    userCartExpirationDays: ECOMMERCE.userCartExpirationDays,
    maxQuantityPerItem: ECOMMERCE.maxQuantityPerItem,
    maxCartItems: ECOMMERCE.maxCartItems,
  };
}

/**
 * Get currency with fallback
 */
export async function getCurrency(): Promise<string> {
  const ecommerce = await getEcommerceSettings();
  return ecommerce.currency ?? 'INR';
}

/**
 * Get currency symbol with fallback
 */
export async function getCurrencySymbol(): Promise<string> {
  const ecommerce = await getEcommerceSettings();
  return ecommerce.currencySymbol ?? '₹';
}

/**
 * Get tax rate with fallback
 */
export async function getTaxRate(): Promise<number> {
  const ecommerce = await getEcommerceSettings();
  return ecommerce.taxRate ?? ECOMMERCE.taxRate;
}

/**
 * Get free shipping threshold with fallback
 */
export async function getFreeShippingThreshold(): Promise<number> {
  const ecommerce = await getEcommerceSettings();
  return ecommerce.freeShippingThreshold ?? ECOMMERCE.freeShippingThreshold;
}
