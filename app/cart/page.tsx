'use client';

/**
 * Cart Page
 * 
 * Displays shopping cart with items, totals, and checkout button.
 * Integrates with Cart API via cart store.
 */

import { useEffect } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { useCartStore } from '@/lib/store/cart-store';
import { ECOMMERCE } from '@/lib/constants';

export default function CartPage() {
  const { cart, isLoading, error, fetchCart } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && !cart) {
    return (
      <PageContainer maxWidth="4xl">
        <ScrollReveal>
          <SectionHeading as="h2">SHOPPING CART</SectionHeading>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Card className="text-center py-12">
            <p className="text-[var(--text-secondary)]">Loading cart...</p>
          </Card>
        </ScrollReveal>
      </PageContainer>
    );
  }

  if (error && !cart) {
    return (
      <PageContainer maxWidth="4xl">
        <ScrollReveal>
          <SectionHeading as="h2">SHOPPING CART</SectionHeading>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Card className="text-center py-12">
            <p className="text-[var(--error-text)] mb-4">{error}</p>
            <Button onClick={() => fetchCart()}>Retry</Button>
          </Card>
        </ScrollReveal>
      </PageContainer>
    );
  }

  const currentCart = cart || {
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    currency: ECOMMERCE.currency,
  };

  const isEmpty = currentCart.items.length === 0;

  return (
    <PageContainer maxWidth="5xl">
      <ScrollReveal>
        <h1 className="sr-only">Shopping Cart - View and manage your jewelry cart</h1>
        <SectionHeading as="h2">SHOPPING CART</SectionHeading>
      </ScrollReveal>

      {isEmpty ? (
        <ScrollReveal delay={0.1}>
          <Card className="text-center">
            <div className="space-y-6 sm:space-y-8 py-8 sm:py-12">
              <div className="space-y-4">
                <div className="text-6xl sm:text-7xl mb-4" aria-hidden="true">
                  🛒
                </div>
                <h2 className="text-[var(--text-on-cream)] text-2xl sm:text-3xl font-bold font-playfair mb-2">
                  Your Cart is Empty
                </h2>
                <p className="text-[var(--text-secondary)] text-body-lg mb-2" role="status" aria-live="polite">
                  Start adding beautiful jewelry pieces to your cart
                </p>
                <p className="text-[var(--text-muted)] text-body-base">
                  Browse our collection of handcrafted rings, earrings, necklaces, and bracelets.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button href="/designs" className="min-h-[44px]" aria-label="Continue shopping to browse jewelry collection">
                  BROWSE COLLECTION →
                </Button>
                <Button 
                  href="/" 
                  variant="outline" 
                  className="min-h-[44px]"
                  aria-label="Return to home page"
                >
                  RETURN HOME
                </Button>
              </div>
            </div>
          </Card>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
          <div className="lg:col-span-2">
            <ScrollReveal delay={0.1}>
              <Card>
                <div className="divide-y divide-[var(--border-light)]">
                  {currentCart.items.map((item) => (
                    <CartItem key={item.productId} item={item} currency={currentCart.currency} />
                  ))}
                </div>
              </Card>
            </ScrollReveal>
          </div>

          <div className="lg:col-span-1">
            <ScrollReveal delay={0.2}>
              <CartSummary cart={currentCart} />
            </ScrollReveal>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
