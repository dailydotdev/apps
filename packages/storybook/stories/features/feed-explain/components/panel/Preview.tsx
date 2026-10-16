import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SourceAvatar } from '@dailydotdev/shared/src/components/profile/source/SourceAvatar';
import { ProfileImageSize } from '@dailydotdev/shared/src/components/ProfilePicture';
import type { Decision } from '../../policy/rank';
import { Exclusion, getMainTopic } from '../../policy/rank';
import {
  exclusionLabel,
  getCategory,
  getCategoryDot,
  getFactorChips,
} from '../../policy/describe';
import { defaultParams } from '../../policy/params';
import { usePersonalization } from '../PersonalizationContext';
import { useFeedScreen } from '../FeedScreenContext';
import { Badge } from './Section';

const Movement = ({
  decision,
}: {
  decision: Decision;
}): ReactElement | null => {
  const { served } = usePersonalization();
  const before = served.find(({ post }) => post.id === decision.post.id);
  if (!before) {
    return (
      <Badge className="bg-accent-avocado-flat text-accent-avocado-default">
        New
      </Badge>
    );
  }
  const delta = (before.position ?? 0) - (decision.position ?? 0);
  if (!delta) {
    return null;
  }
  return (
    <span
      className={classNames(
        'flex shrink-0 items-center tabular-nums typo-caption1',
        delta > 0 ? 'text-accent-avocado-default' : 'text-accent-bun-default',
      )}
    >
      <ArrowIcon
        size={IconSize.Size16}
        className={delta > 0 ? undefined : 'rotate-180'}
      />
      {Math.abs(delta)}
    </span>
  );
};

const PostLine = ({
  decision,
  meta,
  aside,
  action,
}: {
  decision: Decision;
  meta: ReactNode;
  aside?: ReactNode;
  action?: ReactNode;
}): ReactElement => (
  <li className="flex items-start gap-3 py-2">
    <SourceAvatar
      source={decision.post.source}
      size={ProfileImageSize.Small}
      className="!mr-0 mt-0.5"
    />
    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
      <span className="line-clamp-2 font-bold text-text-primary typo-footnote">
        {decision.post.title}
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-text-tertiary typo-caption1">
        {meta}
      </span>
      {action}
    </span>
    {aside}
  </li>
);

export const NextPageList = ({ limit }: { limit?: number }): ReactElement => {
  const { next, served } = usePersonalization();
  const { onOpenDetails } = useFeedScreen();
  const servedIds = new Set(served.map(({ post }) => post.id));
  const incoming = next.served.filter(({ post }) => !servedIds.has(post.id));
  const decisions = limit ? next.served.slice(0, limit) : next.served;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-tertiary typo-footnote">
        {incoming.length
          ? `If you refreshed now, ${incoming.length} new ${
              incoming.length === 1 ? 'post comes' : 'posts come'
            } in.`
          : 'If you refreshed now, the same posts would show.'}
      </p>
      <ol className="flex flex-col divide-y divide-border-subtlest-tertiary">
        {decisions.map((decision) => {
          const chip = getFactorChips(decision)[0];
          return (
            <PostLine
              key={decision.post.id}
              decision={decision}
              meta={
                <>
                  <span className="tabular-nums text-text-quaternary">
                    #{decision.position}
                  </span>
                  <span
                    className={classNames(
                      'size-1.5 shrink-0 rounded-max',
                      getCategoryDot(getCategory(decision)),
                    )}
                  />
                  <span className="min-w-0 shrink truncate">{chip?.label}</span>
                  {onOpenDetails && (
                    <button
                      type="button"
                      className="shrink-0 text-text-link hover:underline"
                      onClick={() => onOpenDetails(decision)}
                    >
                      Why
                    </button>
                  )}
                </>
              }
              aside={<Movement decision={decision} />}
            />
          );
        })}
      </ol>
    </div>
  );
};

const exclusionOrder = [
  Exclusion.BelowThePage,
  Exclusion.NoInterestOrFollow,
  Exclusion.SideTopicUnproven,
  Exclusion.SideTopicsOff,
  Exclusion.BlockedTag,
  Exclusion.BlockedSource,
  Exclusion.BlockedAuthor,
  Exclusion.Hidden,
  Exclusion.ShownTooOften,
  Exclusion.TooOld,
];

const exclusionHelp: Partial<Record<Exclusion, string>> = {
  [Exclusion.BelowThePage]:
    'These could show, but other posts ranked higher, mostly newer ones or ones that mix up your page.',
  [Exclusion.NoInterestOrFollow]:
    'None of your topics, sources or people are in these.',
  [Exclusion.SideTopicUnproven]:
    "Your topic is only a side topic in these, and other readers haven't liked them enough yet.",
  [Exclusion.ShownTooOften]: 'On your screen too many times without a click.',
};

const LeftOutFix = ({
  decision,
}: {
  decision: Decision;
}): ReactElement | null => {
  const store = usePersonalization();
  const { post } = decision;
  const source = { id: post.source?.id ?? '', name: post.source?.name ?? '' };
  const mainTopic = getMainTopic(post);
  const link = (label: string, run: () => void) => (
    <button
      type="button"
      className="self-start font-bold text-text-link typo-caption1 hover:underline"
      onClick={run}
    >
      {label}
    </button>
  );

  switch (decision.exclusion) {
    case Exclusion.NoInterestOrFollow:
    case Exclusion.SideTopicUnproven:
      return mainTopic
        ? link(`Follow #${mainTopic}`, () =>
            store.setTagFollowed(mainTopic, true),
          )
        : null;
    case Exclusion.BlockedTag:
      return link(`Unblock #${decision.exclusionTag}`, () =>
        store.setTagBlocked(decision.exclusionTag ?? '', false),
      );
    case Exclusion.BlockedSource:
      return link(`Unblock ${source.name}`, () =>
        store.setSourceBlocked(source, false),
      );
    case Exclusion.Hidden:
      return link('Show it again', () => store.setHidden(post.id, false));
    case Exclusion.SideTopicsOff:
      return link('Turn side topics back on', () =>
        store.setParam(
          'relevance.side_topic_weight',
          defaultParams['relevance.side_topic_weight'],
        ),
      );
    default:
      return null;
  }
};

const LeftOutGroup = ({
  exclusion,
  decisions,
}: {
  exclusion: Exclusion;
  decisions: Decision[];
}): ReactElement => {
  const store = usePersonalization();
  const [isOpen, setIsOpen] = useState(exclusion !== Exclusion.BelowThePage);
  const shown = isOpen ? decisions.slice(0, 6) : [];

  return (
    <li className="flex flex-col">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-3 py-2 text-left"
      >
        <span className="flex min-w-0 shrink flex-col gap-0.5">
          <span className="font-bold text-text-primary typo-callout">
            {exclusionLabel[exclusion]}
          </span>
          {exclusionHelp[exclusion] && (
            <span className="text-text-tertiary typo-caption1">
              {exclusionHelp[exclusion]}
            </span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1 tabular-nums text-text-tertiary typo-footnote">
          {decisions.length}
          <ArrowIcon
            size={IconSize.Size16}
            className={classNames(
              'transition-transform',
              isOpen ? 'rotate-0' : 'rotate-180',
            )}
          />
        </span>
      </button>
      {isOpen && (
        <ul className="flex flex-col pb-2">
          {shown.map((decision) => (
            <PostLine
              key={decision.post.id}
              decision={decision}
              meta={
                <span className="min-w-0 shrink truncate">
                  {exclusion === Exclusion.BelowThePage
                    ? `Ranked #${decision.eligibleRank} overall`
                    : (decision.post.tags ?? [])
                        .slice(0, 3)
                        .map((tag) => `#${tag}`)
                        .join(' ')}
                </span>
              }
              action={<LeftOutFix decision={decision} />}
            />
          ))}
          {decisions.length > shown.length && (
            <li className="py-1 text-text-quaternary typo-caption1">
              And {decisions.length - shown.length} more
            </li>
          )}
          {exclusion === Exclusion.ShownTooOften && (
            <li>
              <Button
                type="button"
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                onClick={store.clearSeen}
              >
                Forget what I scrolled past
              </Button>
            </li>
          )}
        </ul>
      )}
    </li>
  );
};

export const LeftOutList = (): ReactElement => {
  const { next } = usePersonalization();
  const groups = exclusionOrder
    .map((exclusion) => ({
      exclusion,
      decisions: next.leftOut.filter(
        (decision) => decision.exclusion === exclusion,
      ),
    }))
    .filter(({ decisions }) => decisions.length);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-text-tertiary typo-footnote">
        {next.leftOut.length} posts didn&apos;t make your next page. Each group
        says why.
      </p>
      <ul className="flex flex-col divide-y divide-border-subtlest-tertiary">
        {groups.map(({ exclusion, decisions }) => (
          <LeftOutGroup
            key={exclusion}
            exclusion={exclusion}
            decisions={decisions}
          />
        ))}
      </ul>
    </div>
  );
};
