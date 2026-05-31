import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { Button, ButtonSize, ButtonVariant } from '../buttons/Button';
import { IconSize } from '../Icon';
import { DailyIcon, DiscussIcon, HashtagIcon, SparkleIcon } from '../icons';
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
      'border-accent-cabbage-default/30 relative mx-4 mb-6 overflow-hidden rounded-24 border bg-background-default p-3 shadow-2 laptop:mx-4',
      className,
    )}
  >
    <div className="bg-accent-cabbage-default/25 pointer-events-none absolute -right-12 -top-16 size-56 rounded-full blur-3xl" />
    <div className="bg-accent-onion-default/15 pointer-events-none absolute -bottom-20 left-16 size-52 rounded-full blur-3xl" />
    <div className="relative grid gap-3 rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-5 laptop:grid-cols-[minmax(0,1fr)_18rem] laptop:p-6">
      <div className="min-w-0">
        <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent-cabbage-subtlest px-3 py-1 font-bold text-accent-cabbage-default typo-caption1">
          <DailyIcon size={IconSize.Size16} />
          Aha moment
        </span>
        <Typography
          tag={TypographyTag.H2}
          type={TypographyType.Mega3}
          bold
          className="mt-4"
        >
          Stop browsing #{tag}. Make it yours.
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
          className="mt-3 max-w-[42rem]"
        >
          The directory gives you the map. A daily.dev account turns it into a
          living feed tuned by what you read, save, upvote, and discuss.
        </Typography>
        <div className="mt-5 grid gap-2 tablet:grid-cols-3">
          {[
            {
              icon: <HashtagIcon size={IconSize.Size16} />,
              title: 'Seed',
              description: `Start with #${tag}`,
            },
            {
              icon: <SparkleIcon size={IconSize.Size16} />,
              title: 'Train',
              description: 'Save what matters',
            },
            {
              icon: <DiscussIcon size={IconSize.Size16} />,
              title: 'Join',
              description: 'Discuss with developers',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-3"
            >
              <span className="text-accent-cabbage-default">{item.icon}</span>
              <Typography type={TypographyType.Footnote} bold className="mt-2">
                {item.title}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {item.description}
              </Typography>
            </div>
          ))}
        </div>
      </div>
      <aside className="flex flex-col justify-between gap-4 rounded-20 bg-surface-float p-4">
        <div>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            First action
          </Typography>
          <Typography type={TypographyType.Title3} bold className="mt-2">
            Build a feed from this topic in one tap.
          </Typography>
        </div>
        <Button
          type="button"
          variant={ButtonVariant.Primary}
          size={ButtonSize.Medium}
          icon={<SparkleIcon />}
          onClick={onJoin}
          className="w-full"
        >
          Build my #{tag} feed
        </Button>
      </aside>
    </div>
  </section>
);
