'use client';

/**
 * Checkout Page
 * 
 * Handles order creation with:
 * - Address selection/entry
 * - Order summary
 * - Payment method selection
 * - Order placement
 */

import { useEffect, useState, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiPost } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils/price-formatting';

interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated, user, fetchProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }

    fetchCart();
    
    // Only fetch profile if user data is missing (prevents multiple calls)
    if (!user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchProfile();
    }

    // Pre-fill user data
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
      setBillingAddress((prev) => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, fetchCart, user]); // fetchProfile intentionally excluded to prevent loops

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress(shippingAddress);
    }
  }, [useSameAddress, shippingAddress]);

  const handleAddressChange = (
    type: 'shipping' | 'billing',
    field: keyof Address,
    value: string
  ) => {
    if (type === 'shipping') {
      setShippingAddress((prev) => ({ ...prev, [field]: value }));
    } else {
      setBillingAddress((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateAddress = (address: Address): string | null => {
    if (!address.firstName.trim()) return 'First name is required';
    if (!address.lastName.trim()) return 'Last name is required';
    if (!address.addressLine1.trim()) return 'Address line 1 is required';
    if (!address.city.trim()) return 'City is required';
    if (!address.state.trim()) return 'State is required';
    if (!address.zipCode.trim()) return 'ZIP code is required';
    if (!address.country.trim()) return 'Country is required';
    return null;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!cart || cart.items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    const shippingError = validateAddress(shippingAddress);
    if (shippingError) {
      setError(shippingError);
      return;
    }

    if (!useSameAddress) {
      const billingError = validateAddress(billingAddress);
      if (billingError) {
        setError(billingError);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await apiPost<{ order: { id: string; orderNumber: string; status: string; total: number; currency: string } }>('/api/orders', {
        shippingAddress,
        billingAddress: useSameAddress ? shippingAddress : billingAddress,
        paymentMethod,
      });

      if (response.success && response.data) {
        // Clear cart
        await fetchCart();
        // Redirect to order confirmation
        router.push(`/orders/${response.data.order.id}`);
      } else {
        setError(response.error || 'Failed to create order');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (cartLoading || !cart) {
    return (
      <PageContainer maxWidth="4xl">
        <SectionHeading as="h2">CHECKOUT</SectionHeading>
        <Card className="text-center py-12">
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </Card>
      </PageContainer>
    );
  }

  if (cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <PageContainer maxWidth="5xl">
      <ScrollReveal>
        <h1 className="sr-only">Checkout - Complete your order</h1>
        <SectionHeading as="h2">CHECKOUT</SectionHeading>
      </ScrollReveal>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <ScrollReveal delay={0.1}>
            <Card>
              <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-4">
                Shipping Address
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="First Name"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    label="Last Name"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Input
                  type="text"
                  label="Address Line 1"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => handleAddressChange('shipping', 'addressLine1', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
                <Input
                  type="text"
                  label="Address Line 2 (Optional)"
                  value={shippingAddress.addressLine2 || ''}
                  onChange={(e) => handleAddressChange('shipping', 'addressLine2', e.target.value)}
                  disabled={isSubmitting}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="City"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange('shipping', 'city', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    label="State"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange('shipping', 'state', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="ZIP Code"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleAddressChange('shipping', 'zipCode', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    label="Country"
                    value={shippingAddress.country}
                    onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <Input
                  type="tel"
                  label="Phone (Optional)"
                  value={shippingAddress.phone || ''}
                  onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </Card>
          </ScrollReveal>

          {/* Billing Address */}
          <ScrollReveal delay={0.2}>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="same-address"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="same-address" className="text-[var(--text-on-cream)] font-medium">
                  Billing address same as shipping
                </label>
              </div>

              {!useSameAddress && (
                <div className="space-y-4">
                  <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-4">
                    Billing Address
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="First Name"
                      value={billingAddress.firstName}
                      onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      label="Last Name"
                      value={billingAddress.lastName}
                      onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <Input
                    type="text"
                    label="Address Line 1"
                    value={billingAddress.addressLine1}
                    onChange={(e) => handleAddressChange('billing', 'addressLine1', e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                  <Input
                    type="text"
                    label="Address Line 2 (Optional)"
                    value={billingAddress.addressLine2 || ''}
                    onChange={(e) => handleAddressChange('billing', 'addressLine2', e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="City"
                      value={billingAddress.city}
                      onChange={(e) => handleAddressChange('billing', 'city', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      label="State"
                      value={billingAddress.state}
                      onChange={(e) => handleAddressChange('billing', 'state', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="ZIP Code"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleAddressChange('billing', 'zipCode', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                    <Input
                      type="text"
                      label="Country"
                      value={billingAddress.country}
                      onChange={(e) => handleAddressChange('billing', 'country', e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}
            </Card>
          </ScrollReveal>

          {/* Payment Method */}
          <ScrollReveal delay={0.3}>
            <Card>
              <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-4">
                Payment Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-[var(--border-light)] rounded-lg cursor-pointer hover:bg-[var(--beige)] transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    disabled={isSubmitting}
                  />
                  <div>
                    <div className="text-[var(--text-on-cream)] font-medium">Cash on Delivery</div>
                    <div className="text-[var(--text-secondary)] text-sm">Pay when you receive</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-[var(--border-light)] rounded-lg cursor-pointer hover:bg-[var(--beige)] transition-colors opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                    disabled={true}
                  />
                  <div>
                    <div className="text-[var(--text-on-cream)] font-medium">Online Payment</div>
                    <div className="text-[var(--text-secondary)] text-sm">Coming soon</div>
                  </div>
                </label>
              </div>
            </Card>
          </ScrollReveal>

          {error && (
            <div className="text-[var(--error-text)] text-sm" role="alert">
              {error}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <ScrollReveal delay={0.4}>
            <Card className="sticky top-4">
              <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">
                      {item.title} × {item.quantity}
                    </span>
                    <span className="text-[var(--text-on-cream)]">
                      {formatPrice(item.subtotal, { currencyCode: cart.currency })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[var(--border-light)] pt-3 space-y-2">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.subtotal, { currencyCode: cart.currency })}</span>
                </div>
                {cart.tax > 0 && (
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Tax</span>
                    <span>{formatPrice(cart.tax, { currencyCode: cart.currency })}</span>
                  </div>
                )}
                {cart.shipping > 0 && (
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span>{formatPrice(cart.shipping, { currencyCode: cart.currency })}</span>
                  </div>
                )}
                <div className="border-t border-[var(--border-light)] pt-2 mt-2">
                  <div className="flex justify-between text-[var(--text-on-cream)] font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(cart.total, { currencyCode: cart.currency })}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full min-h-[44px] mt-6"
                disabled={isSubmitting || cart.items.length === 0}
                aria-label="Place order"
              >
                {isSubmitting ? 'PLACING ORDER...' : 'PLACE ORDER'}
              </Button>
            </Card>
          </ScrollReveal>
        </div>
      </form>
    </PageContainer>
  );
}
