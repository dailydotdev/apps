import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { DailyIcon, SparkleIcon } from '../icons';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagJoinStripProps {
  tag: string;
  onJoin: () => void;
  className?: string;
}

export const TagJoinStrip = ({
  tag,
  onJoin,
  className,
}: TagJoinStripProps): ReactElement => (
  <section
    className={classNames(
      'border-accent-cabbage-default/30 shadow-1 relative mx-4 mb-6 overflow-hidden rounded-24 border bg-surface-primary p-4 laptop:mx-4 laptop:p-5',
      className,
    )}
  >
    <div className="bg-accent-cabbage-default/20 pointer-events-none absolute -right-12 -top-16 size-48 rounded-full blur-3xl" />
    <div className="relative flex flex-col gap-4 laptop:flex-row laptop:items-center laptop:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-16 bg-accent-cabbage-subtlest text-accent-cabbage-default">
          <DailyIcon size={IconSize.Small} />
        </span>
        <div className="min-w-0">
          <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
            Make #{tag} your daily brief
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Follow the topic, train your feed, and join the developer
            conversation around it.
          </Typography>
        </div>
      </div>
      <Button
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Medium}
        icon={<SparkleIcon />}
        onClick={onJoin}
        className="w-full laptop:w-auto"
      >
        Build my #{tag} feed
      </Button>
    </div>
  </section>
);
