import { Metadata } from 'next';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { generateStandardMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = generateStandardMetadata({
  title: 'FAQs - Frequently Asked Questions',
  description: 'Find answers to common questions about our jewelry, ordering process, shipping, care instructions, and more. Get the information you need to make the perfect jewelry purchase.',
  url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/faqs`,
});

export default function FAQsPage() {
  const faqs = [
    {
      question: 'What materials do you use in your jewelry?',
      answer: 'We use premium materials including 14k and 18k gold, sterling silver, platinum, and high-quality gemstones. All materials are sourced from certified suppliers who adhere to ethical and environmental standards.',
    },
    {
      question: 'How do I care for my jewelry?',
      answer: 'To keep your jewelry looking its best, store it in a soft pouch or jewelry box when not in use. Clean it gently with a soft cloth and avoid exposing it to harsh chemicals, perfumes, or lotions. For detailed care instructions, please refer to the care card included with your purchase.',
    },
    {
      question: 'Do you offer custom jewelry?',
      answer: 'Yes, we offer custom jewelry services. Please contact us to discuss your vision and we\'ll work with you to create a unique piece that perfectly matches your style and preferences.',
    },
    {
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return window from the date of delivery. Items must be in original condition with all packaging. Custom or personalized items may not be eligible for return. Please contact our customer service team to initiate a return.',
    },
    {
      question: 'How long does shipping take?',
      answer: 'Shipping times vary by location and selected shipping method. Standard shipping typically takes 5-7 business days, express shipping takes 2-3 business days, and overnight shipping is available for select items. International shipping times may vary.',
    },
    {
      question: 'Do you offer gift wrapping?',
      answer: 'Yes, we offer beautiful gift wrapping services. You can select this option at checkout, and we\'ll carefully wrap your jewelry in elegant packaging perfect for gift-giving.',
    },
    {
      question: 'Are your gemstones certified?',
      answer: 'Yes, all our gemstones come with certification documentation that includes information about the stone\'s origin, quality, and characteristics. This documentation is included with your purchase.',
    },
    {
      question: 'Can I resize my ring?',
      answer: 'Yes, we offer ring resizing services. Please contact us within 30 days of purchase to arrange for resizing. There may be a fee for resizing depending on the complexity of the design.',
    },
  ];

  return (
    <PageContainer maxWidth="4xl">
      <ScrollReveal>
        <SectionHeading>FREQUENTLY ASKED QUESTIONS</SectionHeading>
      </ScrollReveal>
      
      <div className="space-y-4 sm:space-y-6">
        {faqs.map((faq, index) => (
          <ScrollReveal key={index} delay={index * 0.1}>
            <Card padding="sm">
              <SectionHeading as="h2" size="sm" align="left" className="mb-3 sm:mb-4">
                {faq.question}
              </SectionHeading>
              <p className="text-[#6a6a6a] text-body-sm sm:text-body-base md:text-body-lg">
                {faq.answer}
              </p>
            </Card>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.5}>
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-[#6a6a6a] text-body-sm sm:text-body-base mb-4">
            Still have questions? We&apos;re here to help!
          </p>
          <Button href="/contact">
            Contact Us
          </Button>
        </div>
      </ScrollReveal>
    </PageContainer>
  );
}

