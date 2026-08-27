import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { EntitySectionHeading } from '@dailydotdev/shared/src/components/entity/EntitySectionHeading';

interface ToolSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}

// Flat section block used across the tools pages: a heading (plus an optional
// trailing action) above its content, with the divider coming from the parent
// `divide-y` stack rather than a card border.
export const ToolSection = ({
  title,
  action,
  children,
  id,
}: ToolSectionProps): ReactElement => (
  <section id={id} className="flex scroll-mt-16 flex-col gap-4 py-8">
    <div className="flex items-center justify-between gap-2">
      <EntitySectionHeading className="!mb-0 !mt-0">
        {title}
      </EntitySectionHeading>
      {action}
    </div>
    {children}
  </section>
);
