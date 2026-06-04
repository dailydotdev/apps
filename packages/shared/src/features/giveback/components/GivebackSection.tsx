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
  title: string;
  description?: ReactNode;
  headerActions?: ReactNode;
  /** First section skips the top hairline divider. */
  isFirst?: boolean;
  className?: string;
  children: ReactNode;
}

// Open, editorial section shell. Intentionally has no border box, background, or
// shadow — sections are separated by a single hairline and rhythmic spacing so
// the page reads as one continuous story instead of a stack of cards.
export const GivebackSection = ({
  id,
  eyebrow,
  title,
  description,
  headerActions,
  isFirst = false,
  className,
  children,
}: GivebackSectionProps): ReactElement => (
  <section
    id={id}
    className={classNames(
      'relative w-full scroll-mt-16',
      !isFirst && 'border-t border-border-subtlest-tertiary pt-8',
      className,
    )}
  >
    <FlexCol className="gap-6">
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
          <Typography tag={TypographyTag.H2} type={TypographyType.Title2} bold>
            {title}
          </Typography>
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
      {children}
    </FlexCol>
  </section>
);
