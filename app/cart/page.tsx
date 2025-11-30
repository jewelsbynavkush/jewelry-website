import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateStandardMetadata({
  title: 'Shopping Cart',
  description: 'View and manage your shopping cart. Add beautiful jewelry pieces to your cart and proceed to checkout.',
  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/cart`,
});

export default function CartPage() {
  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <SectionHeading>SHOPPING CART</SectionHeading>
      </ScrollReveal>
      <ScrollReveal delay={0.1}>
        <Card className="text-center">
          <div className="space-y-4">
            <p className="text-[#6a6a6a] text-body-lg mb-4" role="status" aria-live="polite">
              Your cart is empty
            </p>
            <p className="text-[#918c87] text-body-base">
              Add beautiful jewelry pieces to your cart to get started.
            </p>
            <Button href="/designs" aria-label="Continue shopping to browse jewelry collection">
              CONTINUE SHOPPING →
            </Button>
          </div>
        </Card>
      </ScrollReveal>
    </PageContainer>
  );
}

