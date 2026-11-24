import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  ArrowIcon,
  CopyIcon,
  EditIcon,
  LinkIcon,
  MagicIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useCopyLink } from '../../../../hooks/useCopy';

/** Something the page needs before its free boost can start */
export interface FirstPostBoostStep {
  id: string;
  title: string;
  href: string;
}

export interface FirstPostTrend {
  tag: string;
  /** Reads against a usual week: 2 means twice as many */
  multiple: number;
}

export interface FirstPostIdeas {
  /** This week's rising topics on daily.dev */
  trends?: FirstPostTrend[];
  /** The page's own weekly intel, on a paid plan */
  intelUrl?: string;
  /** Where the free page sees the Startup plan */
  upgradeUrl?: string;
  /** The prompt that asks their agent for ideas, built on click */
  getAgentPrompt: () => string;
}

export interface FirstPostCardProps {
  /** The free boost the first post gets, unset without one */
  boostDollars?: number;
  /** What the page still needs before that boost starts */
  missingForBoost?: FirstPostBoostStep[];
  ideas: FirstPostIdeas;
  /** Opens the composer on the page */
  onWrite: (starter?: string) => void;
  /** Opens the composer on Share a link */
  onShare: () => void;
  onOpenIdeas?: () => void;
  onUpgrade?: () => void;
  onCopyAgentPrompt?: () => void;
  isIdeasOpen?: boolean;
  className?: string;
}

export const firstPostStarters = [
  'A hard problem you solved, and how',
  'Numbers from your work: a benchmark, a cost, a before and after',
  'A decision you made, and why',
  'Something you shipped, and what you learned building it',
];

const cabbageGlow =
  'linear-gradient(180deg, color-mix(in srgb, var(--theme-accent-cabbage-default) 9%, transparent), transparent 160px)';

const Option = ({
  icon,
  title,
  hint,
  isSelected,
  onClick,
}: {
  icon: ReactElement;
  title: string;
  hint: string;
  isSelected?: boolean;
  onClick: () => void;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={isSelected}
    className={classNames(
      'flex items-center gap-3 rounded-12 border bg-background-default p-3 text-left hover:border-border-subtlest-secondary tablet:flex-col tablet:items-start tablet:p-4',
      isSelected
        ? 'border-accent-cabbage-default'
        : 'border-border-subtlest-tertiary',
    )}
  >
    <span className="flex size-10 shrink-0 items-center justify-center rounded-10 bg-overlay-float-cabbage text-accent-cabbage-default">
      {React.cloneElement(icon, { size: IconSize.Medium })}
    </span>
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="font-bold typo-callout">{title}</span>
      <span className="text-pretty text-text-tertiary typo-footnote">
        {hint}
      </span>
    </span>
  </button>
);

const PanelTitle = ({ children }: { children: ReactNode }): ReactElement => (
  <p className="font-bold text-text-tertiary typo-caption1">{children}</p>
);

const multiple = (value: number): string =>
  `${value.toFixed(1).replace(/\.0$/, '')}x`;

const IdeasPanel = ({
  ideas,
  onWrite,
  onUpgrade,
  onCopyAgentPrompt,
}: Pick<
  FirstPostCardProps,
  'ideas' | 'onWrite' | 'onUpgrade' | 'onCopyAgentPrompt'
>): ReactElement => {
  const [isCopying, copy] = useCopyLink(ideas.getAgentPrompt);

  return (
    <div className="flex flex-col gap-5 rounded-12 border border-border-subtlest-tertiary bg-background-default p-4">
      <div className="flex flex-col gap-1">
        <PanelTitle>Posts that do well here come from your own work</PanelTitle>
        <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
          {firstPostStarters.map((starter) => (
            <li key={starter}>
              <button
                type="button"
                onClick={() => onWrite(starter)}
                className="flex w-full items-center gap-3 py-2.5 text-left typo-callout hover:text-text-primary"
              >
                <span className="min-w-0 flex-1">{starter}</span>
                <ArrowIcon
                  size={IconSize.XSmall}
                  className="shrink-0 rotate-90 text-text-tertiary"
                />
              </button>
            </li>
          ))}
        </ul>
      </div>
      {!!ideas.trends?.length && (
        <div className="flex flex-col gap-2">
          <PanelTitle>Developers read more about these this week</PanelTitle>
          <div className="flex flex-wrap gap-2">
            {ideas.trends.map(({ tag, multiple: times }) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 rounded-10 bg-surface-float px-2.5 py-1 typo-footnote"
              >
                #{tag}
                <span className="font-bold text-accent-avocado-default">
                  {multiple(times)}
                </span>
              </span>
            ))}
          </div>
          {ideas.intelUrl && (
            <a
              href={ideas.intelUrl}
              className="text-text-link typo-footnote hover:underline"
            >
              See this week&apos;s intel for your topics
            </a>
          )}
          {!ideas.intelUrl && ideas.upgradeUrl && (
            <p className="text-text-tertiary typo-footnote">
              Want this for your own topics and readers? Weekly intel comes
              with the{' '}
              <a
                href={ideas.upgradeUrl}
                onClick={onUpgrade}
                className="text-text-link hover:underline"
              >
                Startup plan
              </a>
              .
            </p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-4 tablet:flex-row tablet:items-center tablet:gap-4">
        <p className="min-w-0 flex-1 text-text-tertiary typo-footnote">
          Prefer to brainstorm with your agent? Copy a prompt that suggests
          ideas from your recent work. You write the post.
        </p>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<CopyIcon />}
          className="shrink-0 self-start tablet:self-auto"
          onClick={() => {
            copy();
            onCopyAgentPrompt?.();
          }}
        >
          {isCopying ? 'Copied' : 'Copy prompt'}
        </Button>
      </div>
    </div>
  );
};

/**
 * The one thing a company page's admins should do before anything else:
 * write the first post. Three ways in: write an idea they have, share
 * something they published, or get help finding an idea.
 */
export const FirstPostCard = ({
  boostDollars,
  missingForBoost = [],
  ideas,
  onWrite,
  onShare,
  onOpenIdeas,
  onUpgrade,
  onCopyAgentPrompt,
  isIdeasOpen: initialIdeasOpen = false,
  className,
}: FirstPostCardProps): ReactElement => {
  const [isIdeasOpen, setIdeasOpen] = useState(initialIdeasOpen);

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
            ? `Write your first post. We'll boost it with $${boostDollars}.`
            : 'Write your first post'}
        </h2>
        <p className="text-text-secondary typo-callout">
          {boostDollars
            ? 'It goes out to thousands of developers in the US, Europe and other top markets on the day you post.'
            : 'Developers find your page through your posts. Share what you build, fix and learn.'}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-3">
        <Option
          icon={<EditIcon />}
          title="I have an idea"
          hint="Write it in your own words"
          onClick={() => onWrite()}
        />
        <Option
          icon={<LinkIcon />}
          title="I already published something"
          hint="Share a blog post, video or release notes"
          onClick={onShare}
        />
        <Option
          icon={<MagicIcon />}
          title="I need an idea"
          hint="See what developers read this week"
          isSelected={isIdeasOpen}
          onClick={() => {
            if (!isIdeasOpen) {
              onOpenIdeas?.();
            }

            setIdeasOpen(!isIdeasOpen);
          }}
        />
      </div>
      {isIdeasOpen && (
        <IdeasPanel
          ideas={ideas}
          onWrite={onWrite}
          onUpgrade={onUpgrade}
          onCopyAgentPrompt={onCopyAgentPrompt}
        />
      )}
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
