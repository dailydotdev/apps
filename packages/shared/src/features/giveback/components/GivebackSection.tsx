import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol } from '../../../components/utilities/common';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface GivebackSectionProps {
  id?: string;
  // Optional plain sub-heading. The big gradient tab headline lives separately.
  title?: string;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

// Open, editorial section shell for the onboarded tabs: sections are separated
// by spacing alone, each carrying a small plain header.
export const GivebackSection = ({
  id,
  title,
  description,
  className,
  children,
}: GivebackSectionProps): ReactElement => (
  <section
    id={id}
    className={classNames('relative w-full scroll-mt-16', className)}
  >
    <FlexCol className="gap-6">
      {(title || description) && (
        <FlexCol className="gap-1.5">
          {title && (
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Title3}
              bold
              className="[text-wrap:balance]"
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography
              tag={TypographyTag.P}
              type={TypographyType.Callout}
              color={TypographyColor.Secondary}
              className="[text-wrap:pretty]"
            >
              {description}
            </Typography>
          )}
        </FlexCol>
      )}
      {children}
    </FlexCol>
  </section>
);
