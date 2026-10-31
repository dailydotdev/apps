import type { ReactElement } from 'react';
import React, { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import { SourceAvatar } from '../../../components/profile/source/SourceAvatar';
import {
  ProfileImageSize,
  ProfilePicture,
} from '../../../components/ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { useFeedSettingsEditContext } from '../../../components/feeds/FeedSettings/FeedSettingsEditContext';
import { useAuthContext } from '../../../contexts/AuthContext';
import { ContentPreferenceType } from '../../../graphql/contentPreference';
import { useContentPreference } from '../../../hooks/contentPreference/useContentPreference';
import { useFollowingQuery } from '../../../hooks/contentPreference/useFollowingQuery';
import useFeedSettings, {
  getFeedSettingsQueryKey,
} from '../../../hooks/useFeedSettings';
import { usePlusSubscription } from '../../../hooks/usePlusSubscription';
import { Origin } from '../../../lib/log';
import type { FeedControls, FeedProfile } from '../types';
import { followModeMeta, getControlMeta } from '../describe';
import { feedProfileQueryOptions } from '../queries';
import type { UseFeedControls } from '../useFeedControls';
import { useFeedControls } from '../useFeedControls';
import { useForYouControls } from '../useFeedExplainMode';
import { useFrozenGroups } from '../useFrozenGroups';
import { SourceLevelPicker } from './SourceLevelPicker';
import { AuthorLevelPicker } from './AuthorLevelPicker';
import { SettingsList, SettingsListEmpty, SettingsRow } from './SettingsList';

interface ListedSource {
  id: string;
  name?: string;
  image?: string;
}

interface ListedCreator extends ListedSource {
  username?: string;
}

const getRankingValue = (profile: FeedProfile, key: string): number =>
  profile.ranking.find((setting) => setting.key === key)?.value ?? 1;

/**
 * Follows changed here, until the lists they come from catch up, so a button
 * flips at once and its row stays.
 */
const useFollowToggle = (entity: ContentPreferenceType) => {
  const { user } = useAuthContext();
  const client = useQueryClient();
  const { feed } = useFeedSettingsEditContext();
  const { follow, unfollow } = useContentPreference();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const toggle = async (id: string, name: string, isFollowed: boolean) => {
    setOverrides((current) => ({ ...current, [id]: !isFollowed }));
    const mutation = isFollowed ? unfollow : follow;
    try {
      await mutation({ id, entity, entityName: name, feedId: feed?.id });
      client.invalidateQueries({ queryKey: getFeedSettingsQueryKey(user) });
    } catch {
      setOverrides((current) => ({ ...current, [id]: isFollowed }));
    }
  };

  return { overrides, toggle };
};

interface ListsProps {
  profile: FeedProfile;
  controls: FeedControls;
  feedControls: UseFeedControls;
}

const SourceList = ({
  profile,
  controls,
  feedControls,
}: ListsProps): ReactElement => {
  const { isPlus } = usePlusSubscription();
  const { feedSettings } = useFeedSettings();
  const { overrides, toggle } = useFollowToggle(ContentPreferenceType.Source);
  const { getSourceControl, setSource } = feedControls;
  // Every source listed so far, so one unfollowed here keeps its row.
  const known = useRef(new Map<string, ListedSource>());
  const followed = (feedSettings?.includeSources ?? []).flatMap(
    ({ id, name, image }): ListedSource[] => (id ? [{ id, name, image }] : []),
  );
  const blocked = new Set(feedSettings?.excludeSources?.map(({ id }) => id));
  const adjusted = controls.sources
    .filter(
      ({ source }) =>
        !followed.some(({ id }) => id === source.id) && !blocked.has(source.id),
    )
    .map(({ source }) => ({ id: source.id, name: source.name ?? source.id }));
  [...followed, ...adjusted].forEach((source) =>
    known.current.set(source.id, source),
  );
  const ids = useFrozenGroups({
    sources: [...followed, ...adjusted].map(({ id }) => id),
  }).sources.filter((id) => !blocked.has(id));
  const multiplier = getRankingValue(profile, 'follows.source_multiplier');

  return (
    <SettingsList title="Sources you follow">
      {ids.map((id) => {
        const source = known.current.get(id);
        if (!source) {
          return null;
        }
        const name = source.name ?? id;
        const isFollowed =
          overrides[id] ?? followed.some((item) => item.id === id);
        const control = getSourceControl(id);
        const meta = getControlMeta(control, isPlus, followModeMeta);
        return (
          <SettingsRow
            key={id}
            media={
              <SourceAvatar
                source={{ image: source.image ?? '', handle: name }}
                size={ProfileImageSize.Medium}
                className="!mr-0"
              />
            }
            name={name}
            description={
              meta?.text ??
              (isFollowed
                ? 'You follow it.'
                : "You don't follow it. Its posts come in when they match your topics.")
            }
            descriptionClassName={meta?.className}
            boost={
              <SourceLevelPicker
                name={name}
                factor={isFollowed ? multiplier : 1}
                isFollowed={isFollowed}
                control={control}
                onChange={(value) => setSource(id, value)}
              />
            }
            action={
              <Button
                type="button"
                className="w-24"
                variant={
                  isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary
                }
                size={ButtonSize.Small}
                aria-label={`${isFollowed ? 'Unfollow' : 'Follow'} ${name}`}
                onClick={() => toggle(id, name, isFollowed)}
              >
                {isFollowed ? 'Unfollow' : 'Follow'}
              </Button>
            }
          />
        );
      })}
      {!ids.length && (
        <SettingsListEmpty>
          You don&apos;t follow any sources yet.
        </SettingsListEmpty>
      )}
    </SettingsList>
  );
};

const CreatorList = ({
  profile,
  controls,
  feedControls,
}: ListsProps): ReactElement => {
  const { user } = useAuthContext();
  const { isPlus } = usePlusSubscription();
  const { feed } = useFeedSettingsEditContext();
  const { overrides, toggle } = useFollowToggle(ContentPreferenceType.User);
  const { getAuthorControl, setAuthor } = feedControls;
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowingQuery({
      id: user?.id ?? '',
      entity: ContentPreferenceType.User,
      feedId: feed?.id,
    });
  const known = useRef(new Map<string, ListedCreator>());
  const followed = (data?.pages ?? []).flatMap(
    (page) =>
      page?.edges.flatMap(({ node }) =>
        node.referenceUser ? [node.referenceUser as ListedCreator] : [],
      ) ?? [],
  );
  const adjusted = controls.authors
    .filter(({ user: author }) => !followed.some(({ id }) => id === author.id))
    .map(
      ({ user: author }): ListedCreator => ({
        id: author.id,
        name: author.name ?? author.id,
      }),
    );
  [...followed, ...adjusted].forEach((creator) =>
    known.current.set(creator.id, creator),
  );
  const ids = useFrozenGroups({
    creators: [...followed, ...adjusted].map(({ id }) => id),
  }).creators;
  const multiplier = getRankingValue(profile, 'follows.author_multiplier');

  return (
    <SettingsList title="Creators you follow">
      {ids.map((id) => {
        const creator = known.current.get(id);
        if (!creator) {
          return null;
        }
        const name = creator.name || creator.username || id;
        const isFollowed =
          overrides[id] ?? followed.some((item) => item.id === id);
        const control = getAuthorControl(id);
        const meta = getControlMeta(control, isPlus, followModeMeta);
        return (
          <SettingsRow
            key={id}
            media={
              <ProfilePicture
                user={{ image: creator.image ?? '' }}
                size={ProfileImageSize.Medium}
                nativeLazyLoading
              />
            }
            name={name}
            description={
              meta?.text ??
              (isFollowed ? 'You follow them.' : "You don't follow them.")
            }
            descriptionClassName={meta?.className}
            boost={
              <AuthorLevelPicker
                name={name}
                factor={isFollowed ? multiplier : 1}
                isFollowed={isFollowed}
                control={control}
                onChange={(value) => setAuthor(id, value)}
              />
            }
            action={
              <Button
                type="button"
                className="w-24"
                variant={
                  isFollowed ? ButtonVariant.Float : ButtonVariant.Secondary
                }
                size={ButtonSize.Small}
                aria-label={`${isFollowed ? 'Unfollow' : 'Follow'} ${name}`}
                onClick={() => toggle(id, name, isFollowed)}
              >
                {isFollowed ? 'Unfollow' : 'Follow'}
              </Button>
            }
          />
        );
      })}
      {!ids.length && (
        <SettingsListEmpty>
          You don&apos;t follow any creators yet. Following one brings their
          posts into For You.
        </SettingsListEmpty>
      )}
      {hasNextPage && (
        <li className="py-2">
          <Button
            type="button"
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            loading={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Show more
          </Button>
        </li>
      )}
    </SettingsList>
  );
};

/**
 * Sources and creators' For You part: the sources and creators the reader
 * follows, or set a level on, each with its boost. The lists wait for the
 * follows, the feed profile and the controls, so their order is set once.
 */
export const ForYouSources = (): ReactElement | null => {
  const { user } = useAuthContext();
  const { feed } = useFeedSettingsEditContext();
  const { feedSettings } = useFeedSettings();
  const { isPending: isCreatorsPending } = useFollowingQuery({
    id: user?.id ?? '',
    entity: ContentPreferenceType.User,
    feedId: feed?.id,
  });
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

  if (
    !isAvailable ||
    !profile ||
    !controls ||
    !feedSettings ||
    isCreatorsPending
  ) {
    return null;
  }

  const lists = { profile, controls, feedControls };

  return (
    <>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Posts from sources and creators you follow get a boost. Open a boost to
        show more or less of them, or to have For You ignore a follow. Sources
        you only read from don&apos;t appear here.
      </Typography>
      <SourceList {...lists} />
      <CreatorList {...lists} />
    </>
  );
};
