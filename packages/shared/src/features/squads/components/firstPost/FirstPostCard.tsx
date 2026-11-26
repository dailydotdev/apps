import type { FormEvent, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { EditIcon, MagicIcon, MoveToIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  startupsLavender,
  startupsLavenderTint,
  startupsLavenderWash,
} from '../../../../styles/custom';
import { StartupsFreeChip } from '../StartupsFreeChip';
import { StartupsReachChart } from '../StartupsReachChart';

/** Something the page needs before its free boost can start */
export interface FirstPostBoostStep {
  id: string;
  title: string;
  href: string;
}

export interface FirstPostCardProps {
  /** The free boost the first post gets, unset without one */
  boostDollars?: number;
  /** What the page still needs before that boost starts */
  missingForBoost?: FirstPostBoostStep[];
  /** Opens the composer on Share a link, with the link if they pasted one */
  onShare: (url?: string) => void;
  /** Opens the composer on a blank post */
  onWrite: () => void;
  /** Opens the intel that helps them pick what to write, unset without one */
  onOpenIntel?: () => void;
  /** Where a free page upgrades, unset on a plan */
  upgradeUrl?: string;
  onUpgrade?: () => void;
  className?: string;
}

const Path = ({
  icon,
  title,
  hint,
  children,
}: {
  icon: ReactElement;
  title: string;
  hint: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-4 rounded-16 bg-surface-float p-4 tablet:p-5">
    <div className="flex items-start gap-3">
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-12"
        style={{ background: startupsLavenderTint, color: startupsLavender }}
      >
        {React.cloneElement(icon, { size: IconSize.Small })}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="font-bold typo-callout">{title}</h3>
        <p className="text-pretty text-text-tertiary typo-footnote">{hint}</p>
      </div>
    </div>
    <div className="mt-auto">{children}</div>
  </div>
);

/** One control: the link and the button that shares it */
const ShareField = ({
  onShare,
}: {
  onShare: (url?: string) => void;
}): ReactElement => {
  const [url, setUrl] = useState('');
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onShare(url.trim() || undefined);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex h-10 items-center gap-1 rounded-12 bg-background-default pl-3 pr-1 focus-within:ring-1 focus-within:ring-border-subtlest-secondary"
    >
      <input
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://"
        aria-label="Link to your content"
        className="h-full min-w-0 flex-1 bg-transparent text-text-primary typo-callout placeholder:text-text-quaternary focus:outline-none"
      />
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
      >
        Share
      </Button>
    </form>
  );
};

/**
 * The one thing a company page's admins should do before anything else:
 * get the first post out. Two ways in, one button each: share something
 * they already published, or see what developers read and write something
 * new. The free boost comes after that choice, as what the post gets on top.
 */
export const FirstPostCard = ({
  boostDollars,
  missingForBoost = [],
  onShare,
  onWrite,
  onOpenIntel,
  upgradeUrl,
  onUpgrade,
  className,
}: FirstPostCardProps): ReactElement => (
  <section className={classNames('flex flex-col gap-4', className)}>
    <div className="flex flex-col gap-1">
      <h2 className="font-bold typo-title3">Write your first post</h2>
      <p className="text-text-secondary typo-callout">
        Developers find your page through your posts.
      </p>
    </div>
    <div className="relative grid grid-cols-1 gap-3 tablet:grid-cols-2">
      <span className="absolute left-1/2 top-1/2 z-1 hidden size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border-subtlest-tertiary bg-background-default text-text-tertiary typo-caption1 tablet:flex">
        or
      </span>
      <Path
        icon={<EditIcon />}
        title="Share your best content"
        hint="A story about something you built or broke, not a product announcement."
      >
        <ShareField onShare={onShare} />
      </Path>
      <Path
        icon={<MagicIcon />}
        title="Create something new"
        hint="See what developers in your space read last week, and pick a topic."
      >
        <Button
          type="button"
          variant={ButtonVariant.Subtle}
          className="w-full"
          onClick={onOpenIntel ?? onWrite}
        >
          {onOpenIntel ? 'Find a topic' : 'Write a post'}
        </Button>
      </Path>
    </div>
    {!!boostDollars && (
      <div
        className="flex flex-col gap-4 rounded-16 p-4 tablet:flex-row tablet:items-center tablet:p-5"
        style={{ background: startupsLavenderWash }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="flex flex-wrap items-center gap-2 font-bold typo-body">
            <StartupsFreeChip />
            {`$${boostDollars} boost on your first post`}
          </h3>
          <p className="text-pretty text-text-secondary typo-footnote">
            It goes out to thousands of developers in the US, Europe and other
            top markets on the day you post.
            {!!missingForBoost.length && (
              <>
                {' Your boost starts once your page has '}
                {missingForBoost.map((step, index) => (
                  <React.Fragment key={step.id}>
                    {index > 0 &&
                      (index === missingForBoost.length - 1 ? ' and ' : ', ')}
                    <a
                      href={step.href}
                      className="font-bold text-text-primary underline"
                    >
                      {step.title}
                    </a>
                  </React.Fragment>
                ))}
                . You can post before that.
              </>
            )}
          </p>
          {upgradeUrl && (
            <a
              href={upgradeUrl}
              onClick={onUpgrade}
              className="flex items-center gap-1 self-start font-bold text-text-primary typo-footnote hover:underline"
            >
              Upgrade to reach more developers every month
              <MoveToIcon size={IconSize.Size16} className="shrink-0" />
            </a>
          )}
        </div>
        <StartupsReachChart
          moreLabel="With the boost"
          lessLabel="Without"
          className="w-full shrink-0 tablet:w-44"
        />
      </div>
    )}
  </section>
);
