/**
 * Reusable Form Validation Utilities
 * 
 * Common validation functions extracted from form components to reduce duplication.
 * These validators can be used across multiple forms for consistent validation.
 */

/**
 * Validate email format and length
 * 
 * @param email - Email string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required';
  }
  if (email.length > 254) {
    return 'Email must not exceed 254 characters';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email format';
  }
  return null;
}

/**
 * Validate name (first name, last name, etc.)
 * 
 * @param name - Name string to validate
 * @param fieldName - Name of the field (for error messages, e.g., "First name")
 * @returns Error message if invalid, null if valid
 */
export function validateName(name: string, fieldName: string = 'Name'): string | null {
  if (!name.trim()) {
    return `${fieldName} is required`;
  }
  if (name.length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and dots`;
  }
  return null;
}

/**
 * Validate password
 * 
 * @param password - Password string to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  if (password.length > 100) {
    return 'Password must not exceed 100 characters';
  }
  if (/\s/.test(password)) {
    return 'Password cannot contain spaces';
  }
  return null;
}

/**
 * Validate mobile number (10 digits)
 * 
 * @param mobile - Mobile number string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateMobile(mobile: string): string | null {
  if (!mobile || !mobile.trim()) {
    return null; // Mobile is optional
  }
  if (!/^[0-9]{10}$/.test(mobile.trim())) {
    return 'Mobile number must be exactly 10 digits';
  }
  return null;
}

/**
 * Validate address line
 * 
 * @param addressLine - Address line string to validate
 * @param fieldName - Name of the field (for error messages)
 * @param required - Whether the field is required (default: true)
 * @returns Error message if invalid, null if valid
 */
export function validateAddressLine(
  addressLine: string,
  fieldName: string = 'Address line',
  required: boolean = true
): string | null {
  if (!addressLine.trim()) {
    if (required) {
      return `${fieldName} is required`;
    }
    return null; // Optional field
  }
  if (addressLine.trim().length < 5) {
    return `${fieldName} must be at least 5 characters`;
  }
  if (addressLine.length > 200) {
    return `${fieldName} must not exceed 200 characters`;
  }
  if (!/^[a-zA-Z0-9\s\-'.,\/#()]+$/.test(addressLine)) {
    return `${fieldName} can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)`;
  }
  return null;
}

/**
 * Validate city name
 * 
 * @param city - City name string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateCity(city: string): string | null {
  if (!city.trim()) {
    return 'City is required';
  }
  if (city.trim().length < 2) {
    return 'City name must be at least 2 characters';
  }
  if (city.length > 100) {
    return 'City name must not exceed 100 characters';
  }
  if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(city)) {
    return 'City name can only contain letters, numbers, spaces, hyphens, apostrophes, and dots';
  }
  return null;
}

/**
 * Validate state name
 * 
 * @param state - State name string to validate
 * @returns Error message if invalid, null if valid
 */
export function validateState(state: string): string | null {
  if (!state.trim()) {
    return 'State is required';
  }
  if (state.length > 100) {
    return 'State name must not exceed 100 characters';
  }
  return null;
}

/**
 * Validate pincode (6 digits for India)
 * 
 * @param pincode - Pincode string to validate
 * @returns Error message if invalid, null if valid
 */
export function validatePincode(pincode: string): string | null {
  if (!pincode.trim()) {
    return 'Pincode is required';
  }
  if (!/^[0-9]{6}$/.test(pincode.trim())) {
    return 'Pincode must be exactly 6 digits';
  }
  return null;
}

/**
 * Validate phone number (10 digits)
 * 
 * @param phone - Phone number string to validate
 * @param required - Whether the field is required (default: true)
 * @returns Error message if invalid, null if valid
 */
export function validatePhone(phone: string, required: boolean = true): string | null {
  if (!phone || !phone.trim()) {
    if (required) {
      return 'Phone number is required';
    }
    return null; // Optional field
  }
  if (!/^[0-9]{10}$/.test(phone.trim())) {
    return 'Phone number must be exactly 10 digits';
  }
  return null;
}
