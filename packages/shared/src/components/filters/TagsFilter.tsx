import React, {
  ReactElement,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import classNames from 'classnames';
import { SearchField } from '../fields/SearchField';
import TagCategoryDropdown, { TagCategoryLayout } from './TagCategoryDropdown';
import useFeedSettings from '../../hooks/useFeedSettings';
import TagItemList from './TagItemList';
import TagOptionsMenu from './TagOptionsMenu';
import useTagContext from '../../hooks/useTagContext';
import useTagAndSource, {
  TagActionArguments,
} from '../../hooks/useTagAndSource';
import { FilterMenuProps } from './common';
import { MenuIcon } from '../icons';
import AuthContext from '../../contexts/AuthContext';
import classed from '../../lib/classed';
import { HTMLElementComponent } from '../utilities';
import { Origin } from '../../lib/log';
import useDebounce from '../../hooks/useDebounce';
import { useTagSearch } from '../../hooks';

const TagsContainer = classed('div', 'grid grid-cols-1 gap-4');

interface TagsFilterProps extends FilterMenuProps {
  tagCategoryLayout?: TagCategoryLayout;
}

const Container: Record<TagCategoryLayout, HTMLElementComponent> = {
  settings: TagsContainer,
  default: React.Fragment,
};

export default function TagsFilter({
  onUnblockItem,
  tagCategoryLayout = TagCategoryLayout.Default,
}: TagsFilterProps): ReactElement {
  const searchRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<string>(null);
  const { user } = useContext(AuthContext);
  const [onSearch] = useDebounce(setQuery, 200);
  const { tagsCategories, feedSettings, isLoading } = useFeedSettings();
  const { contextSelectedTag, setContextSelectedTag, onTagContextOptions } =
    useTagContext();
  const { onFollowTags, onUnfollowTags, onBlockTags, onUnblockTags } =
    useTagAndSource({
      origin: query?.length ? Origin.TagsSearch : Origin.TagsFilter,
    });
  const isTagBlocked = feedSettings?.blockedTags?.some(
    (tag) => tag === contextSelectedTag,
  );

  const { data: searchResults } = useTagSearch({
    value: query,
    origin: Origin.ManageTag,
  });

  const { followedTags, blockedTags } = useMemo(() => {
    return {
      followedTags: feedSettings?.includeTags ?? [],
      blockedTags: feedSettings?.blockedTags ?? [],
    };
  }, [feedSettings]);

  const tagUnblockAction = ({ tags: [tag] }: TagActionArguments) => {
    if (!user) {
      return onUnblockTags({ tags: [tag] });
    }

    return onUnblockItem({
      tag,
      action: () => onUnblockTags({ tags: [tag] }),
    });
  };

  const isSettings = tagCategoryLayout === TagCategoryLayout.Default;
  const Component = Container[tagCategoryLayout];

  return (
    <div
      className={classNames('flex flex-col', isSettings && 'pb-6')}
      aria-busy={isLoading}
      data-testid="tagsFilter"
    >
      <div className="flex flex-col px-6 pb-6">
        <SearchField
          inputId="search-filters"
          placeholder="Search"
          className="mb-6"
          ref={searchRef}
          valueChanged={onSearch}
        />
        <h3 className="mb-3 font-bold typo-body">Choose tags to follow</h3>
        <p className="mb-2 text-text-tertiary typo-callout">
          Let’s super-charge your feed with relevant content! Start by choosing
          tags you want to follow, and we will curate your feed accordingly.
        </p>
      </div>

      {query?.length > 0 && (
        <>
          <TagItemList
            tags={searchResults?.searchTags.tags}
            emptyText="No matching tags."
            tooltip="Options"
            options={onTagContextOptions}
            followedTags={followedTags}
            blockedTags={blockedTags}
            onFollowTags={onFollowTags}
            onUnfollowTags={onUnfollowTags}
            onUnblockTags={tagUnblockAction}
            rowIcon={<MenuIcon />}
          />
          <TagOptionsMenu
            tag={contextSelectedTag}
            onBlock={
              !isTagBlocked &&
              (() => onBlockTags({ tags: [contextSelectedTag] }))
            }
            onUnblock={
              isTagBlocked &&
              (() => onUnblockTags({ tags: [contextSelectedTag] }))
            }
            onHidden={() => setContextSelectedTag(null)}
          />
        </>
      )}
      <Component>
        {(!query || query.length <= 0) &&
          tagsCategories?.map((tagCategory) => (
            <TagCategoryDropdown
              layout={tagCategoryLayout}
              key={tagCategory.id}
              tagCategory={tagCategory}
              followedTags={followedTags}
              blockedTags={blockedTags}
              onFollowTags={onFollowTags}
              onUnfollowTags={onUnfollowTags}
              onUnblockTags={tagUnblockAction}
            />
          ))}
      </Component>
    </div>
  );
}
