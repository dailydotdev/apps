import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface GivebackSectionProps {
  id?: string;
  eyebrow?: string;
  // Optional plain sub-heading. The big gradient title lives once per tab.
  title?: string;
  description?: ReactNode;
  headerActions?: ReactNode;
  className?: string;
  children: ReactNode;
}

// Open, editorial section shell. No border box, background, or top divider —
// sections within a tab are separated by spacing alone.
export const GivebackSection = ({
  id,
  eyebrow,
  title,
  description,
  headerActions,
  className,
  children,
}: GivebackSectionProps): ReactElement => {
  const hasHeader = Boolean(eyebrow || title || description || headerActions);

  return (
    <section
      id={id}
      className={classNames('relative w-full scroll-mt-16', className)}
    >
      <FlexCol className="gap-6">
        {hasHeader && (
          <FlexRow className="flex-wrap items-start justify-between gap-4">
            <FlexCol className="max-w-2xl gap-1.5">
              {eyebrow && (
                <Typography
                  tag={TypographyTag.Span}
                  type={TypographyType.Caption1}
                  color={TypographyColor.Tertiary}
                  bold
                  className="uppercase tracking-wider"
                >
                  {eyebrow}
                </Typography>
              )}
              {title && (
                <Typography
                  tag={TypographyTag.H3}
                  type={TypographyType.Title3}
                  bold
                >
                  {title}
                </Typography>
              )}
              {description && (
                <Typography
                  tag={TypographyTag.P}
                  type={TypographyType.Callout}
                  color={TypographyColor.Secondary}
                >
                  {description}
                </Typography>
              )}
            </FlexCol>
            {headerActions}
          </FlexRow>
        )}
        {children}
      </FlexCol>
    </section>
  );
};
