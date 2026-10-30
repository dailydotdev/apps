import type { ReactElement } from 'react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowIcon } from '../../../icons/Arrow';
import { IconSize } from '../../../Icon';
import { PlusUser } from '../../../PlusUser';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import { Divider } from '../../../utilities/Divider';
import { useAuthContext } from '../../../../contexts/AuthContext';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import { usePlusSubscription } from '../../../../hooks/usePlusSubscription';
import { Origin } from '../../../../lib/log';
import { pluralize } from '../../../../lib/strings';
import { ExplainOrigin } from '../../../../features/feedExplain/types';
import { feedProfileQueryOptions } from '../../../../features/feedExplain/queries';
import { useFeedControls } from '../../../../features/feedExplain/useFeedControls';
import { useForYouControls } from '../../../../features/feedExplain/useFeedExplainMode';
import { AgentSetup } from '../../../../features/feedExplain/components/AgentSetup';
import {
  ForYouOverviewControls,
  ForYouStartOver,
} from '../../../../features/feedExplain/components/ForYouSettings';
import type { ForYouSettingsPageId } from '../forYouSettingsPages';
import {
  forYouSettingsTitle,
  useOpenForYouSettingsPage,
} from '../forYouSettingsPages';
import { FeedSettingsMenu } from '../types';

const count = (amount: number, word: string): string =>
  `${amount} ${pluralize(word, amount)}`;

const SummaryRow = ({
  page,
  summary,
  isPlusOnly,
}: {
  page: ForYouSettingsPageId;
  summary: string;
  isPlusOnly?: boolean;
}): ReactElement => {
  const openPage = useOpenForYouSettingsPage();

  return (
    <li>
      <button
        type="button"
        onClick={() => openPage(page)}
        className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-12 px-3 py-3 text-left hover:bg-surface-hover"
      >
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-center gap-2">
            <Typography type={TypographyType.Callout} bold>
              {forYouSettingsTitle[page]}
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
};

/** What shapes For You, one row per page that changes it. */
const FeedSummary = (): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { isAvailable, version } = useForYouControls();
  const { feedSettings } = useFeedSettings();
  const profileOptions = feedProfileQueryOptions(user, version);
  const { data: profile } = useQuery({
    ...profileOptions,
    enabled: profileOptions.enabled && isAvailable,
  });
  const { controls } = useFeedControls({
    origin: Origin.Settings,
    enabled: isAvailable,
  });
  const followedTopics = feedSettings?.includeTags?.length ?? 0;
  const followedSources = feedSettings?.includeSources?.length ?? 0;
  const changedSettings = controls?.ranking.length ?? 0;

  const getTopicsSummary = (): string => {
    if (!isAvailable || !profile) {
      return followedTopics
        ? `You follow ${count(followedTopics, 'topic')}.`
        : "You don't follow any topics yet.";
    }
    const learned = profile.interests.filter(
      ({ origin }) => origin === ExplainOrigin.Inferred,
    ).length;
    const strongest = profile.interests
      .filter(({ weight }) => weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map(({ tag }) => `#${tag}`);
    const topics = `${followedTopics} you follow, ${learned} from your reading.`;
    return strongest.length
      ? `${topics} Strongest: ${strongest.join(', ')}.`
      : topics;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <Typography bold type={TypographyType.Body}>
          What shapes your feed
        </Typography>
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          What For You uses right now. Open one to change it.
        </Typography>
      </div>
      <ul className="flex flex-col">
        <SummaryRow page={FeedSettingsMenu.Tags} summary={getTopicsSummary()} />
        <SummaryRow
          page={FeedSettingsMenu.ContentSources}
          summary={
            followedSources
              ? `You follow ${count(followedSources, 'source')}.`
              : "You don't follow any sources yet."
          }
        />
        {isAvailable && (
          <SummaryRow
            page={FeedSettingsMenu.Ranking}
            isPlusOnly={!isPlus}
            summary={
              changedSettings
                ? `${count(
                    changedSettings,
                    'setting',
                  )} changed from the default.`
                : 'Every setting is at its default.'
            }
          />
        )}
        <SummaryRow
          page={FeedSettingsMenu.Filters}
          summary="Content and post types you hide, and what you blocked."
        />
      </ul>
    </div>
  );
};

/**
 * For You's first Feed settings page: what shapes the feed at a glance, and
 * the controls that apply to all of it where the reader's ranking takes them.
 */
export const FeedSettingsOverviewSection = (): ReactElement => {
  const { isAvailable } = useForYouControls();

  return (
    <>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Everything that shapes your For You feed. Change anything here and your
        feed follows.
      </Typography>
      {isAvailable && <AgentSetup />}
      <ForYouOverviewControls />
      <Divider className="my-1 bg-border-subtlest-tertiary" />
      <FeedSummary />
      {isAvailable && (
        <>
          <Divider className="my-1 bg-border-subtlest-tertiary" />
          <ForYouStartOver />
        </>
      )}
    </>
  );
};
