import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { FlexCol } from '../../../components/utilities';

export type SidebarSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export const SidebarSection = ({
  title,
  description,
  children,
  className,
}: SidebarSectionProps): ReactElement => (
  <section className={classNames('flex flex-col gap-3 px-4 py-4', className)}>
    <header className="flex flex-col gap-1">
      <Typography type={TypographyType.Callout} bold>
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
    <FlexCol className="gap-2">{children}</FlexCol>
  </section>
);
