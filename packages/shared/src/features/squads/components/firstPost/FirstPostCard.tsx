import type { FormEvent, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import { LinkIcon, MagicIcon } from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';

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
  /** Opens the composer on Share a link with this link */
  onShare: (url: string) => void;
  onOpenIntel?: () => void;
  /** The intel that helps them pick what to write, shown on "Find a topic" */
  intel?: ReactNode;
  isIntelOpen?: boolean;
  className?: string;
}

const cabbageGlow =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 160px)';

const Path = ({
  icon,
  title,
  hint,
  isSelected,
  children,
}: {
  icon: ReactElement;
  title: string;
  hint: string;
  isSelected?: boolean;
  children: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-3 rounded-12 border bg-background-default p-4',
      isSelected
        ? 'border-accent-cabbage-default'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <div className="flex items-start gap-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default">
        {React.cloneElement(icon, { size: IconSize.Medium })}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-callout">{title}</span>
        <span className="text-pretty text-text-tertiary typo-footnote">
          {hint}
        </span>
      </span>
    </div>
    <div className="mt-auto">{children}</div>
  </div>
);

const ShareForm = ({
  onShare,
}: {
  onShare: (url: string) => void;
}): ReactElement => {
  const [url, setUrl] = useState('');
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (url.trim()) {
      onShare(url.trim());
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="url"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        placeholder="https://"
        aria-label="Link to your content"
        className="h-8 min-w-0 flex-1 rounded-10 bg-surface-float px-3 text-text-primary typo-footnote placeholder:text-text-quaternary focus:outline-none focus:ring-1 focus:ring-border-subtlest-secondary"
      />
      <Button
        type="submit"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        disabled={!url.trim()}
      >
        Share
      </Button>
    </form>
  );
};

/**
 * The one thing a company page's admins should do before anything else:
 * get the first post out. They either share something they already
 * published, or find a topic in the weekly intel and write something new.
 */
export const FirstPostCard = ({
  boostDollars,
  missingForBoost = [],
  onShare,
  onOpenIntel,
  intel,
  isIntelOpen: initialIntelOpen = false,
  className,
}: FirstPostCardProps): ReactElement => {
  const [isIntelOpen, setIntelOpen] = useState(initialIntelOpen);

  return (
    <section
      className={classNames(
        'flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary p-4 tablet:p-5',
        className,
      )}
      style={{ background: cabbageGlow }}
    >
      <div className="flex flex-col gap-1">
        <h2 className="font-bold typo-title2">
          {boostDollars
            ? `Get your first post out. We'll boost it with $${boostDollars}.`
            : 'Get your first post out'}
        </h2>
        <p className="text-text-secondary typo-callout">
          {boostDollars
            ? 'It goes out to thousands of developers in the US, Europe and other top markets on the day you post.'
            : 'Developers find your page through your posts.'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
        <Path
          icon={<LinkIcon />}
          title="Share your best content"
          hint="A blog post, video, release notes or docs page developers would learn from."
        >
          <ShareForm onShare={onShare} />
        </Path>
        <Path
          icon={<MagicIcon />}
          title="Create something new"
          hint="See what developers in your space read last week, and pick a topic."
          isSelected={isIntelOpen}
        >
          <Button
            type="button"
            variant={isIntelOpen ? ButtonVariant.Float : ButtonVariant.Primary}
            size={ButtonSize.Small}
            aria-expanded={isIntelOpen}
            onClick={() => {
              if (!isIntelOpen) {
                onOpenIntel?.();
              }

              setIntelOpen(!isIntelOpen);
            }}
          >
            {isIntelOpen ? 'Hide the intel' : 'Find a topic'}
          </Button>
        </Path>
      </div>
      {isIntelOpen && intel}
      {!!boostDollars && !!missingForBoost.length && (
        <p className="text-text-tertiary typo-footnote">
          Your boost starts once your page has{' '}
          {missingForBoost.map((step, index) => (
            <React.Fragment key={step.id}>
              {index > 0 &&
                (index === missingForBoost.length - 1 ? ' and ' : ', ')}
              <a href={step.href} className="text-text-link hover:underline">
                {step.title}
              </a>
            </React.Fragment>
          ))}
          . You can post before that.
        </p>
      )}
    </section>
  );
};
