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

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: 'shipping' as 'shipping' | 'billing',
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
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

    try {
      const response = await apiPost<{ addressId: string; addresses: Address[] }>(
        '/api/users/addresses',
        formData
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

    try {
      const response = await apiPatch<{ address: Address; addresses: Address[] }>(
        `/api/users/addresses/${id}`,
        formData
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                disabled={isLoading}
              />
              <Input
                type="text"
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <Input
              type="text"
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              required
              disabled={isLoading}
            />
            <Input
              type="text"
              label="Address Line 2 (Optional)"
              value={formData.addressLine2}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              disabled={isLoading}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                disabled={isLoading}
              />
              <Input
                type="text"
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="text"
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                required
                disabled={isLoading}
              />
              <Input
                type="text"
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                required
                disabled={isLoading}
              />
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
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {address.isDefault && (
                    <span className="inline-block bg-[var(--beige)] text-[var(--text-on-beige)] text-xs font-medium px-2 py-1 rounded mb-2">
                      Default
                    </span>
                  )}
                  <p className="text-[var(--text-on-cream)] font-medium">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm mt-1">
                    {address.addressLine1}
                    {address.addressLine2 && `, ${address.addressLine2}`}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-[var(--text-secondary)] text-sm">{address.country}</p>
                  {address.phone && (
                    <p className="text-[var(--text-secondary)] text-sm mt-1">Phone: {address.phone}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(address)}
                    className="text-[var(--text-secondary)] hover:text-[var(--text-on-cream)] text-sm"
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="text-[var(--error-text)] hover:text-[var(--error-text)] text-sm"
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
