import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { MiniCloseIcon } from '../../../components/icons/MiniClose';
import { IconSize } from '../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../components/typography/Typography';
import { useAuthContext } from '../../../contexts/AuthContext';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { Origin } from '../../../lib/log';
import type { FeedControls, FeedProfile } from '../types';
import { ExplainOrigin, FeedTopicMode } from '../types';
import { describeTopic, getControlMeta } from '../describe';
import { feedProfileQueryOptions } from '../queries';
import type { UseFeedControls } from '../useFeedControls';
import { useFeedControls } from '../useFeedControls';
import { useForYouControls } from '../useFeedExplainMode';
import { useFrozenGroups } from '../useFrozenGroups';
import { TopicLevelPicker, topicLevels } from './TopicLevelPicker';
import { SettingsList, SettingsListEmpty, SettingsRow } from './SettingsList';

// Levels that turn a topic down, listed apart when it isn't one of the
// reader's topics.
const turnedDownModes = [
  FeedTopicMode.Demote,
  FeedTopicMode.StopLearning,
  FeedTopicMode.Off,
];

interface ForYouTopicsProps {
  followedTags: Set<string>;
  onToggleFollow: (tag: string) => void;
}

interface TopicListsProps extends ForYouTopicsProps {
  profile: FeedProfile;
  controls: FeedControls;
  feedControls: UseFeedControls;
}

const TopicLists = ({
  followedTags,
  onToggleFollow,
  profile,
  controls,
  feedControls,
}: TopicListsProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { getTopicControl, setTopic } = feedControls;
  const interests = new Map(
    profile.interests.map((interest) => [interest.tag, interest]),
  );
  const byWeight = (a: string, b: string): number =>
    (interests.get(b)?.weight ?? 0) - (interests.get(a)?.weight ?? 0) ||
    a.localeCompare(b);
  const lists = useFrozenGroups({
    followed: [...followedTags].sort(byWeight),
    learned: profile.interests
      .filter(
        ({ tag, origin }) =>
          origin !== ExplainOrigin.Declared && !followedTags.has(tag),
      )
      .map(({ tag }) => tag)
      .sort(byWeight),
  });
  const turnedDownNow = controls.topics
    .filter(
      ({ keyword, mode }) =>
        mode &&
        turnedDownModes.includes(mode) &&
        !lists.followed.includes(keyword) &&
        !lists.learned.includes(keyword),
    )
    .map(({ keyword }) => keyword)
    .sort();
  // Chips keep their places too; one put back leaves.
  const turnedDown = useFrozenGroups({ chips: turnedDownNow }).chips.filter(
    (tag) => turnedDownNow.includes(tag),
  );

  const renderRow = (tag: string): ReactElement => {
    const interest = interests.get(tag);
    const control = getTopicControl(tag);
    const meta = getControlMeta(control, isPlus);
    const isFollowed = followedTags.has(tag);

    return (
      <SettingsRow
        key={tag}
        name={`#${tag}`}
        description={meta?.text ?? describeTopic(interest, isFollowed)}
        descriptionClassName={meta?.className}
        boost={
          <TopicLevelPicker
            tag={tag}
            weight={interest?.weight ?? 0}
            computedWeight={interest?.computedWeight}
            isSet={!!control}
            control={control}
            onChange={(value) => setTopic(tag, value)}
          />
        }
        action={
          <Button
            type="button"
            className="w-24"
            variant={isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary}
            size={ButtonSize.Small}
            aria-label={`${isFollowed ? 'Unfollow' : 'Follow'} #${tag}`}
            onClick={() => onToggleFollow(tag)}
          >
            {isFollowed ? 'Unfollow' : 'Follow'}
          </Button>
        }
      />
    );
  };

  return (
    <>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Posts about these topics get a boost. Open a boost to show more or less
        of a topic, or to stop learning from what you read about it.
      </Typography>
      <SettingsList title="Topics you follow">
        {lists.followed.map(renderRow)}
        {!lists.followed.length && (
          <SettingsListEmpty>
            You don&apos;t follow any topics yet. Find some below.
          </SettingsListEmpty>
        )}
      </SettingsList>
      <SettingsList
        title="Topics from your reading"
        description={
          controls.learning ? "Topics you read about but don't follow." : null
        }
      >
        {lists.learned.map(renderRow)}
        {!lists.learned.length && (
          <SettingsListEmpty>
            {controls.learning
              ? 'Nothing yet. Topics show up here as you read.'
              : 'Learning from your reading is off, so only topics you follow count.'}
          </SettingsListEmpty>
        )}
      </SettingsList>
      {turnedDown.length > 0 && (
        <section className="flex flex-col gap-3">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <span className="flex min-w-0 flex-[1_1_16rem] flex-col gap-1">
              <Typography
                tag={TypographyTag.H2}
                type={TypographyType.Body}
                className="tablet:typo-title3"
                bold
              >
                Topics you turned down
              </Typography>
              <Typography
                type={TypographyType.Callout}
                color={TypographyColor.Tertiary}
              >
                You don&apos;t follow these, but posts about them rank lower.
                Remove one to put it back to Auto.
              </Typography>
            </span>
            <Button
              type="button"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              onClick={() =>
                turnedDown.forEach((tag) => setTopic(tag, { mode: null }))
              }
            >
              Put all back
            </Button>
          </header>
          <ul className="flex flex-wrap gap-2">
            {turnedDown.map((tag) => {
              const level = topicLevels.find(
                ({ mode }) => mode === getTopicControl(tag)?.mode,
              );
              return (
                <li key={tag}>
                  <button
                    type="button"
                    aria-label={`Put #${tag} back to Auto`}
                    onClick={() => setTopic(tag, { mode: null })}
                    className="flex h-8 items-center gap-1.5 rounded-10 bg-surface-float pl-3 pr-2 font-bold text-text-primary typo-footnote hover:bg-surface-hover"
                  >
                    #{tag}
                    <span className={classNames(level?.activeClassName)}>
                      {level?.label}
                    </span>
                    <MiniCloseIcon
                      size={IconSize.Size16}
                      className="text-text-tertiary"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
};

/**
 * Topics' For You part: the topics the reader follows and the ones learned
 * from reading, each with its boost, and the ones turned down. The lists
 * wait for the profile and the controls, so their order is set once.
 */
export const ForYouTopics = (props: ForYouTopicsProps): ReactElement | null => {
  const { user } = useAuthContext();
  const { isAvailable, version } = useForYouControls();
  const profileOptions = feedProfileQueryOptions(user, version);
  const { data: profile } = useQuery({
    ...profileOptions,
    enabled: profileOptions.enabled && isAvailable,
  });
  const feedControls = useFeedControls({
    origin: Origin.Settings,
    enabled: isAvailable,
  });
  const { controls } = feedControls;

  if (!isAvailable || !profile || !controls) {
    return null;
  }

  return (
    <TopicLists
      {...props}
      profile={profile}
      controls={controls}
      feedControls={feedControls}
    />
  );
};
