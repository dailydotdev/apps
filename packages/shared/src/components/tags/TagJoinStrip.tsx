import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { SparkleIcon } from '../icons';
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
      'border-accent-cabbage-default/30 flex flex-col items-start gap-5 rounded-16 border bg-accent-cabbage-subtlest p-6 laptop:flex-row laptop:items-center laptop:justify-between laptop:p-8',
      className,
    )}
  >
    <div className="min-w-0">
      <Typography tag={TypographyTag.H2} type={TypographyType.Title1} bold>
        Stop browsing #{tag}. Make it yours.
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
        className="mt-2 max-w-[44rem]"
      >
        This page is the map. A free daily.dev account turns it into a living
        feed tuned by what you read, save, upvote, and discuss.
      </Typography>
    </div>
    <Button
      type="button"
      variant={ButtonVariant.Primary}
      size={ButtonSize.Large}
      icon={<SparkleIcon />}
      onClick={onJoin}
      className="shrink-0"
    >
      Build my #{tag} feed
    </Button>
  </section>
);
