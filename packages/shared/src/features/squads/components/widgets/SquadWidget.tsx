import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';

interface SquadWidgetProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const SquadWidget = ({
  title,
  action,
  children,
  className,
}: SquadWidgetProps): ReactElement => (
  <section
    className={classNames(
      'flex w-full flex-col rounded-16 border border-border-subtlest-tertiary p-4',
      className,
    )}
  >
    <div className="flex items-center justify-between gap-2">
      <Typography tag={TypographyTag.H2} type={TypographyType.Callout} bold>
        {title}
      </Typography>
      {action}
    </div>
    {children}
  </section>
);
