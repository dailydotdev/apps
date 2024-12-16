import React, { ReactElement, useContext, useMemo, useState } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { TagSelection } from '../../../tags/TagSelection';
import { Origin } from '../../../../lib/log';
import { TagElement } from '../TagElement';
import {
  ModalKind,
  ModalPropsContext,
  ModalSize,
} from '../../../modals/common/types';
import { ModalTabs } from '../../../modals/common/ModalTabs';
import useDebounceFn from '../../../../hooks/useDebounceFn';
import { useTagSearch } from '../../../../hooks/useTagSearch';
import { SearchField } from '../../../fields/SearchField';
import { TagsData } from '../../../../graphql/feedSettings';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import useFeedSettings from '../../../../hooks/useFeedSettings';
import useTagAndSource from '../../../../hooks/useTagAndSource';

const tabs = ['Suggested', 'My tags'];

const noop = () => undefined;

export const FeedSettingsTagsSection = (): ReactElement => {
  const { feed, onTagClick } = useContext(FeedSettingsEditContext);
  const [activeView, setActiveView] = useState<string>(() => tabs[0]);
  const { feedSettings } = useFeedSettings({ feedId: feed?.id });
  const { onUnfollowTags } = useTagAndSource({
    origin: Origin.CustomFeed,
    feedId: feed?.id,
    shouldFilterLocally: true,
    shouldUpdateAlerts: true,
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onSearch] = useDebounceFn(setSearchQuery, 200);

  const { data: searchResult } = useTagSearch({
    value: searchQuery,
    origin: Origin.CustomFeed,
  });

  const onboardingTagsPerLetter = useMemo(() => {
    const tagsToGroup = searchQuery
      ? searchResult?.searchTags.tags
      : feedSettings?.includeTags;

    if (!tagsToGroup) {
      return [];
    }

    const tagsPerLetter = tagsToGroup.reduce((acc, tagItem) => {
      const tag = typeof tagItem === 'string' ? { name: tagItem } : tagItem;

      const firstLetter = tag.name[0].toUpperCase();
      acc[firstLetter] = acc[firstLetter] || [];
      acc[firstLetter].push(tag);

      return acc;
    }, {} as Record<string, TagsData['tags']>);

    const sortedTagsPerLetter = Object.entries(tagsPerLetter).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    return sortedTagsPerLetter;
  }, [feedSettings, searchResult, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        aria-label="Search tags"
        className="border-none !bg-background-subtle"
        inputId="search-filters"
        placeholder="Search tags"
        valueChanged={onSearch}
      />
      <ModalPropsContext.Provider
        value={{
          tabs,
          activeView,
          setActiveView,
          onRequestClose: noop,
          kind: ModalKind.FlexibleCenter,
          size: ModalSize.Medium,
        }}
      >
        <ModalTabs className="border-b border-border-subtlest-tertiary pb-[0.70rem]" />
        <div className="flex w-full max-w-full flex-col">
          {activeView === 'Suggested' && (
            <TagSelection
              classNameTags="!justify-start"
              shouldUpdateAlerts={false}
              shouldFilterLocally
              feedId={feed?.id}
              onClickTag={onTagClick}
              // TODO AS-814 - check if main feed for origins
              origin={Origin.CustomFeed}
              searchOrigin={Origin.CustomFeed}
              TagElement={TagElement}
              searchQuery={searchQuery}
              searchTags={searchResult?.searchTags.tags || []}
            />
          )}
          {activeView === 'My tags' && (
            <div className="flex flex-col gap-6">
              {onboardingTagsPerLetter.map(([letter, tags]) => {
                return (
                  <section key={letter} className="flex flex-col">
                    <div className="flex gap-4">
                      <Typography
                        className="py-1.5"
                        bold
                        type={TypographyType.Callout}
                        color={TypographyColor.Tertiary}
                      >
                        {letter}
                      </Typography>
                      <div className="flex flex-1 flex-wrap gap-2">
                        {tags.map((tag) => (
                          <TagElement
                            key={tag.name}
                            isSelected
                            tag={tag}
                            onClick={() => {
                              onUnfollowTags({ tags: [tag.name] });
                              onTagClick({ tag, action: 'unfollow' });
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </ModalPropsContext.Provider>
    </div>
  );
};
