import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import { DiscussIcon, HashtagIcon, SparkleIcon, UpvoteIcon } from '../icons';
import { IconSize } from '../Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';

interface TagBestOfShowcaseProps {
  tag: string;
  topPosts: ReactNode;
  mostUpvoted: ReactNode;
  bestDiscussed: ReactNode;
  className?: string;
}

const SignalStep = ({
  index,
  title,
  description,
  icon,
  accentClassName,
}: {
  index: string;
  title: string;
  description: string;
  icon: ReactNode;
  accentClassName: string;
}): ReactElement => (
  <div className="relative overflow-hidden rounded-18 border border-border-subtlest-tertiary bg-surface-float p-4">
    <div
      className={classNames(
        'absolute -right-8 -top-8 size-24 rounded-full blur-2xl',
        accentClassName,
      )}
    />
    <div className="relative flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-14 bg-surface-primary text-text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <Typography
          tag={TypographyTag.Span}
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          bold
        >
          {index}
        </Typography>
        <Typography type={TypographyType.Callout} bold className="mt-1">
          {title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className="mt-1"
        >
          {description}
        </Typography>
      </div>
    </div>
  </div>
);

export const TagBestOfShowcase = ({
  tag,
  topPosts,
  mostUpvoted,
  bestDiscussed,
  className,
}: TagBestOfShowcaseProps): ReactElement => (
  <section
    id="best-posts"
    className={classNames(
      'mb-6 overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default p-3 shadow-2',
      className,
    )}
  >
    <div className="rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-5 laptop:p-6">
      <div className="grid gap-6 laptop:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-accent-cheese-subtlest px-3 py-1 font-bold text-accent-cheese-default typo-caption1">
              <SparkleIcon size={IconSize.Size16} />
              Signal board
            </span>
            <Typography
              tag={TypographyTag.H2}
              type={TypographyType.Mega3}
              bold
              className="mt-4"
            >
              The fastest way into #{tag}
            </Typography>
            <Typography
              type={TypographyType.Callout}
              color={TypographyColor.Tertiary}
              className="mt-3 max-w-[42rem]"
            >
              Three rails, three intents. Scan what is broadly useful, validate
              what the community trusts, then read where developers disagree.
            </Typography>
          </div>
          <div className="grid gap-3 tablet:grid-cols-3">
            <SignalStep
              index="01"
              title="Get oriented"
              description="The broadest signal for first-time visitors."
              icon={<HashtagIcon size={IconSize.Size16} />}
              accentClassName="bg-accent-cabbage-default/20"
            />
            <SignalStep
              index="02"
              title="Find consensus"
              description="Posts developers decided were worth saving."
              icon={<UpvoteIcon size={IconSize.Size16} />}
              accentClassName="bg-accent-avocado-default/20"
            />
            <SignalStep
              index="03"
              title="Read conflict"
              description="Threads where the community has something to say."
              icon={<DiscussIcon size={IconSize.Size16} />}
              accentClassName="bg-accent-blueCheese-default/20"
            />
          </div>
        </div>
        <aside className="rounded-20 border border-border-subtlest-tertiary bg-surface-float p-4">
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
            bold
          >
            Reader mode
          </Typography>
          <Typography type={TypographyType.Title3} bold className="mt-3">
            8 minute topic scan
          </Typography>
          <ol className="mt-4 flex flex-col gap-3">
            {[
              'Open two top posts.',
              'Save one upvoted piece.',
              'Join one discussion.',
              `Follow #${tag} when it earns a spot in your feed.`,
            ].map((item) => (
              <li
                key={item}
                className="flex gap-2 text-text-secondary typo-footnote"
              >
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent-cabbage-default" />
                {item}
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
    <div className="mt-3 flex flex-col rounded-24 border border-border-subtlest-tertiary bg-surface-primary py-5">
      <div id="top-posts">{topPosts}</div>
      <div id="upvoted-posts">{mostUpvoted}</div>
      <div id="discussed-posts">{bestDiscussed}</div>
    </div>
  </section>
);
