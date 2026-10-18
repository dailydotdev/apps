import type { ReactElement } from 'react';
import React from 'react';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { Switch } from '@dailydotdev/shared/src/components/fields/Switch';
import { PlusUser } from '@dailydotdev/shared/src/components/PlusUser';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { usePlusSubscription } from '@dailydotdev/shared/src/hooks/usePlusSubscription';
import type { ParamKey } from '../../policy/params';
import { defaultParams } from '../../policy/params';
import { InterestOrigin } from '../../policy/profile';
import { usePersonalization } from '../PersonalizationContext';
import { ResetSection } from '../panel/ResetSection';
import { AgentSetupButton } from '../panel/AgentSetup';
import { FeedSettingsPage, plural } from './pages';
import { SettingDivider, SettingHeader } from './common';

const SummaryRow = ({
  title,
  summary,
  isPlusOnly,
  onOpen,
}: {
  title: string;
  summary: string;
  isPlusOnly?: boolean;
  onOpen: () => void;
}): ReactElement => (
  <li>
    <button
      type="button"
      onClick={onOpen}
      className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-12 px-3 py-3 text-left hover:bg-surface-hover"
    >
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-2">
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
          {isPlusOnly && <PlusUser />}
        </span>
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {summary}
        </Typography>
      </span>
      <ArrowIcon
        size={IconSize.Size16}
        className="shrink-0 rotate-90 text-text-tertiary"
      />
    </button>
  </li>
);

/** The first Feed settings page: what shapes For You, at a glance. */
export const OverviewPage = ({
  onNavigate,
}: {
  onNavigate: (page: FeedSettingsPage) => void;
}): ReactElement => {
  const store = usePersonalization();
  const { state, next } = store;
  const { isPlus } = usePlusSubscription();
  const followedTopics = next.interests.filter(
    ({ origin }) => origin === InterestOrigin.Declared,
  ).length;
  const learnedTopics = next.interests.length - followedTopics;
  const strongest = [...next.interests]
    .filter(({ weight }) => weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .map(({ tag }) => `#${tag}`);
  const follows = [
    state.followedSources.length &&
      plural(state.followedSources.length, 'source', 'sources'),
    state.followedAuthors.length &&
      plural(state.followedAuthors.length, 'person', 'people'),
  ].filter(Boolean);
  const changedSettings = (Object.keys(state.params) as ParamKey[]).filter(
    (key) => state.params[key] !== defaultParams[key],
  ).length;
  const blocked =
    state.blockedTags.length +
    state.blockedSources.length +
    state.blockedAuthors.length;
  const topics = `${followedTopics} you follow, ${learnedTopics} from your reading.`;

  return (
    <>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Everything that shapes your For You feed, and how much each thing
        counts. Change anything here and your feed follows.
      </Typography>
      <div className="flex flex-col gap-4">
        <SettingHeader title="Connect your AI agent">
          Tell it what you want from your feed and it changes these settings for
          you.
        </SettingHeader>
        <AgentSetupButton />
      </div>
      <SettingDivider />
      <div className="flex flex-col gap-4">
        <SettingHeader title="Learn from your reading">
          Topics you read about count, even ones you don&apos;t follow. Turn it
          off and only your follows count.
        </SettingHeader>
        <Switch
          inputId="overview-learning"
          name="overview-learning"
          compact={false}
          checked={state.isLearning}
          onToggle={() => store.setLearning(!state.isLearning)}
        >
          Learn from my reading
        </Switch>
      </div>
      <SettingDivider />
      <div className="flex flex-col gap-4">
        <SettingHeader title="Popular posts">
          When your topics and follows don&apos;t find enough posts for a page,
          popular posts fill the rest. Turn it off and a short feed stays short.
        </SettingHeader>
        <Switch
          inputId="overview-filling"
          name="overview-filling"
          compact={false}
          checked={state.isFillingWithPopular}
          onToggle={() => store.setFilling(!state.isFillingWithPopular)}
        >
          Fill a short feed with popular posts
        </Switch>
      </div>
      <SettingDivider />
      <div className="flex flex-col gap-2">
        <SettingHeader title="What shapes your feed">
          What For You uses right now. Open one to change it.
        </SettingHeader>
        <ul className="flex flex-col">
          <SummaryRow
            title="Topics"
            summary={
              strongest.length
                ? `${topics} Strongest: ${strongest.join(', ')}.`
                : topics
            }
            onOpen={() => onNavigate(FeedSettingsPage.Topics)}
          />
          <SummaryRow
            title="Sources and people"
            summary={
              follows.length
                ? `${follows.join(' and ')} you follow.`
                : "You don't follow any sources or people yet."
            }
            onOpen={() => onNavigate(FeedSettingsPage.Sources)}
          />
          <SummaryRow
            title="Ranking"
            isPlusOnly={!isPlus}
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
          />
          <SummaryRow
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
          />
        </ul>
      </div>
      <SettingDivider />
      <ResetSection />
    </>
  );
};
