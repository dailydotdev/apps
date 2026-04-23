import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface SidebarSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const SidebarSection = ({
  title,
  description,
  children,
}: SidebarSectionProps): ReactElement => {
  return (
    <section className="flex flex-col gap-3 border-b border-border-subtlest-tertiary px-5 py-5 last:border-b-0">
      <header className="flex flex-col gap-0.5">
        <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
          {title}
        </Typography>
        {description && (
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
          >
            {description}
          </Typography>
        )}
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
};
