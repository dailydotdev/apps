import type { ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { SearchField } from '@dailydotdev/shared/src/components/fields/SearchField';
import { ShellField } from '@dailydotdev/shared/src/components/shell/ShellField';
import { TagDirectory } from '@dailydotdev/shared/src/components/tags/TagDirectory';
import { TagDirectoryFilter } from '@dailydotdev/shared/src/components/tags/TagDirectoryFilter';
import { TagCategorySection } from '@dailydotdev/shared/src/components/tags/TagCategorySection';
import type { Keyword } from '@dailydotdev/shared/src/graphql/keywords';
import { usePersonalization } from '../PersonalizationContext';
import { InterestsSection } from '../panel/InterestsSection';
import { FeedSettingsPage } from './pages';
import { BlockedNote } from './BlockedNote';

const columns = 'columns-1 gap-x-6 @xs:columns-2 @xl:columns-3';

/** Tags and the topic profile in one page: follow, boost, find more. */
export const TopicsPage = ({
  onNavigate,
}: {
  onNavigate: (page: FeedSettingsPage) => void;
}): ReactElement => {
  const store = usePersonalization();
  const { state, pool } = store;
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const followedTags = useMemo(
    () => new Set(state.followedTags),
    [state.followedTags],
  );
  // The directory is every tag on the posts the story ranks.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    pool.forEach((post) =>
      (post.tags ?? []).forEach((tag) =>
        counts.set(tag, (counts.get(tag) ?? 0) + 1),
      ),
    );
    return [...counts.entries()]
      .filter(([tag]) => !state.blockedTags.includes(tag))
      .map(
        ([value, occurrences]): Keyword => ({
          value,
          occurrences,
          status: 'allow',
        }),
      );
  }, [pool, state.blockedTags]);
  const popular = useMemo(
    () => ({
      id: 'popular-in-feed',
      title: 'Popular in your feed',
      emoji: '',
      tags: [...tags]
        .sort((a, b) => b.occurrences - a.occurrences)
        .filter(({ value }) => !followedTags.has(value))
        .slice(0, 10)
        .map(({ value }) => value),
    }),
    [tags, followedTags],
  );
  const onToggleFollow = (tag: string) =>
    store.setTagFollowed(tag, !followedTags.has(tag));
  const isSearching = !!search.trim();

  return (
    <div className="flex flex-col gap-10">
      <InterestsSection />
      {state.blockedTags.length > 0 && (
        <BlockedNote
          text={`You blocked ${state.blockedTags
            .map((tag) => `#${tag}`)
            .join(', ')}. Posts about ${
            state.blockedTags.length === 1 ? 'it' : 'them'
          } never show.`}
          onOpen={() => onNavigate(FeedSettingsPage.Filters)}
        />
      )}
      <section
        aria-labelledby="find-topics-title"
        className="flex flex-col gap-6 @container"
      >
        <h2
          id="find-topics-title"
          className="font-bold text-text-primary typo-title3"
        >
          Follow more topics
        </h2>
        <SearchField
          aria-label="Search tags"
          className="hidden border-none !bg-background-subtle tablet:flex"
          inputId="search-topics"
          placeholder="Search all tags"
          valueChanged={setSearch}
        />
        <ShellField
          placeholder="Search tags"
          value={search}
          onChange={setSearch}
        />
        {!isSearching && (
          <div className="border-b border-border-subtlest-tertiary pb-6">
            <TagDirectoryFilter
              tags={tags}
              activeLetter={activeLetter}
              onSelectLetter={setActiveLetter}
            />
          </div>
        )}
        {!isSearching && !activeLetter && (
          <TagCategorySection
            category={popular}
            followedTags={followedTags}
            onToggleFollow={onToggleFollow}
            selectable
            className="!mb-0 min-w-0"
          />
        )}
        <TagDirectory
          tags={tags}
          followedTags={followedTags}
          onToggleFollow={onToggleFollow}
          search={search}
          activeLetter={activeLetter}
          selectable
          classNameColumns={columns}
        />
      </section>
    </div>
  );
};
