'use client';

/**
 * Order History Component
 * 
 * Displays user's order history with:
 * - Order list
 * - Order details
 * - Order status
 * - Tracking information
 */

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/client';
import { formatPrice } from '@/lib/utils/price-formatting';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import type { Order } from '@/types/api';

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<{ orders: Order[] }>('/api/orders');
      if (response.success && response.data) {
        setOrders(response.data.orders);
      } else {
        setError(response.error || 'Failed to load orders');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    // E-commerce best practice: Use CSS variables for consistent status colors
    const statusColors: Record<string, string> = {
      pending: 'text-[var(--accent-warning)]',
      confirmed: 'text-[var(--accent-info)]',
      shipped: 'text-[var(--accent-info)]',
      delivered: 'text-[var(--success-text)]',
      cancelled: 'text-[var(--error-text)]',
    };
    return statusColors[status.toLowerCase()] || 'text-[var(--text-secondary)]';
  };

  if (isLoading && orders.length === 0) {
    return (
      <Card>
        <div className="text-center py-8 space-y-4">
          <div className="inline-block w-8 h-8 border-4 border-[var(--beige)] border-t-transparent rounded-full animate-spin" aria-label="Loading orders" role="status" />
          <p className="text-[var(--text-secondary)]">Loading orders...</p>
        </div>
      </Card>
    );
  }

  if (error && orders.length === 0) {
    return (
      <Card>
        <p className="text-[var(--error-text)] text-center py-8">{error}</p>
        <Button onClick={fetchOrders} className="mx-auto mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4" aria-hidden="true">
            📦
          </div>
          <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-2">
            No Orders Yet
          </h3>
          <p className="text-[var(--text-secondary)] mb-6">
            Start shopping to see your orders here
          </p>
          <Button href="/designs">Browse Collection</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-[var(--text-on-cream)] text-xl font-bold">Order History</h3>
      {orders.map((order) => (
        <Card key={order.id}>
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[var(--text-on-cream)] font-bold">
                  Order #{order.orderNumber}
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-medium ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </p>
                <p className="text-[var(--text-secondary)] text-sm">
                  {order.paymentStatus}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="text-[var(--text-on-cream)]">
                    {formatPrice(item.total, { currencyCode: order.currency })}
                  </span>
                </div>
              ))}
            </div>

            {order.trackingNumber && (
              <p className="text-[var(--text-secondary)] text-sm">
                Tracking: <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-[var(--border-light)]">
              <p className="text-[var(--text-on-cream)] font-bold">
                Total: {formatPrice(order.total, { currencyCode: order.currency })}
              </p>
              <Link href={`/orders/${order.id}`}>
                <Button variant="outline">
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
