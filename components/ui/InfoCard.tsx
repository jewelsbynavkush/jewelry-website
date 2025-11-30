import React from 'react';
import SectionHeading from './SectionHeading';
import Card from './Card';

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Reusable Info Card component for contact information, business hours, etc.
 */
export default function InfoCard({ 
  title,
  children,
  className = '',
}: InfoCardProps) {
  return (
    <Card className={className}>
      <SectionHeading as="h3" size="xs" align="left" className="mb-3 sm:mb-4 text-[#2a2a2a]">
        {title}
      </SectionHeading>
      {children}
    </Card>
  );
}

