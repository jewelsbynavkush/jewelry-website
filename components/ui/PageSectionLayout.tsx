import { ReactNode } from 'react';
import PageContainer from '@/components/ui/PageContainer';
import SectionHeading from '@/components/ui/SectionHeading';
import ScrollReveal from '@/components/ui/ScrollReveal';

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';

interface PageSectionLayoutProps {
  title: string;
  srOnlyTitle: string;
  maxWidth?: MaxWidth;
  children: ReactNode;
}

export default function PageSectionLayout({
  title,
  srOnlyTitle,
  maxWidth = '4xl',
  children,
}: PageSectionLayoutProps) {
  return (
    <PageContainer maxWidth={maxWidth}>
      <ScrollReveal>
        <h1 className="sr-only">{srOnlyTitle}</h1>
        <SectionHeading as="h2">{title}</SectionHeading>
      </ScrollReveal>
      {children}
    </PageContainer>
  );
}
