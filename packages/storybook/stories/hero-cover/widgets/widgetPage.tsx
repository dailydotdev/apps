import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Case, Page } from '../parts';
import type { WidgetKind, WidgetSize } from './catalog';
import { WidgetContent, widgetCatalog } from './catalog';
import { isCardWidget } from './production';
import { StateRow } from './review';

const sizeOrder: WidgetSize[] = ['s', 'm', 'l'];

/**
 * One widget's review page: the widget at every size it comes in, then any
 * variants and use cases it has, so it can be signed off in one place.
 */
export const WidgetPage = ({
  kinds,
  title,
  metric = 'Clicks per impression, and the share of readers who keep it on their rail after 30 days.',
  children,
}: {
  /** One kind, or the kinds that are variants of the same widget. */
  kinds: { kind: WidgetKind; label?: string; note?: string }[];
  title?: string;
  metric?: string;
  /** Extra state rows: variants and use cases beyond the sizes. */
  children?: ReactNode;
}): ReactElement => {
  const lead = widgetCatalog[kinds[0].kind];
  return (
    <Page
      chapter="Widgets"
      question={`How does ${title ?? lead.name} look at every size?`}
      title={title ?? lead.name}
      goal={lead.description}
      metric={metric}
    >
      <Case title="Every size, every use case">
        <div className="flex flex-col gap-8">
          {kinds.map(({ kind, label, note }) => (
            <StateRow
              key={kind}
              title={label ?? 'Every size'}
              note={note}
              sizes={sizeOrder.filter((size) =>
                widgetCatalog[kind].sizes.includes(size),
              )}
              isBare={(size) => isCardWidget(kind, size)}
              render={(size) => <WidgetContent kind={kind} size={size} />}
            />
          ))}
          {children}
        </div>
      </Case>
    </Page>
  );
};
