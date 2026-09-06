import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { EntitySectionHeading } from '@dailydotdev/shared/src/components/entity/EntitySectionHeading';

interface ToolSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}

export const ToolSection = ({
  title,
  action,
  children,
  id,
}: ToolSectionProps): ReactElement => (
  <section id={id} className="flex scroll-mt-16 flex-col gap-4 py-8">
    <div className="flex items-center gap-3">
      <EntitySectionHeading className="!mb-0 !mt-0">
        {title}
      </EntitySectionHeading>
      <div className="h-px flex-1 bg-border-subtlest-tertiary" />
      {action}
    </div>
    {children}
  </section>
);
