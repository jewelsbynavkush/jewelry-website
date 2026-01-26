'use client';

/**
 * Address List Component
 * 
 * Displays and manages user addresses:
 * - List addresses
 * - Add new address
 * - Edit address
 * - Delete address
 * - Set default address
 */

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api/client';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import CountryCodeSelect from '@/components/ui/CountryCodeSelect';
import Autocomplete from '@/components/ui/Autocomplete';
import { getAllStates, getCitiesByState } from '@/lib/data/indian-addresses';

export interface Address {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  countryCode?: string;
  isDefault: boolean;
}

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'shipping' as 'shipping' | 'billing' | 'both',
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
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<{ addresses: Address[] }>('/api/users/addresses');
      if (response.success && response.data) {
        setAddresses(response.data.addresses);
      } else {
        setError(response.error || 'Failed to load addresses');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate all required fields with proper limits
    if (!formData.firstName.trim()) {
      setError('First name is required');
      setIsLoading(false);
      return;
    }
    if (formData.firstName.length > 50) {
      setError('First name must not exceed 50 characters');
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.firstName)) {
      setError('First name can only contain letters, spaces, hyphens, apostrophes, and dots');
      setIsLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setIsLoading(false);
      return;
    }
    if (formData.lastName.length > 50) {
      setError('Last name must not exceed 50 characters');
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.lastName)) {
      setError('Last name can only contain letters, spaces, hyphens, apostrophes, and dots');
      setIsLoading(false);
      return;
    }

    if (!formData.addressLine1.trim()) {
      setError('Address line 1 is required');
      setIsLoading(false);
      return;
    }
    if (formData.addressLine1.trim().length < 5) {
      setError('Address line 1 must be at least 5 characters');
      setIsLoading(false);
      return;
    }
    if (formData.addressLine1.length > 200) {
      setError('Address line 1 must not exceed 200 characters');
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9\s\-'.,\/#()]+$/.test(formData.addressLine1)) {
      setError('Address line 1 can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)');
      setIsLoading(false);
      return;
    }

    if (formData.addressLine2 && formData.addressLine2.trim()) {
      if (formData.addressLine2.length > 200) {
        setError('Address line 2 must not exceed 200 characters');
        setIsLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9\s\-'.,\/#()]*$/.test(formData.addressLine2)) {
        setError('Address line 2 can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)');
        setIsLoading(false);
        return;
      }
    }

    if (!formData.city.trim()) {
      setError('City is required');
      setIsLoading(false);
      return;
    }
    if (formData.city.length < 2) {
      setError('City name must be at least 2 characters');
      setIsLoading(false);
      return;
    }
    if (formData.city.length > 100) {
      setError('City name must not exceed 100 characters');
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(formData.city)) {
      setError('City name can only contain letters, numbers, spaces, hyphens, apostrophes, and dots');
      setIsLoading(false);
      return;
    }

    if (!formData.state.trim()) {
      setError('State is required');
      setIsLoading(false);
      return;
    }
    if (formData.state.length > 100) {
      setError('State name must not exceed 100 characters');
      setIsLoading(false);
      return;
    }

    if (!formData.zipCode.trim()) {
      setError('Pincode is required');
      setIsLoading(false);
      return;
    }
    if (!/^[0-9]{6}$/.test(formData.zipCode.trim())) {
      setError('Pincode must be exactly 6 digits');
      setIsLoading(false);
      return;
    }

    if (!formData.country.trim()) {
      setError('Country is required');
      setIsLoading(false);
      return;
    }
    if (formData.country.trim().toLowerCase() !== 'india') {
      setError('Only India is supported at this time');
      setIsLoading(false);
      return;
    }

    // Validate phone number
    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone.trim())) {
      setError('Phone number is required and must be exactly 10 digits');
      setIsLoading(false);
      return;
    }

    if (!formData.countryCode || formData.countryCode.trim() !== '+91') {
      setError('Only +91 (India) country code is supported');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiPost<{ addressId: string; addresses: Address[] }>(
        '/api/users/addresses',
        {
          ...formData,
          phone: formData.phone.trim(),
          countryCode: formData.countryCode.trim(),
        }
      );

      if (response.success && response.data) {
        setAddresses(response.data.addresses);
        setShowAddForm(false);
        resetForm();
      } else {
        setError(response.error || 'Failed to add address');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setIsLoading(true);
    setError(null);

    // Validate all fields with proper limits (same as handleAdd)
    if (formData.firstName && formData.firstName.trim()) {
      if (formData.firstName.length > 50) {
        setError('First name must not exceed 50 characters');
        setIsLoading(false);
        return;
      }
      if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.firstName)) {
        setError('First name can only contain letters, spaces, hyphens, apostrophes, and dots');
        setIsLoading(false);
        return;
      }
    }

    if (formData.lastName && formData.lastName.trim()) {
      if (formData.lastName.length > 50) {
        setError('Last name must not exceed 50 characters');
        setIsLoading(false);
        return;
      }
      if (!/^[a-zA-Z\s\-'\.]+$/.test(formData.lastName)) {
        setError('Last name can only contain letters, spaces, hyphens, apostrophes, and dots');
        setIsLoading(false);
        return;
      }
    }

    if (formData.addressLine1 && formData.addressLine1.trim()) {
      if (formData.addressLine1.trim().length < 5) {
        setError('Address line 1 must be at least 5 characters');
        setIsLoading(false);
        return;
      }
      if (formData.addressLine1.length > 200) {
        setError('Address line 1 must not exceed 200 characters');
        setIsLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9\s\-'.,\/#()]+$/.test(formData.addressLine1)) {
        setError('Address line 1 can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)');
        setIsLoading(false);
        return;
      }
    }

    if (formData.addressLine2 && formData.addressLine2.trim()) {
      if (formData.addressLine2.length > 200) {
        setError('Address line 2 must not exceed 200 characters');
        setIsLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9\s\-'.,\/#()]*$/.test(formData.addressLine2)) {
        setError('Address line 2 can only contain letters, numbers, spaces, and common address characters (hyphens, apostrophes, commas, periods, forward slashes, hash symbols, parentheses)');
        setIsLoading(false);
        return;
      }
    }

    if (formData.addressLine2 && formData.addressLine2.length > 200) {
      setError('Address line 2 must not exceed 200 characters');
      setIsLoading(false);
      return;
    }

    if (formData.city && formData.city.trim()) {
      if (formData.city.length < 2) {
        setError('City name must be at least 2 characters');
        setIsLoading(false);
        return;
      }
      if (formData.city.length > 100) {
        setError('City name must not exceed 100 characters');
        setIsLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(formData.city)) {
        setError('City name can only contain letters, numbers, spaces, hyphens, apostrophes, and dots');
        setIsLoading(false);
        return;
      }
    }

    if (formData.state && formData.state.trim() && formData.state.length > 100) {
      setError('State name must not exceed 100 characters');
      setIsLoading(false);
      return;
    }

    if (formData.zipCode && formData.zipCode.trim()) {
      if (!/^[0-9]{6}$/.test(formData.zipCode.trim())) {
        setError('Pincode must be exactly 6 digits');
        setIsLoading(false);
        return;
      }
    }

    if (formData.country && formData.country.trim() && formData.country.trim().toLowerCase() !== 'india') {
      setError('Only India is supported at this time');
      setIsLoading(false);
      return;
    }

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
        setError('Phone number must be exactly 10 digits');
        setIsLoading(false);
        return;
      }
    }

    if (formData.countryCode && formData.countryCode.trim() !== '+91') {
      setError('Only +91 (India) country code is supported');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiPatch<{ address: Address; addresses: Address[] }>(
        `/api/users/addresses/${id}`,
        {
          ...formData,
          phone: formData.phone.trim(),
          countryCode: formData.countryCode.trim(),
        }
      );

      if (response.success && response.data) {
        setAddresses(response.data.addresses);
        setEditingId(null);
        resetForm();
      } else {
        setError(response.error || 'Failed to update address');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiDelete<{ addresses: Address[] }>(`/api/users/addresses/${id}`);

      if (response.success && response.data) {
        setAddresses(response.data.addresses);
      } else {
        setError(response.error || 'Failed to delete address');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete address');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'shipping',
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
      isDefault: false,
    });
  };

  const startEdit = (address: Address) => {
    setFormData({
      type: address.type,
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
      countryCode: address.countryCode || '+91',
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowAddForm(false);
  };

  if (isLoading && addresses.length === 0) {
    return (
      <Card>
        <p className="text-[var(--text-secondary)] text-center py-8">Loading addresses...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[var(--text-on-cream)] text-xl font-bold">Addresses</h3>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            resetForm();
          }}
          variant="outline"
          disabled={isLoading || showAddForm}
        >
          + Add Address
        </Button>
      </div>

      {error && (
        <div className="text-[var(--error-text)] text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingId) && (
        <Card>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingId) {
                handleUpdate(editingId);
              } else {
                handleAdd(e);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s\-'\.]/g, '');
                  setFormData({ ...formData, firstName: value });
                }}
                required
                disabled={isLoading}
                maxLength={50}
              />
              <Input
                type="text"
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z\s\-'\.]/g, '');
                  setFormData({ ...formData, lastName: value });
                }}
                required
                disabled={isLoading}
                maxLength={50}
              />
            </div>
            <Input
              type="text"
              label="Address Line 1"
              placeholder="House/Flat number, Building name, Street"
              value={formData.addressLine1}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s\-'.,\/#()]/g, '');
                setFormData({ ...formData, addressLine1: value });
              }}
              required
              disabled={isLoading}
              maxLength={200}
            />
            <Input
              type="text"
              label="Address Line 2 (Optional)"
              placeholder="Apartment, Suite, Unit, Floor, etc."
              value={formData.addressLine2}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9\s\-'.,\/#()]/g, '');
                setFormData({ ...formData, addressLine2: value });
              }}
              disabled={isLoading}
              maxLength={200}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Autocomplete
                label="State"
                value={formData.state}
                onChange={(value) => {
                  setFormData({ ...formData, state: value, city: '' }); // Clear city when state changes
                }}
                suggestions={getAllStates()}
                filterSuggestions={(query, suggestions) => 
                  suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10)
                }
                placeholder="Select or type state"
                required
                disabled={isLoading}
                maxLength={100}
              />
              <Autocomplete
                label="City"
                value={formData.city}
                onChange={(value) => {
                  const filteredValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
                  setFormData({ ...formData, city: filteredValue });
                }}
                suggestions={formData.state ? getCitiesByState(formData.state) : []}
                filterSuggestions={(query, suggestions) => 
                  suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase().trim())).slice(0, 10)
                }
                placeholder="Select or type city"
                required
                disabled={isLoading || !formData.state}
                maxLength={100}
                onInputChange={(value) => {
                  const filteredValue = value.replace(/[^a-zA-Z0-9\s\-'\.]/g, '');
                  setFormData({ ...formData, city: filteredValue });
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="text"
                label="ZIP Code (Pincode)"
                placeholder="Enter 6-digit pincode"
                value={formData.zipCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setFormData({ ...formData, zipCode: value });
                }}
                required
                disabled={isLoading}
                maxLength={6}
              />
              <Input
                type="text"
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                disabled={isLoading}
                maxLength={100}
                readOnly
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-4">
                <CountryCodeSelect
                  value={formData.countryCode}
                  onChange={(value) => setFormData({ ...formData, countryCode: value })}
                  required
                  disabled={isLoading}
                  label="Country Code"
                />
              </div>
              <div className="sm:col-span-8">
                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  required
                  disabled={isLoading}
                  maxLength={10}
                  aria-label="Phone number"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                disabled={isLoading}
              />
              <label htmlFor="isDefault" className="text-[var(--text-on-cream)]">
                Set as default address
              </label>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {editingId ? 'Update' : 'Add'} Address
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Address List */}
      {addresses.length === 0 && !showAddForm ? (
        <Card>
          <p className="text-[var(--text-secondary)] text-center py-8">
            No addresses saved. Add your first address above.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  {address.isDefault && (
                    <span className="inline-block bg-[var(--beige)] text-[var(--text-on-beige)] text-xs font-medium px-2 py-1 rounded mb-2">
                      Default
                    </span>
                  )}
                  <p className="text-[var(--text-on-cream)] font-medium break-words">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mt-1 break-words overflow-wrap-anywhere">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm break-words">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm break-words">{address.country}</p>
                  {address.phone && (
                    <p className="text-[var(--text-secondary)] text-sm mt-1 break-words">Phone: {address.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(address)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-on-cream)] text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-[var(--error-text)] hover:text-[var(--error-text)] text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                    disabled={isLoading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
