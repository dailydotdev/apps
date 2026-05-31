import type { ReactElement } from 'react';
import React from 'react';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { TagFaqItem } from './tagContent';

interface TagFaqProps {
  tag: string;
  items: TagFaqItem[];
}

/**
 * Editorial FAQ — native <details> so answers stay in the DOM for crawlers and
 * answer engines (and stay in sync with the FAQPage JSON-LD), presented as a
 * clean Q&A column under a kicker rather than a boxed widget.
 */
export function TagFaq({ tag, items }: TagFaqProps): ReactElement | null {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="mx-4 flex flex-col gap-2">
      <span className="uppercase tracking-widest text-text-quaternary typo-caption1">
        {tag} FAQ
      </span>
      <div className="border-t border-border-subtlest-tertiary">
        {items.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group border-b border-border-subtlest-tertiary"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-bold typo-body [&::-webkit-details-marker]:hidden">
              {item.question}
              <ArrowIcon
                size={IconSize.Small}
                className="shrink-0 rotate-180 text-text-tertiary transition-transform group-open:rotate-0"
              />
            </summary>
            <p className="max-w-3xl pb-4 text-text-secondary typo-body">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
