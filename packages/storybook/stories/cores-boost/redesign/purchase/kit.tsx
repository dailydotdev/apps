import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { CoreIcon } from '@dailydotdev/shared/src/components/icons/Core';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { formatCoresCurrency } from '@dailydotdev/shared/src/lib/utils';

// The redesign's few shared pieces, in the squads hub's line: rounded-16
// bordered cards with Callout bold titles (SquadWidget), rows like the hero
// cover Reading list widget (title, caption meta, 48px visual on the side).

/** A SquadWidget-style section: bordered card, Callout bold title */
export const Card = ({
  title,
  action,
  children,
  className,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <section
    className={classNames(
      'flex w-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary p-4',
      className,
    )}
  >
    {(title || action) && (
      <div className="flex items-center justify-between gap-2">
        <Typography tag={TypographyTag.H3} type={TypographyType.Callout} bold>
          {title}
        </Typography>
        {action}
      </div>
    )}
    {children}
  </section>
);

/** A Reading list style row: title, caption meta, a visual on the side */
export const Row = ({
  title,
  meta,
  visual,
  trailing,
  className,
}: {
  title: ReactNode;
  meta?: ReactNode;
  visual?: ReactNode;
  trailing?: ReactNode;
  className?: string;
}): ReactElement => (
  <div className={classNames('flex items-center gap-3', className)}>
    {visual && <div className="flex shrink-0">{visual}</div>}
    <div className="flex min-w-0 flex-1 flex-col">
      <Typography type={TypographyType.Subhead} bold className="line-clamp-2">
        {title}
      </Typography>
      {meta && (
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {meta}
        </Typography>
      )}
    </div>
    {trailing}
  </div>
);

/** A Core amount with the Core mark, for chips and meta lines */
export const CoreAmount = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}): ReactElement => (
  <span className={classNames('inline-flex items-center gap-0.5', className)}>
    <CoreIcon size={IconSize.Size16} />
    {formatCoresCurrency(value)}
  </span>
);

/** The glowing Core badge that heads the status screens */
export const CoreHalo = ({ children }: { children?: ReactNode }) => (
  <div className="relative flex size-20 items-center justify-center rounded-full bg-action-cores-float">
    <div className="absolute inset-2 rounded-full bg-action-cores-float blur-md" />
    <CoreIcon size={IconSize.XXLarge} className="relative" />
    {children}
  </div>
);
