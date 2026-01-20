'use client';

/**
 * Cart Summary Component
 * 
 * Displays cart totals and checkout button.
 */

import { Cart } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils/price-formatting';
import { ECOMMERCE } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

interface CartSummaryProps {
  cart: Cart;
}

export default function CartSummary({ cart }: CartSummaryProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <Card className="sticky top-4">
      <div className="space-y-4">
        <h3 className="text-[var(--text-on-cream)] text-xl font-bold mb-4">
          Order Summary
        </h3>

        <div className="space-y-3">
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

          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Shipping</span>
            {cart.shipping > 0 ? (
              <span>{formatPrice(cart.shipping, { currencyCode: cart.currency })}</span>
            ) : (
              <span className="text-[var(--success-text)] font-medium">FREE</span>
            )}
          </div>
          {cart.subtotal > 0 && cart.subtotal < ECOMMERCE.freeShippingThreshold && (
            <div className="text-[var(--text-muted)] text-sm">
              Add {formatPrice(ECOMMERCE.freeShippingThreshold - cart.subtotal, { currencyCode: cart.currency })} more for free shipping
            </div>
          )}

          {cart.discount > 0 && (
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Discount</span>
              <span className="text-[var(--success-text)]">
                -{formatPrice(cart.discount, { currencyCode: cart.currency })}
              </span>
            </div>
          )}

          <div className="border-t border-[var(--border-light)] pt-3 mt-3">
            <div className="flex justify-between text-[var(--text-on-cream)] font-bold text-lg">
              <span>Total</span>
              <span>{formatPrice(cart.total, { currencyCode: cart.currency })}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleCheckout}
          className="w-full min-h-[44px] mt-6"
          disabled={cart.items.length === 0}
          aria-label="Proceed to checkout"
        >
          PROCEED TO CHECKOUT →
        </Button>

        <Button
          href="/designs"
          variant="outline"
          className="w-full min-h-[44px]"
          aria-label="Continue shopping"
        >
          CONTINUE SHOPPING
        </Button>
      </div>
    </Card>
  );
}
