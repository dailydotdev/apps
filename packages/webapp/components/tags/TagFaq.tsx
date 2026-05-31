import type { ReactElement } from 'react';
import React from 'react';
import { InfoIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TagFaqItem } from './tagContent';
import { TagSectionHeader } from './TagSectionHeader';

interface TagFaqProps {
  tag: string;
  items: TagFaqItem[];
}

/**
 * Visible, fully-rendered FAQ (no accordion) so every answer is in the DOM for
 * crawlers and answer engines. Pairs with the FAQPage JSON-LD emitted by the
 * page from the same source data.
 */
export function TagFaq({ tag, items }: TagFaqProps): ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex scroll-mt-16 flex-col gap-4">
      <TagSectionHeader
        icon={<InfoIcon size={IconSize.Medium} secondary />}
        title={`${tag} FAQ`}
        subtitle="Quick answers to the most common questions about this topic."
      />
      <div className="mx-4 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.question}
            className="flex flex-col gap-1 rounded-12 border border-border-subtlest-tertiary p-4"
          >
            <h3 className="font-bold typo-callout">{item.question}</h3>
            <p className="text-text-secondary typo-body">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
