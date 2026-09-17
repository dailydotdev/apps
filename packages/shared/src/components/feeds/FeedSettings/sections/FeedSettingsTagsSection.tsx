import type { ReactElement } from 'react';
import React, { useContext, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { Origin } from '../../../../lib/log';
import { SearchField } from '../../../fields/SearchField';
import { suggestedTagsQueryOptions } from '../../../../graphql/feedSettings';
import { tagDirectoryQueryOptions } from '../../../../graphql/keywords';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../typography/Typography';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import useTagAndSource from '../../../../hooks/useTagAndSource';
import { FeedType } from '../../../../graphql/feed';
import { TagDirectory } from '../../../tags/TagDirectory';
import { TagDirectoryFilter } from '../../../tags/TagDirectoryFilter';
import { TagCategorySection } from '../../../tags/TagCategorySection';
import { TagDirectoryListItem } from '../../../tags/TagDirectoryListItem';
import { ClickableText } from '../../../buttons/ClickableText';
import { Loader } from '../../../Loader';
import { TutorialVideoButton } from '../../../video/TutorialVideoButton';

const columns = 'columns-1 gap-x-6 @xs:columns-2 @xl:columns-3';

export const FeedSettingsTagsSection = (): ReactElement => {
  const { feed, editFeedSettings } = useContext(FeedSettingsEditContext);
  const { feedSettings } = useFeedSettings({ feedId: feed?.id });
  const { onFollowTags, onUnfollowTags } = useTagAndSource({
    origin:
      feed?.type === FeedType.Main ? Origin.TagsFilter : Origin.CustomFeed,
    feedId: feed?.id,
    shouldFilterLocally: false,
    shouldUpdateAlerts: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const {
    data: directory,
    isPending,
    isError,
    refetch,
  } = useQuery({
    ...tagDirectoryQueryOptions(),
  });
  const { data: suggested } = useQuery({ ...suggestedTagsQueryOptions() });
  const followedTags = useMemo(
    () => new Set(feedSettings?.includeTags ?? []),
    [feedSettings?.includeTags],
  );
  const tagTitles = useMemo(
    () =>
      Object.fromEntries(
        (directory?.tags ?? []).flatMap(({ value, flags }) =>
          flags?.title ? [[value, flags.title]] : [],
        ),
      ),
    [directory?.tags],
  );
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const myTags = useMemo(
    () =>
      [...followedTags]
        .filter(
          (tag) =>
            tag.toLowerCase().includes(normalizedSearch) ||
            tagTitles[tag]?.toLowerCase().includes(normalizedSearch),
        )
        .sort((a, b) => a.localeCompare(b)),
    [followedTags, normalizedSearch, tagTitles],
  );
  const featuredLists = useMemo(
    () => [
      {
        id: 'recommended-tags',
        title: 'Recommended tags',
        emoji: '',
        tags: (suggested?.onboardingTags.tags ?? []).flatMap(({ name }) =>
          name && !followedTags.has(name) ? [name] : [],
        ),
      },
      {
        id: 'popular-tags',
        title: 'Popular tags',
        emoji: '',
        tags: directory?.popularTags.map(({ value }) => value) ?? [],
      },
      {
        id: 'recently-added-tags',
        title: 'Recently added tags',
        emoji: '',
        tags:
          directory?.tags
            .slice()
            .sort(
              (a, b) =>
                +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0),
            )
            .slice(0, 10)
            .map(({ value }) => value) ?? [],
      },
    ],
    [directory, suggested, followedTags],
  );

  const onToggleFollow = (tag: string): void => {
    editFeedSettings(() =>
      followedTags.has(tag)
        ? onUnfollowTags({ tags: [tag] })
        : onFollowTags({ tags: [tag] }),
    );
  };

  return (
    <div className="flex w-full flex-col gap-6 @container">
      <SearchField
        aria-label="Search tags"
        className="border-none !bg-background-subtle"
        inputId="search-filters"
        placeholder="Search all tags"
        valueChanged={setSearchQuery}
      />
      {!normalizedSearch && !!directory?.tags.length && (
        <div className="border-b border-border-subtlest-tertiary pb-6">
          <TagDirectoryFilter
            tags={directory.tags}
            activeLetter={activeLetter}
            onSelectLetter={setActiveLetter}
          />
        </div>
      )}
      <div className="flex flex-col items-start gap-2">
        <Typography
          color={TypographyColor.Tertiary}
          type={TypographyType.Callout}
        >
          Tags are a great way to tell the system what you&apos;re interested
          in. They&apos;re a strong starting signal for your feed, and as you
          engage with content over time, their weight gradually decreases in
          favor of stronger signals based on your actual activity.
        </Typography>
        <TutorialVideoButton
          videoId={process.env.NEXT_PUBLIC_FEED_TAGS_TUTORIAL_VIDEO_ID}
          title="Make your feed your own"
        />
      </div>
      <section aria-label="My tags" className="flex flex-col gap-3">
        <Typography tag={TypographyTag.H2} type={TypographyType.Title3} bold>
          My tags
        </Typography>
        {myTags.length ? (
          <ul className={columns}>
            {myTags.map((tag) => (
              <TagDirectoryListItem
                key={tag}
                tag={tag}
                title={tagTitles[tag]}
                isFollowed
                onToggleFollow={onToggleFollow}
                selectable
              />
            ))}
          </ul>
        ) : (
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            {followedTags.size
              ? 'None of your tags match this search.'
              : 'Follow tags below to personalize your feed.'}
          </Typography>
        )}
      </section>
      {!normalizedSearch && (
        <div className="grid grid-cols-1 gap-6 @xl:grid-cols-3">
          {featuredLists.map((category) => (
            <TagCategorySection
              key={category.id}
              category={category}
              followedTags={followedTags}
              onToggleFollow={onToggleFollow}
              tagTitles={tagTitles}
              selectable
              className="!mb-0 min-w-0"
            />
          ))}
        </div>
      )}
      {isPending && <Loader />}
      {isError && (
        <div className="flex flex-col items-start gap-2" role="alert">
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            We couldn&apos;t load the tag directory.
          </Typography>
          <ClickableText tag="button" type="button" onClick={() => refetch()}>
            Try again
          </ClickableText>
        </div>
      )}
      {directory && (
        <TagDirectory
          tags={directory.tags}
          followedTags={followedTags}
          onToggleFollow={onToggleFollow}
          search={searchQuery}
          activeLetter={activeLetter}
          selectable
          classNameColumns={columns}
        />
      )}
    </div>
  );
};
