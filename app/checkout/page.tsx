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
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import Autocomplete from '@/components/ui/Autocomplete';
import { getAllStates, getCitiesByState } from '@/lib/data/indian-addresses';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { apiPost, apiGet } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils/price-formatting';
import logger from '@/lib/utils/logger';
import { ECOMMERCE } from '@/lib/constants';
import type { UserAddress } from '@/types/api';

interface Address {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string; // Required for order delivery
  countryCode: string; // Required for order delivery
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated, user, fetchProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | 'new'>('new');
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | 'new'>('new');
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

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
    countryCode: '+91',
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
    countryCode: '+91',
  });

  const [useSameAddress, setUseSameAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated) return;
      
      setIsLoadingAddresses(true);
      try {
        const response = await apiGet<{ addresses: UserAddress[]; defaultShippingAddressId?: string; defaultBillingAddressId?: string }>('/api/users/addresses');
        if (response.success && response.data) {
          setSavedAddresses(response.data.addresses || []);
          // Set default addresses if available
          if (response.data.defaultShippingAddressId) {
            setSelectedShippingAddressId(response.data.defaultShippingAddressId);
          }
          if (response.data.defaultBillingAddressId) {
            setSelectedBillingAddressId(response.data.defaultBillingAddressId);
          }
        }
      } catch (error) {
        logger.error('Failed to fetch addresses', error);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

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

  // Handle address selection changes
  useEffect(() => {
    if (selectedShippingAddressId !== 'new') {
      const address = savedAddresses.find(addr => addr.id === selectedShippingAddressId);
      if (address) {
        setShippingAddress({
          firstName: address.firstName,
          lastName: address.lastName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: address.phone,
          countryCode: address.countryCode,
        });
      }
    } else {
      // Clear form when "Enter new address" is selected
      setShippingAddress({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: '',
        countryCode: '+91',
      });
    }
  }, [selectedShippingAddressId, savedAddresses, user]);

  useEffect(() => {
    if (selectedBillingAddressId !== 'new') {
      const address = savedAddresses.find(addr => addr.id === selectedBillingAddressId);
      if (address) {
        setBillingAddress({
          firstName: address.firstName,
          lastName: address.lastName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
          phone: address.phone,
          countryCode: address.countryCode,
        });
      }
    } else {
      // Clear form when "Enter new address" is selected
      setBillingAddress({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India',
        phone: '',
        countryCode: '+91',
      });
    }
  }, [selectedBillingAddressId, savedAddresses, user]);

  useEffect(() => {
    if (useSameAddress) {
      setBillingAddress(shippingAddress);
      setSelectedBillingAddressId(selectedShippingAddressId);
    } else {
      // Reset billing address selection when unchecking "same as shipping"
      // This allows user to independently select a billing address
      setSelectedBillingAddressId('new');
    }
  }, [useSameAddress, shippingAddress, selectedShippingAddressId]);

  // Redirect to cart if cart is empty (moved from render to useEffect to avoid setState during render)
  useEffect(() => {
    if (cart && cart.items.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  const handleAddressChange = (
    type: 'shipping' | 'billing',
    field: keyof Address,
    value: string
  ) => {
    // Apply field-specific validation and limits
    let processedValue = value;
    
    if (field === 'firstName' || field === 'lastName') {
      // Only allow letters, spaces, hyphens, apostrophes, and dots
      processedValue = value.replace(/[^a-zA-Z\s\-'\.]/g, '');
      if (processedValue.length > 50) processedValue = processedValue.slice(0, 50);
    } else if (field === 'addressLine1' || field === 'addressLine2') {
      // Allow only valid address characters: letters, numbers, spaces, hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses
      processedValue = value.replace(/[^a-zA-Z0-9\s\-'.,\/#()]/g, '');
      if (processedValue.length > 200) processedValue = processedValue.slice(0, 200);
    } else if (field === 'city') {
      // Only allow letters, numbers, spaces, hyphens, apostrophes, and dots
      processedValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
      if (processedValue.length > 100) processedValue = processedValue.slice(0, 100);
    } else if (field === 'state') {
      if (processedValue.length > 100) processedValue = processedValue.slice(0, 100);
    } else if (field === 'zipCode') {
      // Only allow digits, max 6
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    } else if (field === 'country') {
      if (processedValue.length > 100) processedValue = processedValue.slice(0, 100);
    } else if (field === 'phone') {
      // Only allow digits, max 10
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (field === 'countryCode') {
      // Only allow +91
      processedValue = '+91';
    }
    
    if (type === 'shipping') {
      setShippingAddress((prev) => ({ ...prev, [field]: processedValue }));
    } else {
      setBillingAddress((prev) => ({ ...prev, [field]: processedValue }));
    }
  };

  const validateAddress = (address: Address): string | null => {
    if (!address.firstName.trim()) return 'First name is required';
    if (address.firstName.length > 50) return 'First name must not exceed 50 characters';
    if (!/^[a-zA-Z\s\-'\.]+$/.test(address.firstName)) return 'First name can only contain letters, spaces, hyphens, apostrophes, and dots';

    if (!address.lastName.trim()) return 'Last name is required';
    if (address.lastName.length > 50) return 'Last name must not exceed 50 characters';
    if (!/^[a-zA-Z\s\-'\.]+$/.test(address.lastName)) return 'Last name can only contain letters, spaces, hyphens, apostrophes, and dots';

    if (!address.addressLine1.trim()) return 'Address line 1 is required';
    if (address.addressLine1.trim().length < 5) return 'Address line 1 must be at least 5 characters';
    if (address.addressLine1.length > 200) return 'Address line 1 must not exceed 200 characters';
    if (!/^[a-zA-Z0-9\s\-'.,\/#()]+$/.test(address.addressLine1)) {
      return 'Address line 1 can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)';
    }

    if (address.addressLine2 && address.addressLine2.trim()) {
      if (address.addressLine2.length > 200) return 'Address line 2 must not exceed 200 characters';
      if (!/^[a-zA-Z0-9\s\-'.,\/#()]*$/.test(address.addressLine2)) {
        return 'Address line 2 can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)';
      }
    }

    if (!address.city.trim()) return 'City is required';
    if (address.city.length < 2) return 'City name must be at least 2 characters';
    if (address.city.length > 100) return 'City name must not exceed 100 characters';
    if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(address.city)) return 'City name can only contain letters, numbers, spaces, hyphens, apostrophes, and dots';

    if (!address.state.trim()) return 'State is required';
    if (address.state.length > 100) return 'State name must not exceed 100 characters';

    if (!address.zipCode.trim()) return 'Pincode is required';
    if (!/^[0-9]{6}$/.test(address.zipCode.trim())) return 'Pincode must be exactly 6 digits';

    if (!address.country.trim()) return 'Country is required';
    if (address.country.trim().toLowerCase() !== 'india') return 'Only India is supported at this time';

    if (!address.phone || !address.phone.trim()) return 'Phone number is required';
    if (!/^[0-9]{10}$/.test(address.phone.trim())) return 'Phone number must be exactly 10 digits';

    if (!address.countryCode || address.countryCode.trim() !== '+91') return 'Only +91 (India) country code is supported';
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
      const finalBillingAddress = useSameAddress ? shippingAddress : billingAddress;
      
      const response = await apiPost<{ order: { id: string; orderNumber: string; status: string; total: number; currency: string } }>('/api/orders', {
        shippingAddress,
        billingAddress: finalBillingAddress,
        paymentMethod,
        saveShippingAddress: selectedShippingAddressId === 'new',
        saveBillingAddress: !useSameAddress && selectedBillingAddressId === 'new',
      });

      if (response.success && response.data) {
        // Show success message
        const { showToast } = await import('@/components/ui/Toast');
        showToast('Order placed successfully!', 'success', 3000);
        // Clear cart
        await fetchCart();
        // Redirect to order confirmation
        router.push(`/orders/${response.data.order.id}`);
      } else {
        const errorMessage = response.error || 'Failed to create order';
        setError(errorMessage);
        // Show error toast for better UX
        const { showToast } = await import('@/components/ui/Toast');
        showToast(errorMessage, 'error', 5000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      setError(errorMessage);
      // Show error toast for better UX
      const { showToast } = await import('@/components/ui/Toast');
      showToast(errorMessage, 'error', 5000);
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
          <div className="space-y-4">
            <div className="inline-block w-8 h-8 border-4 border-[var(--beige)] border-t-transparent rounded-full animate-spin" aria-label="Loading checkout" role="status" />
            <p className="text-[var(--text-secondary)]">Loading checkout...</p>
          </div>
        </Card>
      </PageContainer>
    );
  }

  // Don't render if cart is empty (redirect handled in useEffect above)
  if (cart && cart.items.length === 0) {
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
              
              {/* Address Selection - Only show if there are saved addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-4">
                  <label className="block text-[var(--text-on-cream)] font-medium mb-2">
                    Select saved address or enter new
                  </label>
                  {isLoadingAddresses ? (
                    <div className="text-[var(--text-secondary)] text-sm py-2">Loading addresses...</div>
                  ) : (
                    <select
                      value={selectedShippingAddressId}
                      onChange={(e) => setSelectedShippingAddressId(e.target.value as string | 'new')}
                      disabled={isSubmitting || isLoadingAddresses}
                      className="w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] text-[var(--text-on-cream)] min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-right bg-[length:20px] pr-10 [&>option]:bg-[var(--cream)] [&>option]:text-[var(--text-on-cream)] [&>option]:hover:bg-[var(--cream)]"
                    >
                      <option value="new">Enter new address</option>
                      {savedAddresses
                        .filter(addr => addr.type === 'shipping' || addr.type === 'both')
                        .map((address) => (
                          <option key={address.id} value={address.id}>
                            {address.firstName} {address.lastName}, {address.addressLine1}, {address.city}, {address.state} {address.zipCode}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="First Name"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleAddressChange('shipping', 'firstName', e.target.value)}
                    required
                    disabled={isSubmitting || selectedShippingAddressId !== 'new'}
                    maxLength={50}
                  />
                  <Input
                    type="text"
                    label="Last Name"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleAddressChange('shipping', 'lastName', e.target.value)}
                    required
                    disabled={isSubmitting || selectedShippingAddressId !== 'new'}
                    maxLength={50}
                  />
                </div>
                <Input
                  type="text"
                  label="Address Line 1"
                  placeholder="House/Flat number, Building name, Street"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => handleAddressChange('shipping', 'addressLine1', e.target.value)}
                  required
                  disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                  maxLength={200}
                />
                <Input
                  type="text"
                  label="Address Line 2 (Optional)"
                  placeholder="Apartment, Suite, Unit, Floor, etc."
                  value={shippingAddress.addressLine2 || ''}
                  onChange={(e) => handleAddressChange('shipping', 'addressLine2', e.target.value)}
                  disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                  maxLength={200}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Autocomplete
                    label="State"
                    value={shippingAddress.state}
                    onChange={(value) => {
                      handleAddressChange('shipping', 'state', value);
                      handleAddressChange('shipping', 'city', ''); // Clear city when state changes
                    }}
                    suggestions={getAllStates()}
                    filterSuggestions={(query, suggestions) => 
                      suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10)
                    }
                    placeholder="Select or type state"
                    required
                    disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                    maxLength={100}
                  />
                  <Autocomplete
                    label="City"
                    value={shippingAddress.city}
                    onChange={(value) => {
                      const filteredValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
                      handleAddressChange('shipping', 'city', filteredValue);
                    }}
                    suggestions={shippingAddress.state ? getCitiesByState(shippingAddress.state) : []}
                    filterSuggestions={(query, suggestions) => 
                      suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10)
                    }
                    placeholder="Select or type city"
                    required
                    disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined) || !shippingAddress.state}
                    maxLength={100}
                    onInputChange={(value) => {
                      const filteredValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
                      handleAddressChange('shipping', 'city', filteredValue);
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    label="ZIP Code (Pincode)"
                    placeholder="Enter 6-digit pincode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleAddressChange('shipping', 'zipCode', e.target.value)}
                    required
                    disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                    maxLength={6}
                  />
                  <Input
                    type="text"
                    label="Country"
                    value={shippingAddress.country}
                    onChange={(e) => handleAddressChange('shipping', 'country', e.target.value)}
                    required
                    disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                    maxLength={100}
                    readOnly
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4">
                    <CountryCodeSelect
                      value={shippingAddress.countryCode}
                      onChange={(value) => handleAddressChange('shipping', 'countryCode', value)}
                      required
                      disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                      label="Country Code"
                    />
                  </div>
                  <div className="sm:col-span-8">
                    <Input
                      type="tel"
                      label="Phone Number"
                      placeholder="Enter 10-digit mobile number"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('shipping', 'phone', e.target.value.replace(/\D/g, ''))}
                      required
                      disabled={isSubmitting || (selectedShippingAddressId !== 'new' && selectedShippingAddressId !== undefined)}
                      maxLength={10}
                      aria-label="Phone number"
                    />
                  </div>
                </div>
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
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setUseSameAddress(checked);
                    // Reset billing address selection when unchecking
                    if (!checked) {
                      setSelectedBillingAddressId('new');
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-5 h-5 cursor-pointer accent-[var(--text-on-cream)]"
                  aria-label="Use same address for billing"
                />
                <label htmlFor="same-address" className="text-[var(--text-on-cream)] font-medium cursor-pointer">
                  Billing address same as shipping
                </label>
              </div>

              {!useSameAddress && (
                <div className="space-y-4">
                  <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-4">
                    Billing Address
                  </h3>
                  
                  {/* Billing Address Selection - Only show if there are saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-[var(--text-on-cream)] font-medium mb-2">
                        Select saved address or enter new
                      </label>
                      {isLoadingAddresses ? (
                        <div className="text-[var(--text-secondary)] text-sm py-2">Loading addresses...</div>
                      ) : (
                        <select
                          value={selectedBillingAddressId}
                          onChange={(e) => setSelectedBillingAddressId(e.target.value as string | 'new')}
                          disabled={isSubmitting || isLoadingAddresses}
                          className="w-full px-4 py-2 border border-[var(--border-light)] rounded-lg focus:outline-none focus:border-[var(--text-on-cream)] bg-[var(--cream)] text-[var(--text-on-cream)] min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-no-repeat bg-right bg-[length:20px] pr-10 [&>option]:bg-[var(--cream)] [&>option]:text-[var(--text-on-cream)]"
                        >
                          <option value="new">Enter new address</option>
                          {savedAddresses.map((address) => (
                            <option key={address.id} value={address.id}>
                              {address.firstName} {address.lastName}, {address.addressLine1}, {address.city}, {address.state} {address.zipCode}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="First Name"
                      value={billingAddress.firstName}
                      onChange={(e) => handleAddressChange('billing', 'firstName', e.target.value)}
                      required
                      disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                      maxLength={50}
                    />
                    <Input
                      type="text"
                      label="Last Name"
                      value={billingAddress.lastName}
                      onChange={(e) => handleAddressChange('billing', 'lastName', e.target.value)}
                      required
                      disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                      maxLength={50}
                    />
                  </div>
                  <Input
                    type="text"
                    label="Address Line 1"
                    placeholder="House/Flat number, Building name, Street"
                    value={billingAddress.addressLine1}
                    onChange={(e) => handleAddressChange('billing', 'addressLine1', e.target.value)}
                    required
                    disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                    maxLength={200}
                  />
                  <Input
                    type="text"
                    label="Address Line 2 (Optional)"
                    placeholder="Apartment, Suite, Unit, Floor, etc."
                    value={billingAddress.addressLine2 || ''}
                    onChange={(e) => handleAddressChange('billing', 'addressLine2', e.target.value)}
                    disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                    maxLength={200}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Autocomplete
                      label="State"
                      value={billingAddress.state}
                      onChange={(value) => {
                        handleAddressChange('billing', 'state', value);
                        handleAddressChange('billing', 'city', ''); // Clear city when state changes
                      }}
                      suggestions={getAllStates()}
                      filterSuggestions={(query, suggestions) => 
                      suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10)
                    }
                      placeholder="Select or type state"
                      required
                      disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                      maxLength={100}
                    />
                    <Autocomplete
                      label="City"
                      value={billingAddress.city}
                      onChange={(value) => {
                        const filteredValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
                        handleAddressChange('billing', 'city', filteredValue);
                      }}
                      suggestions={billingAddress.state ? getCitiesByState(billingAddress.state) : []}
                      filterSuggestions={(query, suggestions) => 
                        suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10)
                      }
                      placeholder="Select or type city"
                      required
                      disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined) || !billingAddress.state}
                      maxLength={100}
                      onInputChange={(value) => {
                        const filteredValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
                        handleAddressChange('billing', 'city', filteredValue);
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="ZIP Code (Pincode)"
                      placeholder="Enter 6-digit pincode"
                      value={billingAddress.zipCode}
                      onChange={(e) => handleAddressChange('billing', 'zipCode', e.target.value)}
                      required
                      disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                      maxLength={6}
                    />
                    <Input
                      type="text"
                      label="Country"
                      value={billingAddress.country}
                      onChange={(e) => handleAddressChange('billing', 'country', e.target.value)}
                      required
                      disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                      maxLength={100}
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <CountryCodeSelect
                        value={billingAddress.countryCode}
                        onChange={(value) => handleAddressChange('billing', 'countryCode', value)}
                        required
                        disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                        label="Country Code"
                      />
                    </div>
                    <div className="sm:col-span-8">
                      <Input
                        type="tel"
                        label="Phone Number"
                        placeholder="Enter 10-digit mobile number"
                        value={billingAddress.phone}
                        onChange={(e) => handleAddressChange('billing', 'phone', e.target.value.replace(/\D/g, ''))}
                        required
                        disabled={isSubmitting || (selectedBillingAddressId !== 'new' && selectedBillingAddressId !== undefined)}
                        maxLength={10}
                        aria-label="Phone number"
                      />
                    </div>
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
              <div className="space-y-3" role="radiogroup" aria-label="Payment method selection">
                <label className="flex items-center gap-3 p-4 border border-[var(--border-light)] rounded-lg cursor-pointer hover:bg-[var(--beige)] transition-colors min-h-[44px]">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    disabled={isSubmitting}
                    aria-label="Cash on Delivery - Pay when you receive"
                  />
                  <div>
                    <div className="text-[var(--text-on-cream)] font-medium">Cash on Delivery</div>
                    <div className="text-[var(--text-secondary)] text-sm">Pay when you receive</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-[var(--border-light)] rounded-lg cursor-not-allowed opacity-50 min-h-[44px]">
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'online')}
                    disabled={true}
                    aria-label="Online Payment - Coming soon"
                    aria-disabled="true"
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
            <ScrollReveal delay={0.35}>
              <Card className="border-2 border-[var(--error-border)] bg-[var(--error-bg)]">
                <div className="text-[var(--error-text)] text-sm font-medium" role="alert" aria-live="assertive">
                  {error}
                </div>
              </Card>
            </ScrollReveal>
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
                {cart.shipping > 0 ? (
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Shipping</span>
                    <span>{formatPrice(cart.shipping, { currencyCode: cart.currency })}</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-[var(--success-text)] text-sm font-medium">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                )}
                {cart.subtotal > 0 && cart.subtotal < ECOMMERCE.freeShippingThreshold && (
                  <div className="text-[var(--text-muted)] text-xs bg-[var(--beige)] bg-opacity-10 p-2 rounded border border-[var(--border-light)]">
                    Add {formatPrice(ECOMMERCE.freeShippingThreshold - cart.subtotal, { currencyCode: cart.currency })} more for free shipping
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
                aria-label={isSubmitting ? 'Placing order, please wait...' : 'Place order'}
                aria-busy={isSubmitting}
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
