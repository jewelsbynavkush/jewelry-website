'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { apiGet } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils/price-formatting';
import { getCDNUrl } from '@/lib/utils/cdn';
import { useAuthStore } from '@/lib/store/auth-store';
import ErrorMessage from '@/components/ui/ErrorMessage';
import LoadingState from '@/components/ui/LoadingState';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  items: Array<{
    productId: string;
    sku: string;
    title: string;
    image?: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  carrier?: string;
  customerNotes?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = params?.orderId as string;

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<{ order: OrderDetails }>(`/api/orders/${orderId}`);
      if (response.success && response.data) {
        setOrder(response.data.order);
      } else {
        setError(response.error || 'Failed to load order details');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push(`/auth/login?redirect=/orders/${orderId}`);
      return;
    }

    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, authLoading, orderId, router, fetchOrderDetails]);

  // Redirect if user becomes unauthenticated (e.g., after logout)
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'text-[var(--accent-warning)]',
      confirmed: 'text-[var(--accent-info)]',
      processing: 'text-[var(--accent-info)]',
      shipped: 'text-[var(--accent-info)]',
      delivered: 'text-[var(--success-text)]',
      cancelled: 'text-[var(--error-text)]',
    };
    return statusColors[status.toLowerCase()] || 'text-[var(--text-secondary)]';
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'text-[var(--accent-warning)]',
      paid: 'text-[var(--success-text)]',
      failed: 'text-[var(--error-text)]',
      refunded: 'text-[var(--text-secondary)]',
    };
    return statusColors[status.toLowerCase()] || 'text-[var(--text-secondary)]';
  };

  if (authLoading || isLoading) {
    return (
      <PageContainer maxWidth="4xl">
        <SectionHeading as="h2">ORDER DETAILS</SectionHeading>
        <LoadingState label="Loading order details..." skeletonLines={2} />
      </PageContainer>
    );
  }

  if (error && !order) {
    return (
      <PageContainer maxWidth="4xl">
        <SectionHeading as="h2">ORDER DETAILS</SectionHeading>
        <Card>
          <div className="text-center py-12 space-y-4">
            <ErrorMessage message={error} />
            <div className="flex gap-4 justify-center">
              <Button onClick={fetchOrderDetails}>Retry</Button>
              <Button variant="outline" onClick={() => router.push('/profile')}>
                Back to Profile
              </Button>
            </div>
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <h1 className="sr-only">Order Details - {order.orderNumber}</h1>
        <div className="flex items-center justify-between mb-6">
          <SectionHeading as="h2">ORDER DETAILS</SectionHeading>
          <Button variant="outline" onClick={() => router.push('/profile')}>
            Back to Profile
          </Button>
        </div>
      </ScrollReveal>

      <div className="space-y-6 mt-6">
        {/* Order Summary */}
        <ScrollReveal delay={0.1}>
          <Card>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-light)]">
                <div>
                  <p className="text-[var(--text-secondary)] text-sm">Order Number</p>
                  <p className="text-[var(--text-on-cream)] font-semibold text-lg">{order.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[var(--text-secondary)] text-sm">Order Date</p>
                  <p className="text-[var(--text-on-cream)] font-medium">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Order Status</p>
                  <p className={`font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Payment Status</p>
                  <p className={`font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus.toUpperCase()}
                  </p>
                </div>
              </div>

              {order.trackingNumber && (
                <div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Tracking Number</p>
                  <p className="text-[var(--text-on-cream)] font-medium">{order.trackingNumber}</p>
                  {order.carrier && (
                    <p className="text-[var(--text-secondary)] text-xs mt-1">Carrier: {order.carrier}</p>
                  )}
                </div>
              )}

              {order.shippedAt && (
                <div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Shipped On</p>
                  <p className="text-[var(--text-on-cream)]">
                    {new Date(order.shippedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}

              {order.deliveredAt && (
                <div>
                  <p className="text-[var(--text-secondary)] text-sm mb-1">Delivered On</p>
                  <p className="text-[var(--text-on-cream)]">
                    {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </ScrollReveal>

        {/* Order Items */}
        <ScrollReveal delay={0.2}>
          <Card>
            <h3 className="text-[var(--text-on-cream)] text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-start gap-4 pb-4 border-b border-[var(--border-light)] last:border-0 last:pb-0"
                >
                  {item.image && (
                    <Image
                      src={getCDNUrl(item.image)}
                      alt={item.title || 'Order item'}
                      width={80}
                      height={80}
                      className="object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-[var(--text-on-cream)] font-medium">{item.title}</p>
                    <p className="text-[var(--text-secondary)] text-sm">SKU: {item.sku}</p>
                    <p className="text-[var(--text-secondary)] text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--text-on-cream)] font-semibold">
                      {formatPrice(item.total, { currencyCode: order.currency })}
                    </p>
                    <p className="text-[var(--text-secondary)] text-sm">
                      {formatPrice(item.price, { currencyCode: order.currency })} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </ScrollReveal>

        {/* Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScrollReveal delay={0.3}>
            <Card>
              <h3 className="text-[var(--text-on-cream)] text-lg font-semibold mb-4">Shipping Address</h3>
              <div className="space-y-2 text-[var(--text-secondary)] text-sm">
                <p className="font-medium text-[var(--text-on-cream)] break-words">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p className="break-words overflow-wrap-anywhere">{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p className="break-words overflow-wrap-anywhere">{order.shippingAddress.addressLine2}</p>
                )}
                <p className="break-words">
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                <p className="break-words">{order.shippingAddress.country}</p>
                {order.shippingAddress.phone && <p className="break-words">Phone: {order.shippingAddress.phone}</p>}
              </div>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <Card>
              <h3 className="text-[var(--text-on-cream)] text-lg font-semibold mb-4">Billing Address</h3>
              <div className="space-y-2 text-[var(--text-secondary)] text-sm">
                <p className="font-medium text-[var(--text-on-cream)] break-words">
                  {order.billingAddress.firstName} {order.billingAddress.lastName}
                </p>
                <p className="break-words overflow-wrap-anywhere">{order.billingAddress.addressLine1}</p>
                {order.billingAddress.addressLine2 && (
                  <p className="break-words overflow-wrap-anywhere">{order.billingAddress.addressLine2}</p>
                )}
                <p className="break-words">
                  {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}
                </p>
                <p className="break-words">{order.billingAddress.country}</p>
                {order.billingAddress.phone && <p className="break-words">Phone: {order.billingAddress.phone}</p>}
              </div>
            </Card>
          </ScrollReveal>
        </div>

        {/* Order Summary */}
        <ScrollReveal delay={0.5}>
          <Card>
            <h3 className="text-[var(--text-on-cream)] text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, { currencyCode: order.currency })}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Discount</span>
                  <span className="text-[var(--success-text)]">
                    -{formatPrice(order.discount, { currencyCode: order.currency })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping, { currencyCode: order.currency })}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Tax</span>
                <span>{formatPrice(order.tax, { currencyCode: order.currency })}</span>
              </div>
              <div className="flex justify-between text-[var(--text-on-cream)] font-bold text-lg pt-3 border-t border-[var(--border-light)]">
                <span>Total</span>
                <span>{formatPrice(order.total, { currencyCode: order.currency })}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)] text-sm pt-2">
                <span>Payment Method</span>
                <span className="font-medium">{order.paymentMethod.toUpperCase()}</span>
              </div>
            </div>
          </Card>
        </ScrollReveal>

        {order.customerNotes && (
          <ScrollReveal delay={0.6}>
            <Card>
              <h3 className="text-[var(--text-on-cream)] text-lg font-semibold mb-2">Customer Notes</h3>
              <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap">
                {order.customerNotes}
              </p>
            </Card>
          </ScrollReveal>
        )}
      </div>
    </PageContainer>
  );
}
