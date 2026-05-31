import type { ReactElement } from 'react';
import React from 'react';
import { InfoIcon, ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TagFaqItem } from './tagContent';
import { TagModule } from './TagModule';

interface TagFaqProps {
  tag: string;
  items: TagFaqItem[];
}

/**
 * FAQ as native <details> elements: collapsible for a compact UI, but every
 * answer stays in the DOM so crawlers and answer engines (and the FAQPage
 * JSON-LD) see the full content. The first item starts open.
 */
export function TagFaq({ tag, items }: TagFaqProps): ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <TagModule
      title={`${tag} FAQ`}
      icon={<InfoIcon size={IconSize.Small} secondary />}
      flushBody
    >
      {items.map((item, index) => (
        <details
          key={item.question}
          open={index === 0}
          className="group border-b border-border-subtlest-tertiary last:border-b-0"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold typo-callout [&::-webkit-details-marker]:hidden">
            {item.question}
            <ArrowIcon
              size={IconSize.Small}
              className="shrink-0 rotate-180 text-text-tertiary transition-transform group-open:rotate-0"
            />
          </summary>
          <p className="px-4 pb-3 text-text-secondary typo-body">
            {item.answer}
          </p>
        </details>
      ))}
    </TagModule>
  );
}
