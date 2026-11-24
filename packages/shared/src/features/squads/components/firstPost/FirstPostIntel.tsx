import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  CopyIcon,
  DiscussIcon,
  UpvoteIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import { useCopyLink } from '../../../../hooks/useCopy';
import type {
  IntelCompetition,
  SquadIntelHighlights,
} from '../../../../graphql/squadIntel';
import { formatIntelIndex, getIntelWeekLabel } from '../../lib/intel';

interface FirstPostIntelProps {
  intel: SquadIntelHighlights;
  name: string;
  /** The prompt that starts the content skills, built on click */
  getAgentPrompt: () => string;
  /** Opens the composer about a topic */
  onWrite: (tag: string) => void;
  editTopicsUrl: string;
  upgradeUrl?: string;
  onUpgrade?: () => void;
  onCopyPrompt?: () => void;
}

const TOPICS_SHOWN = 6;
const FORMATS_SHOWN = 5;
const POSTS_SHOWN = 3;

const competitionLabel: Record<IntelCompetition, string> = {
  open: 'Open',
  moderate: 'Moderate',
  crowded: 'Crowded',
};

const competitionClassName: Record<IntelCompetition, string> = {
  open: 'bg-overlay-float-avocado text-accent-avocado-default',
  moderate: 'bg-overlay-float-cheese text-accent-cheese-default',
  crowded: 'bg-overlay-float-ketchup text-accent-ketchup-default',
};

const number = (value: number): string => value.toLocaleString('en-US');

const multiple = (value: number): string =>
  `${value >= 10 ? Math.round(value) : value.toFixed(1)}x`;

const Section = ({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-0.5">
      <h3 className="font-bold typo-callout">{title}</h3>
      {hint && <p className="text-text-tertiary typo-footnote">{hint}</p>}
    </div>
    {children}
  </div>
);

const Bar = ({
  percentage,
  isHighlighted,
}: {
  percentage: number;
  isHighlighted?: boolean;
}): ReactElement => (
  <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-8 bg-border-subtlest-tertiary">
    <div
      className={classNames(
        'h-full rounded-8',
        isHighlighted
          ? 'bg-accent-cabbage-default'
          : 'bg-accent-blueCheese-default',
      )}
      style={{ width: `${Math.max(percentage, 2)}%` }}
    />
  </div>
);

const Change = ({ value }: { value: number }): ReactElement => (
  <span
    className={classNames(
      'w-12 shrink-0 text-right tabular-nums typo-footnote',
      value > 0 && 'text-accent-avocado-default',
      value < 0 && 'text-accent-ketchup-default',
      value === 0 && 'text-text-tertiary',
    )}
  >
    {value > 0 && '+'}
    {value === 0 ? '0%' : `${value}%`}
  </span>
);

const AgentPrompt = ({
  getPrompt,
  onCopy,
}: {
  getPrompt: () => string;
  onCopy?: () => void;
}): ReactElement => {
  const [isCopying, copy] = useCopyLink(getPrompt);

  return (
    <div className="flex flex-col gap-3 rounded-12 border border-border-subtlest-tertiary p-3 tablet:flex-row tablet:items-center">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-bold typo-callout">
          Work on it with your agent
        </span>
        <span className="text-pretty text-text-tertiary typo-footnote">
          It reads this intel, then plans what you publish, suggests post ideas
          or checks a post you wrote. You write the post.
        </span>
      </span>
      <Button
        type="button"
        variant={ButtonVariant.Float}
        size={ButtonSize.Small}
        icon={<CopyIcon />}
        className="shrink-0 self-start tablet:self-auto"
        onClick={() => {
          copy();
          onCopy?.();
        }}
      >
        {isCopying ? 'Copied' : 'Copy prompt'}
      </Button>
    </div>
  );
};

/**
 * The page's weekly intel, cut down to what helps pick a first post: where
 * developers' attention went in its topics, the formats they read, and the
 * posts that did best, with the numbers they come from.
 */
export const FirstPostIntel = ({
  intel,
  name,
  getAgentPrompt,
  onWrite,
  editTopicsUrl,
  upgradeUrl,
  onUpgrade,
  onCopyPrompt,
}: FirstPostIntelProps): ReactElement => {
  const topics = intel.topics.slice(0, TOPICS_SHOWN);
  const maxShare = Math.max(...topics.map(({ share }) => share), 1);
  // The topic with the most reads per post that few new posts compete for
  const opening = [...topics]
    .filter(({ competition }) => competition !== 'crowded')
    .sort((a, b) => b.readsPerPost - a.readsPerPost)[0];
  const formats = [...intel.formats]
    .sort((a, b) => b.readsPerPost - a.readsPerPost)
    .slice(0, FORMATS_SHOWN);
  const maxFormat = Math.max(
    ...formats.map(({ readsPerPost }) => readsPerPost),
  );

  return (
    <div className="flex flex-col gap-6 rounded-12 border border-border-subtlest-tertiary bg-background-default p-4 tablet:p-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="font-bold typo-title3">
            Last week in {name}&apos;s topics
          </h2>
          <a
            href={editTopicsUrl}
            className="text-text-link typo-footnote hover:underline"
          >
            Edit topics
          </a>
        </div>
        <p className="text-text-tertiary typo-footnote">
          {`From ${number(intel.postsAnalyzed)} posts and every read by developers on daily.dev, ${getIntelWeekLabel(intel)}.`}
          {intel.trial &&
            ` We picked the topics from ${intel.trial.pickedFrom}.`}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {intel.topics.map(({ tag }) => (
            <span
              key={tag}
              className="rounded-8 bg-surface-float px-2 py-0.5 text-text-secondary typo-footnote"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <AgentPrompt getPrompt={getAgentPrompt} onCopy={onCopyPrompt} />

      <Section
        title="Where developers' attention went"
        hint="Share of the reads across your topics, and the change from the week before."
      >
        <ul className="flex flex-col gap-2.5">
          {topics.map((topic) => (
            <li key={topic.tag} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate typo-footnote tablet:w-32">
                #{topic.tag}
              </span>
              <Bar
                percentage={(topic.share / maxShare) * 100}
                isHighlighted={topic.tag === opening?.tag}
              />
              <span className="w-12 shrink-0 text-right font-bold tabular-nums typo-footnote">
                {topic.share}%
              </span>
              <Change value={topic.change} />
              <span
                className={classNames(
                  'hidden w-20 shrink-0 rounded-6 px-1.5 py-0.5 text-center font-bold typo-caption2 tablet:block',
                  competitionClassName[topic.competition],
                )}
              >
                {competitionLabel[topic.competition]}
              </span>
            </li>
          ))}
        </ul>
        {opening && (
          <div className="flex flex-col gap-3 rounded-12 bg-overlay-float-cabbage p-3 tablet:flex-row tablet:items-center">
            <p className="min-w-0 flex-1 typo-callout">
              <strong>{`#${opening.tag} is your opening.`}</strong>{' '}
              {`Posts there get ${formatIntelIndex(opening.readsPerPost)} the average reads, and few new posts compete for them.`}
            </p>
            <Button
              type="button"
              variant={ButtonVariant.Primary}
              size={ButtonSize.Small}
              className="shrink-0 self-start tablet:self-auto"
              onClick={() => onWrite(opening.tag)}
            >
              {`Write about #${opening.tag}`}
            </Button>
          </div>
        )}
      </Section>

      <Section
        title="What developers read most"
        hint="Reads per post by format, against the average post in your topics."
      >
        <ul className="flex flex-col gap-2.5">
          {formats.map((format, index) => (
            <li key={format.format} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate typo-footnote tablet:w-32">
                {format.format}
              </span>
              <Bar
                percentage={(format.readsPerPost / maxFormat) * 100}
                isHighlighted={index === 0}
              />
              <span className="w-12 shrink-0 text-right font-bold tabular-nums typo-footnote">
                {formatIntelIndex(format.readsPerPost)}
              </span>
              <span className="hidden w-20 shrink-0 text-right tabular-nums text-text-tertiary typo-caption1 tablet:block">
                {`${number(format.posts)} posts`}
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Top posts in your topics">
        <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
          {intel.topPosts.slice(0, POSTS_SHOWN).map((post) => (
            <li key={post.permalink}>
              <a
                href={post.permalink}
                className="flex flex-col gap-1 py-2.5 hover:text-text-primary"
              >
                <span className="line-clamp-2 font-bold typo-callout">
                  {post.title}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-text-tertiary typo-footnote">
                  <span>{post.source}</span>
                  <span className="font-bold text-accent-avocado-default">
                    {`${multiple(post.readsVsAverage)} the average reads`}
                  </span>
                  <span className="flex items-center gap-1">
                    <UpvoteIcon size={IconSize.Size16} />
                    {number(post.upvotes)}
                  </span>
                  <span className="flex items-center gap-1">
                    <DiscussIcon size={IconSize.Size16} />
                    {number(post.comments)}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {intel.trial && upgradeUrl && (
        <div className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-4 tablet:flex-row tablet:items-center">
          <p className="min-w-0 flex-1 text-text-secondary typo-footnote">
            {`This intel is picked for ${name} until ${new Date(
              intel.trial.endsAt,
            ).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              timeZone: 'UTC',
            })}. After that you get the general daily.dev trends. Keep it on your topics with the Startup plan.`}
          </p>
          <Button
            tag="a"
            href={upgradeUrl}
            onClick={onUpgrade}
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            className="shrink-0 self-start tablet:self-auto"
          >
            See the Startup plan
          </Button>
        </div>
      )}
    </div>
  );
};
