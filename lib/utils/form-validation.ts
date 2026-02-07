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
