import React, {
  HTMLAttributes,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import dynamic from 'next/dynamic';
import { useContextMenu } from 'react-contexify';
import AuthContext from '../../contexts/AuthContext';
import {
  ALL_TAGS_AND_SETTINGS_QUERY,
  ALL_TAGS_QUERY,
  FeedSettingsData,
  SEARCH_TAGS_QUERY,
  SearchTagsData,
  TagsData,
} from '../../graphql/feedSettings';
import { apiUrl } from '../../lib/config';
import useMutateFilters, {
  getTagsSettingsQueryKey,
  getTagsFiltersQueryKey,
  getSearchTagsQueryKey,
} from '../../hooks/useMutateFilters';
import { trackEvent } from '../../lib/analytics';
import { Button } from '../buttons/Button';
import { getTooltipProps } from '../../lib/tooltip';
import {
  FiltersContainer,
  FiltersPlaceholder,
  FiltersHeadline,
  FiltersList,
  FilterItem,
  FilterProps,
  FiltersSummaryArrow,
  FiltersDetails,
} from './common';
import { Summary } from '../utilities';
import XIcon from '../../../icons/x.svg';
import MenuIcon from '../../../icons/menu.svg';

const TagOptionsMenu = dynamic(
  () => import(/* webpackChunkName: "tagOptionsMenu" */ './TagOptionsMenu'),
);

const Tag = ({
  tooltip,
  tag,
  selected,
  menu,
  onClick,
  ...props
}: {
  tooltip: string;
  tag: string;
  selected?: boolean;
  menu?: boolean;
  onClick?: (event: React.MouseEvent, tag: string) => unknown;
} & Omit<HTMLAttributes<HTMLAnchorElement>, 'onClick'>): ReactElement => (
  <FilterItem className="relative my-2">
    <Link
      href={`${process.env.NEXT_PUBLIC_WEBAPP_URL}tags/${tag}`}
      passHref
      prefetch={false}
    >
      <Button
        tag="a"
        buttonSize="small"
        pressed={selected}
        className="btn-tertiaryFloat"
        {...getTooltipProps(`${tag} feed`)}
        {...props}
      >
        #{tag}
      </Button>
    </Link>
    <Button
      className="btn-tertiary right-4 my-auto"
      style={{ position: 'absolute' }}
      onClick={(event) => onClick?.(event, tag)}
      icon={menu ? <MenuIcon /> : <XIcon />}
      {...getTooltipProps(tooltip, {
        position: 'left',
      })}
    />
  </FilterItem>
);

export default function TagsFilter({
  enableQueries = true,
  query,
}: FilterProps): ReactElement {
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const enabledSearch = query?.length > 0;
  const queryClient = useQueryClient();
  const [selectedTag, setSelectedTag] = useState<string>();
  const { show: showTagOptionsMenu } = useContextMenu({
    id: 'tag-options-context',
  });

  const filtersKey = getTagsFiltersQueryKey(user);
  const { data: settingsAndTags, isLoading: isLoadingQuery } = useQuery<
    FeedSettingsData & TagsData
  >(
    filtersKey,
    () =>
      request(
        `${apiUrl}/graphql`,
        user ? ALL_TAGS_AND_SETTINGS_QUERY : ALL_TAGS_QUERY,
      ),
    {
      enabled: tokenRefreshed && enableQueries,
    },
  );

  const searchKey = getSearchTagsQueryKey(query);
  const { data: searchResults } = useQuery<SearchTagsData>(
    searchKey,
    () => request(`${apiUrl}/graphql`, SEARCH_TAGS_QUERY, { query }),
    {
      enabled: enabledSearch,
    },
  );

  const { followTag, unfollowTag, blockTag, unblockTag } =
    useMutateFilters(user);

  const isLoading = isLoadingQuery || !settingsAndTags;

  const allFollowedTags = settingsAndTags?.feedSettings?.includeTags;
  const allBlockedTags = settingsAndTags?.feedSettings?.blockedTags;

  useEffect(() => {
    if (user && settingsAndTags) {
      queryClient.setQueryData(getTagsSettingsQueryKey(user), {
        feedSettings: settingsAndTags.feedSettings,
      });
    }
  }, [settingsAndTags, user]);

  const [availableTags, followedTags, blockedTags] = useMemo(() => {
    const tags = enabledSearch
      ? searchResults?.searchTags.tags
      : settingsAndTags?.tags;
    return (tags ?? []).reduce(
      ([notFollowed, followed, blocked], tag) => {
        const isFollowing = allFollowedTags?.indexOf(tag.name) >= 0;
        const isBlocking = allBlockedTags?.indexOf(tag.name) >= 0;
        if (isFollowing) {
          followed.push(tag.name);
        } else if (isBlocking) {
          blocked.push(tag.name);
        } else {
          notFollowed.push(tag.name);
        }
        return [notFollowed, followed, blocked];
      },
      [[], [], []],
    );
  }, [settingsAndTags, searchResults]);

  const onOptions = (event: React.MouseEvent, tag: string): void => {
    setSelectedTag(tag);
    const { right, bottom } = event.currentTarget.getBoundingClientRect();
    showTagOptionsMenu(event, {
      position: { x: right - 112, y: bottom + 4 },
    });
  };

  const onFollowTag = async (): Promise<void> => {
    if (!user) {
      showLogin('filter');
      return;
    }

    trackEvent({
      category: 'Tags',
      action: 'Toggle',
      label: 'Check',
    });
    await followTag({ tag: selectedTag });
  };

  const onUnfollowTag = async (
    event: React.MouseEvent,
    tag: string,
  ): Promise<void> => {
    trackEvent({
      category: 'Tags',
      action: 'Toggle',
      label: 'Uncheck',
    });
    await unfollowTag({ tag });
  };

  const onBlockTag = async (): Promise<void> => {
    if (!user) {
      showLogin('filter');
      return;
    }
    await blockTag({ tag: selectedTag });
  };

  const onUnblockTag = async (
    event: React.MouseEvent,
    tag: string,
  ): Promise<void> => {
    await unblockTag({ tag });
  };

  return (
    <FiltersContainer aria-busy={isLoading}>
      {isLoading ? (
        <FiltersPlaceholder />
      ) : (
        <>
          <div className="mt-4" />
          {followedTags?.length > 0 && (
            <FiltersDetails open>
              <Summary>
                <FiltersHeadline>
                  Followed tags ({followedTags.length})
                  <FiltersSummaryArrow />
                </FiltersHeadline>
              </Summary>
              <FiltersList className="-my-2">
                {followedTags.map((tag) => (
                  <Tag
                    tag={tag}
                    selected
                    key={tag}
                    onClick={onUnfollowTag}
                    tooltip="Unfollow tag"
                  />
                ))}
              </FiltersList>
            </FiltersDetails>
          )}
          {blockedTags?.length > 0 && (
            <FiltersDetails open>
              <Summary>
                <FiltersHeadline>
                  Blocked tags ({blockedTags.length})
                  <FiltersSummaryArrow />
                </FiltersHeadline>
              </Summary>
              <FiltersList className="-my-2">
                {blockedTags.map((tag) => (
                  <Tag
                    tag={tag}
                    key={tag}
                    onClick={onUnblockTag}
                    tooltip="Unblock tag"
                  />
                ))}
              </FiltersList>
            </FiltersDetails>
          )}
          {availableTags?.length > 0 && (
            <FiltersDetails open>
              <Summary>
                <FiltersHeadline>
                  All tags ({availableTags.length})
                  <FiltersSummaryArrow />
                </FiltersHeadline>
              </Summary>
              <FiltersList className="-my-2">
                {availableTags?.map((tag) => (
                  <Tag
                    tag={tag}
                    key={tag}
                    onClick={onOptions}
                    tooltip="Options"
                    menu
                  />
                ))}
              </FiltersList>
            </FiltersDetails>
          )}
        </>
      )}
      <TagOptionsMenu
        onHidden={() => setSelectedTag(null)}
        onBlock={onBlockTag}
        onFollow={onFollowTag}
      />
    </FiltersContainer>
  );
}
