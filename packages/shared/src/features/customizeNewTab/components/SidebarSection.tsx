import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';

interface SidebarSectionProps {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
  /**
   * Drop the divider above this section. Useful when stacking two related
   * blocks (e.g. mode picker + layout) that should read as one cluster.
   */
  noTopBorder?: boolean;
}

export const SidebarSection = ({
  title,
  description,
  children,
  className,
  bodyClassName,
  noTopBorder,
}: SidebarSectionProps): ReactElement => {
  return (
    <section
      className={classNames(
        'flex w-full min-w-0 flex-col gap-2.5 px-5 py-4',
        noTopBorder
          ? 'pt-2'
          : 'border-b border-border-subtlest-tertiary last:border-b-0',
        className,
      )}
    >
      {(title || description) && (
        <header className="flex min-w-0 flex-col gap-0.5">
          {title && (
            <Typography
              tag={TypographyTag.H3}
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              bold
              className="uppercase tracking-wider"
            >
              {title}
            </Typography>
          )}
          {description && (
            <Typography
              type={TypographyType.Caption1}
              color={TypographyColor.Quaternary}
              className="break-words"
            >
              {description}
            </Typography>
          )}
        </header>
      )}
      <div className={classNames('flex flex-col gap-1', bodyClassName)}>
        {children}
      </div>
    </section>
  );
};
