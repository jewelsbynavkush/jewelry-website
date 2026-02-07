/**
 * Country Settings data access layer
 * Reads from MongoDB - Only returns active countries
 */

import connectDB from '@/lib/mongodb';
import CountrySettings from '@/models/CountrySettings';
import { logError } from '@/lib/security/error-handler';

export interface CountrySettingsType {
  countryCode: string;
  countryName: string;
  phoneCountryCode: string;
  phonePattern: string;
  phoneLength: number;
  pincodePattern: string;
  pincodeLength: number;
  pincodeLabel: string;
  states?: string[];
  currency: string;
  currencySymbol: string;
  isActive: boolean;
  isDefault: boolean;
  order: number;
}

/**
 * Get all active countries
 * Only returns countries where isActive: true
 * 
 * @returns Array of active countries, sorted by order
 */
export async function getActiveCountries(): Promise<CountrySettingsType[]> {
  try {
    await connectDB();
    
    const countries = await CountrySettings.find({ isActive: true })
      .sort({ order: 1, countryName: 1 })
      .lean();
    
    return countries.map(country => ({
      countryCode: country.countryCode,
      countryName: country.countryName,
      phoneCountryCode: country.phoneCountryCode,
      phonePattern: country.phonePattern,
      phoneLength: country.phoneLength,
      pincodePattern: country.pincodePattern,
      pincodeLength: country.pincodeLength,
      pincodeLabel: country.pincodeLabel,
      states: country.states || [],
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      isActive: country.isActive,
      isDefault: country.isDefault,
      order: country.order,
    }));
  } catch (error) {
    logError('getActiveCountries', error);
    return [];
  }
}

/**
 * Get default country
 * Returns the country marked as isDefault: true, or first active country
 * 
 * @returns Default country or null
 */
export async function getDefaultCountry(): Promise<CountrySettingsType | null> {
  try {
    await connectDB();
    
    // First try to find default country
    let country = await CountrySettings.findOne({ 
      isDefault: true,
      isActive: true 
    }).lean();
    
    // If no default, get first active country
    if (!country) {
      country = await CountrySettings.findOne({ isActive: true })
        .sort({ order: 1, countryName: 1 })
        .lean();
    }
    
    if (!country) {
      return null;
    }
    
    return {
      countryCode: country.countryCode,
      countryName: country.countryName,
      phoneCountryCode: country.phoneCountryCode,
      phonePattern: country.phonePattern,
      phoneLength: country.phoneLength,
      pincodePattern: country.pincodePattern,
      pincodeLength: country.pincodeLength,
      pincodeLabel: country.pincodeLabel,
      states: country.states || [],
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      isActive: country.isActive,
      isDefault: country.isDefault,
      order: country.order,
    };
  } catch (error) {
    logError('getDefaultCountry', error);
    return null;
  }
}

/**
 * Get country by country code
 * 
 * @param countryCode - ISO country code (e.g., 'IN', 'US')
 * @returns Country if found and active, null otherwise
 */
export async function getCountryByCode(countryCode: string): Promise<CountrySettingsType | null> {
  try {
    await connectDB();
    
    const country = await CountrySettings.findOne({ 
      countryCode: countryCode.toUpperCase(),
      isActive: true 
    }).lean();
    
    if (!country) {
      return null;
    }
    
    return {
      countryCode: country.countryCode,
      countryName: country.countryName,
      phoneCountryCode: country.phoneCountryCode,
      phonePattern: country.phonePattern,
      phoneLength: country.phoneLength,
      pincodePattern: country.pincodePattern,
      pincodeLength: country.pincodeLength,
      pincodeLabel: country.pincodeLabel,
      states: country.states || [],
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      isActive: country.isActive,
      isDefault: country.isDefault,
      order: country.order,
    };
  } catch (error) {
    logError('getCountryByCode', error);
    return null;
  }
}

/**
 * Get country by phone country code
 * 
 * @param phoneCountryCode - Phone country code (e.g., '+91', '+1')
 * @returns Country if found and active, null otherwise
 */
export async function getCountryByPhoneCode(phoneCountryCode: string): Promise<CountrySettingsType | null> {
  try {
    await connectDB();
    
    const country = await CountrySettings.findOne({ 
      phoneCountryCode: phoneCountryCode.trim(),
      isActive: true 
    }).lean();
    
    if (!country) {
      return null;
    }
    
    return {
      countryCode: country.countryCode,
      countryName: country.countryName,
      phoneCountryCode: country.phoneCountryCode,
      phonePattern: country.phonePattern,
      phoneLength: country.phoneLength,
      pincodePattern: country.pincodePattern,
      pincodeLength: country.pincodeLength,
      pincodeLabel: country.pincodeLabel,
      states: country.states || [],
      currency: country.currency,
      currencySymbol: country.currencySymbol,
      isActive: country.isActive,
      isDefault: country.isDefault,
      order: country.order,
    };
  } catch (error) {
    logError('getCountryByPhoneCode', error);
    return null;
  }
}
