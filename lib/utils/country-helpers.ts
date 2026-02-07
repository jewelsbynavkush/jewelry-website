/**
 * Country Helper Functions
 * 
 * Provides convenient access to country settings with fallbacks to constants.
 */

import { getDefaultCountry, getCountryByCode, getCountryByPhoneCode } from '@/lib/data/country-settings';
import { DEFAULT_COUNTRY } from '@/lib/constants/country';

/**
 * Get default country with fallback
 */
export async function getDefaultCountryWithFallback() {
  const country = await getDefaultCountry();
  return country || DEFAULT_COUNTRY;
}

/**
 * Get country by code with fallback
 */
export async function getCountryByCodeWithFallback(countryCode: string) {
  const country = await getCountryByCode(countryCode);
  return country || DEFAULT_COUNTRY;
}

/**
 * Get country by phone code with fallback
 */
export async function getCountryByPhoneCodeWithFallback(phoneCode: string) {
  const country = await getCountryByPhoneCode(phoneCode);
  return country || DEFAULT_COUNTRY;
}

/**
 * Get default phone country code with fallback
 */
export async function getDefaultPhoneCountryCode(): Promise<string> {
  const country = await getDefaultCountry();
  return country?.phoneCountryCode || DEFAULT_COUNTRY.phoneCountryCode;
}

/**
 * Get default currency with fallback
 */
export async function getDefaultCurrency(): Promise<string> {
  const country = await getDefaultCountry();
  return country?.currency || DEFAULT_COUNTRY.currency;
}

/**
 * Get default currency symbol with fallback
 */
export async function getDefaultCurrencySymbol(): Promise<string> {
  const country = await getDefaultCountry();
  return country?.currencySymbol || DEFAULT_COUNTRY.currencySymbol;
}
