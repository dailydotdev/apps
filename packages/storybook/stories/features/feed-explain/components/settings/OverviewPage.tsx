import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import type { ParamKey } from '../../policy/params';
import { defaultParams, ParamGroup, paramGroups } from '../../policy/params';
import { InterestOrigin } from '../../policy/profile';
import { formatBoost } from '../../policy/describe';
import { usePersonalization } from '../PersonalizationContext';
import { ControlSection } from '../FeedScreenContext';
import { ToggleRow } from '../controls';
import { Badge, PanelCard, PanelSection } from '../panel/Section';
import { LeftOutList, NextPageList } from '../panel/Preview';
import { ResetSection } from '../panel/ResetSection';
import { AgentSetupButton } from '../panel/AgentSetup';
import { FeedSettingsPage, plural } from './pages';

const rankingGroups = paramGroups
  .filter(({ group }) =>
    [ParamGroup.Freshness, ParamGroup.Variety, ParamGroup.Repeats].includes(
      group,
    ),
  )
  .map(({ title }) => title);

const SummaryCard = ({
  title,
  summary,
  children,
  onOpen,
}: {
  title: string;
  summary: string;
  children?: ReactNode;
  onOpen: () => void;
}): ReactElement => (
  <li>
    <button
      type="button"
      onClick={onOpen}
      className="flex size-full flex-col gap-3 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4 text-left hover:border-border-subtlest-secondary"
    >
      <span className="flex w-full items-center gap-2">
        <span className="min-w-0 flex-1 font-bold text-text-primary typo-body">
          {title}
        </span>
        <ArrowIcon
          size={IconSize.Size16}
          className="shrink-0 rotate-90 text-text-tertiary"
        />
      </span>
      <span className="text-text-tertiary typo-footnote">{summary}</span>
      {children}
    </button>
  </li>
);

const Pills = ({ items }: { items: string[] }): ReactElement | null =>
  items.length ? (
    <span className="flex flex-wrap gap-1">
      {items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </span>
  ) : null;

/** The first Feed settings page: what shapes For You, at a glance. */
export const OverviewPage = ({
  onNavigate,
}: {
  onNavigate: (page: FeedSettingsPage) => void;
}): ReactElement => {
  const store = usePersonalization();
  const { state, next, pool } = store;
  const followedTopics = next.interests.filter(
    ({ origin }) => origin === InterestOrigin.Declared,
  ).length;
  const learnedTopics = next.interests.length - followedTopics;
  const topTopics = [...next.interests]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6)
    .map(({ tag, weight }) => `#${tag} ${formatBoost(weight)}`);
  const sourceNames = state.followedSources.map(
    (id) => pool.find(({ source }) => source?.id === id)?.source?.name ?? id,
  );
  const follows = [
    state.followedSources.length &&
      plural(state.followedSources.length, 'source', 'sources'),
    state.followedAuthors.length &&
      plural(state.followedAuthors.length, 'person', 'people'),
  ].filter(Boolean);
  const changedSettings =
    (Object.keys(state.params) as ParamKey[]).filter(
      (key) => state.params[key] !== defaultParams[key],
    ).length + (state.isFillingWithPopular ? 0 : 1);
  const blocked =
    state.blockedTags.length +
    state.blockedSources.length +
    state.blockedAuthors.length;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <p className="text-text-secondary typo-callout">
          Everything that shapes your For You feed, and how much each thing
          counts. Change anything here and your feed follows.
        </p>
        <PanelCard className="flex flex-col gap-4 p-4">
          <ToggleRow
            id="overview-learning"
            label="Learn from my reading"
            description="Topics you read about count, even ones you don't follow. Turn it off and only your follows count."
            checked={state.isLearning}
            onToggle={() => store.setLearning(!state.isLearning)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtlest-tertiary pt-4">
            <span className="flex min-w-0 flex-[1_1_16rem] flex-col gap-0.5">
              <span className="font-bold text-text-primary typo-callout">
                Let your AI agent do it
              </span>
              <span className="text-text-tertiary typo-footnote">
                Tell it what you want from your feed and it changes these
                settings for you.
              </span>
            </span>
            <AgentSetupButton />
          </div>
        </PanelCard>
      </div>
      <ul className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
        <SummaryCard
          title="Topics"
          summary={`${plural(
            followedTopics,
            'topic you follow',
            'topics you follow',
          )}, ${learnedTopics} from your reading.`}
          onOpen={() => onNavigate(FeedSettingsPage.Topics)}
        >
          <Pills items={topTopics} />
        </SummaryCard>
        <SummaryCard
          title="Sources and people"
          summary={
            follows.length
              ? `${follows.join(' and ')} you follow.`
              : "You don't follow any sources or people yet."
          }
          onOpen={() => onNavigate(FeedSettingsPage.Sources)}
        >
          <Pills items={sourceNames.slice(0, 4)} />
        </SummaryCard>
        <SummaryCard
          title="Ranking"
          summary={
            changedSettings
              ? `${plural(
                  changedSettings,
                  'setting changed',
                  'settings changed',
                )} from the default.`
              : 'Every setting is at its default.'
          }
          onOpen={() => onNavigate(FeedSettingsPage.Ranking)}
        >
          <Pills items={rankingGroups} />
        </SummaryCard>
        <SummaryCard
          title="Filters"
          summary={
            blocked
              ? `${plural(
                  blocked,
                  'topic, source or person',
                  'topics, sources or people',
                )} blocked.`
              : 'Nothing blocked yet.'
          }
          onOpen={() => onNavigate(FeedSettingsPage.Filters)}
        >
          <Pills items={['Content types', 'Words in titles']} />
        </SummaryCard>
      </ul>
      <PanelSection
        section={ControlSection.LeftOut}
        title="Your next page"
        description="What For You would show if you refreshed now, and what didn't make it."
      >
        <NextPageList limit={8} />
        <LeftOutList />
      </PanelSection>
      <ResetSection />
    </div>
  );
};
