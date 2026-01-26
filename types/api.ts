/**
 * API Request and Response Type Definitions
 * 
 * Centralized type definitions for all API endpoints.
 * Ensures type safety and consistency across frontend and backend.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string; // Required for order delivery
  countryCode: string; // Required for order delivery
}

export interface CartItem {
  productId: string;
  sku: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  title: string;
  image?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'razorpay' | 'cod' | 'bank_transfer' | 'other';
  trackingNumber?: string;
  carrier?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface User {
  id: string;
  email: string;
  mobile?: string;
  countryCode?: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin' | 'staff';
  emailVerified: boolean;
}

export interface UserAddress extends Address {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  isDefault: boolean;
}

// ============================================================================
// Authentication API Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  mobile?: string;
  countryCode?: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface LoginRequest {
  identifier: string; // Email only
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
  // Token is now stored in HTTP-only cookie, not returned in response body
  // token: string; // Deprecated - tokens are in cookies
}


export interface ResendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyEmailRequest {
  otp: string;
  email?: string; // Optional: for verification, ignored if authenticated
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    role: 'customer' | 'admin' | 'staff';
  };
}

export interface ResendEmailOTPResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  identifier: string; // Email only
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  password: string;
}

export interface ConfirmResetPasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Cart API Types
// ============================================================================

export interface GetCartResponse {
  cart: Cart;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface AddToCartResponse {
  success: boolean;
  message: string;
  cart: Cart;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface UpdateCartItemResponse {
  success: boolean;
  message: string;
  cart: Cart;
}

export interface ClearCartResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Orders API Types
// ============================================================================

export interface CreateOrderRequest {
  cartId?: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'razorpay' | 'cod' | 'bank_transfer' | 'other';
  customerNotes?: string;
  idempotencyKey?: string;
  saveShippingAddress?: boolean;
  saveBillingAddress?: boolean;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    currency: string;
    items: OrderItem[];
    createdAt: string;
  };
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetOrderResponse {
  order: Order;
}

export interface UpdateOrderStatusRequest {
  status: string;
  notes?: string;
}

export interface UpdateOrderStatusResponse {
  success: boolean;
  message: string;
  order: Order;
}

export interface CancelOrderResponse {
  success: boolean;
  message: string;
  order: Order;
}

// ============================================================================
// User Profile API Types
// Request/Response types for user profile management endpoints
// ============================================================================

export interface GetProfileResponse {
  user: User;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  displayName?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface GetAddressesResponse {
  addresses: UserAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface AddAddressRequest {
  type: 'shipping' | 'billing' | 'both';
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface AddAddressResponse {
  success: boolean;
  message: string;
  addressId: string;
  addresses: UserAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export type UpdateAddressRequest = AddAddressRequest;

export interface UpdateAddressResponse {
  success: boolean;
  message: string;
  address: UserAddress;
  addresses: UserAddress[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
}

export interface DeleteAddressResponse {
  success: boolean;
  message: string;
  addresses: UserAddress[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Products API Types
// ============================================================================

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  shortDescription?: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  material: string;
  images: string[];
  primaryImage: string;
  inStock: boolean;
  featured: boolean;
  mostLoved: boolean;
}

export interface GetProductsResponse {
  products: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetProductResponse {
  product: Product;
}

// ============================================================================
// Categories API Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  active: boolean;
}

export interface GetCategoriesResponse {
  categories: Category[];
}

// ============================================================================
// Inventory API Types
// ============================================================================

export interface InventoryStatus {
  productId: string;
  sku: string;
  title: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  trackQuantity: boolean;
  allowBackorder: boolean;
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export interface GetInventoryStatusResponse {
  inventory: InventoryStatus;
}

export interface RestockProductRequest {
  quantity: number;
  reason?: string;
  notes?: string;
}

export interface RestockProductResponse {
  success: boolean;
  message: string;
  inventory: InventoryStatus;
}

export interface InventoryLog {
  id: string;
  productId: string | null;
  productSku: string;
  productTitle: string;
  type: 'sale' | 'restock' | 'adjustment' | 'return' | 'reserved' | 'released';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  notes?: string;
  orderId?: string | null;
  userId?: string | null;
  performedBy?: string;
  createdAt: string;
}

export interface GetInventoryLogsResponse {
  logs: InventoryLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LowStockProduct {
  id: string;
  sku: string;
  title: string;
  totalQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  status: string;
}

export interface GetLowStockResponse {
  products: LowStockProduct[];
  count: number;
}

// ============================================================================
// Site Settings API Types
// ============================================================================

export interface SiteSettings {
  siteName: string;
  siteDescription?: string;
  contactEmail?: string;
  contactPhone?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

export interface GetSiteSettingsResponse {
  settings: SiteSettings;
}

// ============================================================================
// Content API Types
// ============================================================================

export interface GetContentResponse {
  content: {
    title: string;
    description?: string;
    content: string[];
  };
}

// ============================================================================
// Health Check API Types
// ============================================================================

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'connected' | 'disconnected' | 'error';
      responseTime?: number;
      error?: string;
    };
  };
  version: string;
  responseTime: number;
}

// ============================================================================
// Auth Logout API Types
// ============================================================================

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Auth Refresh API Types
// ============================================================================

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// User Password API Types
// ============================================================================

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Contact API Types
// ============================================================================

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ErrorResponse {
  error: string;
  details?: Array<{
    path: string;
    message: string;
  }>;
}

export interface SuccessResponse {
  success: boolean;
  message?: string;
}
