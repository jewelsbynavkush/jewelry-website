/**
 * Migration Script - Footer Pages Content
 *
 * Migrates footer page content (Materials, Sustainability, Shipping, FAQs, Privacy, Terms)
 * from hardcoded page components to MongoDB site_settings.
 *
 * Usage: npx tsx scripts/migrate-footer-pages.ts
 * Or: npm run migrate:footer-pages
 *
 * Safe to run multiple times (upsert).
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  try {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const equalIndex = trimmedLine.indexOf('=');
        if (equalIndex > 0) {
          const key = trimmedLine.substring(0, equalIndex).trim();
          let value = trimmedLine.substring(equalIndex + 1).trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          if (key && value) process.env[key] = value;
        }
      }
    });
    console.log('✅ Loaded .env.local');
  } catch {
    console.warn('⚠️  Could not load .env.local');
  }
}

import connectDB from '../lib/mongodb';
import { SiteSettings } from '@/models';

async function migrate() {
  try {
    console.log('🚀 Migrating footer pages to MongoDB...\n');
    await connectDB();
    console.log('✅ Connected to MongoDB\n');

    console.log('📦 Materials...');
    await SiteSettings.findOneAndUpdate(
      { type: 'materials' },
      {
        type: 'materials',
        data: {
          materials: {
            title: 'MATERIALS',
            sections: [
              {
                paragraphs: [
                  'At Jewels by Navkush, we specialize in freshwater pearls and cultured pearls, carefully selected for their natural beauty and radiant luster.',
                  'Freshwater pearls are known for their soft glow and organic charm, while cultured pearls are cultivated with precision to achieve exceptional quality and elegance. Each pearl is thoughtfully chosen to ensure our jewelry reflects timeless sophistication and refined craftsmanship.',
                ],
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ materials');

    console.log('📦 Sustainability...');
    await SiteSettings.findOneAndUpdate(
      { type: 'sustainability' },
      {
        type: 'sustainability',
        data: {
          sustainability: {
            title: 'SUSTAINABILITY',
            sections: [
              {
                paragraphs: [
                  'At Jewels by Navkush, we believe true beauty should be responsible and enduring. Our pearls are thoughtfully sourced, and we work with trusted partners who follow ethical cultivation practices.',
                  'By focusing on freshwater and cultured pearls, we celebrate materials that are naturally formed and sustainably cultivated. We are committed to mindful sourcing and craftsmanship that respects both nature and tradition.',
                ],
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ sustainability');

    console.log('📦 Shipping (page content)...');
    await SiteSettings.findOneAndUpdate(
      { type: 'shipping' },
      {
        type: 'shipping',
        data: {
          shippingPage: {
            title: 'SHIPPING & RETURNS',
            sections: [
              {
                visible: true,
                heading: 'Shipping Information',
                paragraphs: [
                  'We offer secure shipping to ensure your jewelry arrives safely. All orders are carefully packaged in protective materials and shipped via trusted carriers.',
                ],
                subsections: [
                  {
                    visible: true,
                    heading: 'Shipping Options',
                    listItems: [
                      'Standard Shipping: 5-7 business days',
                      'Express Shipping: 2-3 business days',
                      'Overnight Shipping: Next business day (available for select items)',
                    ],
                  },
                ],
                paragraphsAfter: [
                  'Shipping costs are calculated at checkout based on your location and selected shipping method. Free shipping is available for orders over the threshold shown at checkout.',
                ],
              },
              {
                visible: true,
                heading: 'Returns & Exchanges',
                paragraphs: [
                  "We want you to be completely satisfied with your purchase. If you're not happy with your jewelry, we offer a hassle-free return and exchange policy.",
                ],
                subsections: [
                  {
                    visible: true,
                    heading: 'Return Policy',
                    listItems: [
                      '30-day return window from date of delivery',
                      'Items must be in original condition with all packaging',
                      'Custom or personalized items may not be eligible for return',
                      'Refunds will be processed within 5-7 business days',
                    ],
                  },
                ],
                paragraphsAfter: [
                  "To initiate a return, please contact our customer service team. We'll provide you with a return authorization and shipping instructions.",
                ],
              },
              {
                visible: true,
                heading: 'International Shipping',
                paragraphs: [
                  'We currently ship to select international destinations. International shipping times and costs vary by location. Please note that customers are responsible for any customs duties or taxes that may apply.',
                  'For international orders, please allow additional time for customs processing. We recommend choosing express shipping for faster delivery.',
                ],
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ shipping');

    console.log('📦 FAQs...');
    await SiteSettings.findOneAndUpdate(
      { type: 'faqs' },
      {
        type: 'faqs',
        data: {
          faqs: {
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
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ faqs');

    console.log('📦 Privacy...');
    await SiteSettings.findOneAndUpdate(
      { type: 'privacy' },
      {
        type: 'privacy',
        data: {
          privacy: {
            title: 'PRIVACY POLICY',
            lastUpdated: 'November 2024',
            sections: [
              {
                paragraphs: [
                  'At Jewels by NavKush, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase.',
                ],
              },
              {
                heading: 'Information We Collect',
                paragraphs: [
                  'We collect information that you provide directly to us, including:',
                ],
                listItems: [
                  'Name, email address, and phone number',
                  'Shipping and billing addresses',
                  'Payment information (processed securely through our payment providers)',
                  'Order history and preferences',
                  'Communications with our customer service team',
                ],
                paragraphsAfter: [
                  'We also automatically collect certain information when you visit our website, such as your IP address, browser type, and browsing behavior.',
                ],
              },
              {
                heading: 'How We Use Your Information',
                paragraphs: ['We use the information we collect to:'],
                listItems: [
                  'Process and fulfill your orders',
                  'Communicate with you about your orders and our products',
                  'Improve our website and customer experience',
                  'Send you marketing communications (with your consent)',
                  'Comply with legal obligations',
                ],
              },
              {
                heading: 'Data Security',
                paragraphs: [
                  'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.',
                ],
              },
              {
                heading: 'Your Rights',
                paragraphs: ['You have the right to:'],
                listItems: [
                  'Access your personal information',
                  'Correct inaccurate information',
                  'Request deletion of your information',
                  'Opt-out of marketing communications',
                  'Object to certain processing activities',
                ],
                paragraphsAfter: [
                  'To exercise these rights, please contact us using the information provided in our Contact page.',
                ],
              },
              {
                heading: 'Contact Us',
                paragraphs: [
                  'If you have questions about this Privacy Policy, please contact us at Our Contact Page.',
                ],
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ privacy');

    console.log('📦 Terms...');
    await SiteSettings.findOneAndUpdate(
      { type: 'terms' },
      {
        type: 'terms',
        data: {
          terms: {
            title: 'TERMS OF SERVICE',
            lastUpdated: 'November 2024',
            sections: [
              {
                paragraphs: [
                  'Please read these Terms of Service carefully before using the Jewels by NavKush website. By accessing or using our website, you agree to be bound by these terms.',
                ],
              },
              {
                heading: 'Acceptance of Terms',
                paragraphs: [
                  'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our website.',
                ],
              },
              {
                heading: 'Products and Pricing',
                paragraphs: [
                  'We strive to provide accurate product descriptions and pricing. However, we reserve the right to correct any errors, inaccuracies, or omissions and to change or update information at any time without prior notice.',
                  'All prices are listed in INR (Indian Rupees) unless otherwise stated. Prices are subject to change without notice, but we will honor the price at the time of your order.',
                ],
              },
              {
                heading: 'Orders and Payment',
                paragraphs: [
                  'When you place an order, you are making an offer to purchase products at the prices listed. We reserve the right to accept or decline your order for any reason.',
                  'Payment must be received before we process and ship your order. We accept major credit cards and other payment methods as indicated during checkout.',
                ],
              },
              {
                heading: 'Intellectual Property',
                paragraphs: [
                  'All content on this website, including text, graphics, logos, images, and software, is the property of Jewels by NavKush and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.',
                ],
              },
              {
                heading: 'Limitation of Liability',
                paragraphs: [
                  'Jewels by NavKush shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the website or products.',
                ],
              },
              {
                heading: 'Changes to Terms',
                paragraphs: [
                  'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after changes are posted constitutes your acceptance of the modified terms.',
                ],
              },
              {
                heading: 'Contact Information',
                paragraphs: [
                  'If you have questions about these Terms of Service, please contact us at Our Contact Page.',
                ],
              },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('   ✅ terms');

    console.log('\n✅ Footer pages migration complete.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
