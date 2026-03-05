import type { Metadata } from 'next';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageSectionLayout from '@/components/ui/PageSectionLayout';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';
import { generateFAQPageSchema } from '@/lib/seo/faq-schema';
import { getBaseUrl } from '@/lib/utils/env';
import { getSiteSettings } from '@/lib/data/site-settings';
import type { FaqsPageContent } from '@/types/data';

const baseUrl = getBaseUrl();

const defaultFaqs: FaqsPageContent = {
  title: 'FAQs',
  ctaText: "Still have questions? We're here to help!",
  faqs: [
    { question: 'What type of pearls do you use?', answer: 'We specialize in freshwater pearls and cultured pearls, carefully selected for their natural beauty, luster, and quality.' },
    { question: 'Are your pearls real?', answer: 'Yes, all our pearls are genuine and sourced with care to ensure their authenticity and elegance.' },
    { question: 'Do pearls require special care?', answer: 'Pearls are delicate and should be protected from perfumes, cosmetics, and harsh chemicals to preserve their natural luster.' },
    { question: 'How should I store my pearl jewelry?', answer: 'Store your pearls in a soft pouch or separate jewelry box to prevent scratches and maintain their beauty.' },
    { question: 'Are your pieces suitable for everyday wear?', answer: 'Yes, many of our designs—especially pearl studs—are perfect for everyday elegance as well as special occasions.' },
    { question: 'Do you offer gift packaging?', answer: 'Yes, all pieces from Jewels by Navkush are presented in elegant packaging, making them ideal for gifting.' },
    { question: 'Do you offer shipping?', answer: 'Yes, we offer shipping for all our orders. Delivery timelines may vary depending on location.' },
  ],
};

export const metadata: Metadata = generateStandardMetadata({
  title: 'FAQs - Frequently Asked Questions',
  description: 'Find answers to common questions about our jewelry, ordering process, shipping, care instructions, and more. Get the information you need to make the perfect jewelry purchase.',
  url: `${baseUrl}/faqs`,
});

export default async function FAQsPage() {
  const settings = await getSiteSettings();
  const content = settings.faqs ?? defaultFaqs;
  const faqs = content.faqs;

  const faqSchema = generateFAQPageSchema(faqs, `${baseUrl}/faqs`);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      <PageSectionLayout
        title={content.title}
        srOnlyTitle="Frequently Asked Questions - Jewelry FAQs"
        maxWidth="4xl"
      >
        <div className="standard-space-y">
          {faqs.map((faq, index) => (
            <ScrollReveal key={faq.question} delay={index * 0.1}>
              <Card padding="sm">
                <h3 className="font-playfair font-bold text-[var(--text-on-cream)] text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">
                  {faq.question}
                </h3>
                <p className="text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg">
                  {faq.answer}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.5}>
          <div className="mt-6 sm:mt-8 md:mt-10 text-center">
            <p className="text-[var(--text-secondary)] text-body-sm sm:text-body-base mb-4">
              {content.ctaText}
            </p>
            <Button href="/contact">
              Contact Us
            </Button>
          </div>
        </ScrollReveal>
      </PageSectionLayout>
    </>
  );
}

