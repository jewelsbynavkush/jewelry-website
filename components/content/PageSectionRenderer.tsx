'use client';

import SectionHeading from '@/components/ui/SectionHeading';
import Card from '@/components/ui/Card';
import type { PageSectionContent } from '@/types/data';

interface PageSectionRendererProps {
  section: PageSectionContent;
  className?: string;
  cardSubsections?: boolean;
}

export default function PageSectionRenderer({
  section,
  className = '',
  cardSubsections = false,
}: PageSectionRendererProps) {
  if (section.visible === false) return null;
  const contentClass = 'text-[var(--text-secondary)] text-body-sm sm:text-body-base md:text-body-lg space-y-4';
  const visibleSubsections = section.subsections?.filter((sub) => sub.visible !== false) ?? [];
  return (
    <section className={className}>
      {section.heading && (
        <SectionHeading as="h2" size="md" align="left">
          {section.heading}
        </SectionHeading>
      )}
      {section.paragraphs && section.paragraphs.length > 0 && (
        <div className={contentClass}>
          {section.paragraphs.map((p, i) => (
            <p key={i} className={i < section.paragraphs!.length - 1 ? 'mb-4' : ''}>
              {p}
            </p>
          ))}
        </div>
      )}
      {visibleSubsections.map((sub, i) => (
        <div key={i} className={cardSubsections ? 'mt-4' : 'mt-4'}>
          {cardSubsections ? (
            <Card padding="sm">
              <SectionHeading as="h3" size="sm" align="left" className="mb-3">
                {sub.heading}
              </SectionHeading>
              <ul className="space-y-2 list-disc list-inside">
                {sub.listItems.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </Card>
          ) : (
            <>
              <SectionHeading as="h3" size="sm" align="left" className="mb-2">
                {sub.heading}
              </SectionHeading>
              <ul className="space-y-2 list-disc list-inside">
                {sub.listItems.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}
      {section.listItems && section.listItems.length > 0 && (
        <ul className="space-y-2 list-disc list-inside mt-2">
          {section.listItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {section.paragraphsAfter && section.paragraphsAfter.length > 0 && (
        <div className={`${contentClass} mt-4`}>
          {section.paragraphsAfter.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </section>
  );
}
