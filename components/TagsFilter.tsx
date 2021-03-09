/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import styled from '@emotion/styled';
import SearchField from '../components/fields/SearchField';
import sizeN from '../macros/sizeN.macro';
import rem from '../macros/rem.macro';
import { ElementPlaceholder } from './utilities';
import { typoCallout } from '../styles/typography';
import Link from 'next/link';
import ArrowIcon from '../icons/arrow.svg';
import AuthContext from '../contexts/AuthContext';
import { useQuery, useQueryClient } from 'react-query';
import {
  ALL_TAGS_AND_SETTINGS_QUERY,
  ALL_TAGS_QUERY,
  FeedSettingsData,
  SEARCH_TAGS_QUERY,
  SearchTagsData,
  TagsData,
} from '../graphql/feedSettings';
import request from 'graphql-request';
import { apiUrl } from '../lib/config';
import useMutateFilters, {
  getTagsSettingsQueryKey,
  getFiltersQueryKey,
  getSearchTagsQueryKey,
} from '../hooks/useMutateFilters';
import { trackEvent } from '../lib/analytics';
import Button from './buttons/Button';

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: ${sizeN(4)} ${sizeN(4)} ${sizeN(4)} ${sizeN(6)};
`;

const PlaceholderContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: ${sizeN(5)};
  grid-row-gap: ${sizeN(7)};
  margin-top: ${sizeN(9)};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const SectionHeadline = styled.h3`
  margin: ${sizeN(6)} 0;
  color: var(--theme-label-tertiary);
  font-weight: bold;
  ${typoCallout}
`;

const TagPlaceholder = (
  <div
    css={css`
      display: flex;
      justify-content: space-between;
    `}
  >
    <ElementPlaceholder
      css={css`
        width: ${sizeN(30)};
        border-radius: ${sizeN(1.5)};
      `}
    />
    <ElementPlaceholder
      css={css`
        width: ${sizeN(5)};
        border-radius: ${sizeN(1.5)};
      `}
    />
  </div>
);

const TagsList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: -${sizeN(2)} 0;
  padding: 0;
`;

const Tag = ({
  tag,
  selected,
  onClick,
}: {
  tag: string;
  selected?: boolean;
  onClick?: (tag: string) => Promise<unknown>;
}): ReactElement => (
  <li
    css={css`
      display: flex;
      align-items: center;
      margin: ${sizeN(2)} 0;
      padding: 0;
    `}
  >
    <Button
      buttonSize="small"
      pressed={selected}
      onClick={() => onClick?.(tag)}
      className="btn-secondary"
    >
      #{tag}
    </Button>
    <div
      css={css`
        height: ${rem(1)};
        flex: 1;
        margin: 0 ${sizeN(3)};
        background: var(--theme-divider-tertiary);
      `}
    />
    <Link href={`/tags/${tag}`} passHref prefetch={false}>
      <Button
        tag="a"
        icon={
          <ArrowIcon
            style={{
              transform: 'rotate(90deg)',
            }}
          />
        }
        className="btn-tertiary"
      />
    </Link>
  </li>
);

export type TagsFilterProps = {
  enableQueries?: boolean;
};

export default function TagsFilter({
  enableQueries = true,
}: TagsFilterProps): ReactElement {
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const [tagsQuery, setTagsQuery] = useState<string>(null);
  const enabledSearch = tagsQuery?.length > 0;
  const queryClient = useQueryClient();

  const filtersKey = getFiltersQueryKey(user);
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

  const searchKey = getSearchTagsQueryKey(tagsQuery);
  const { data: searchResults } = useQuery<SearchTagsData>(
    searchKey,
    () => request(`${apiUrl}/graphql`, SEARCH_TAGS_QUERY, { query: tagsQuery }),
    {
      enabled: enabledSearch,
    },
  );

  const { followTag, unfollowTag } = useMutateFilters(user);

  const isLoading = isLoadingQuery || !settingsAndTags;

  const allFollowedTags = settingsAndTags?.feedSettings?.includeTags;

  useEffect(() => {
    if (user && settingsAndTags) {
      queryClient.setQueryData(getTagsSettingsQueryKey(user), {
        feedSettings: settingsAndTags.feedSettings,
      });
    }
  }, [settingsAndTags, user]);

  const [availableTags, followedTags] = useMemo(() => {
    const tags = enabledSearch
      ? searchResults?.searchTags.tags
      : settingsAndTags?.tags;
    return (tags ?? []).reduce(
      ([notFollowed, followed], tag) => {
        const isFollowing = allFollowedTags?.indexOf(tag.name) >= 0;
        if (isFollowing) {
          followed.push(tag.name);
        } else {
          notFollowed.push(tag.name);
        }
        return [notFollowed, followed];
      },
      [[], []],
    );
  }, [settingsAndTags, searchResults]);

  const onFollowTag = async (tag: string): Promise<void> => {
    if (!user) {
      showLogin();
      return;
    }

    trackEvent({
      category: 'Tags',
      action: 'Toggle',
      label: 'Check',
    });
    await followTag({ tag });
  };

  const onUnfollowTag = async (tag: string): Promise<void> => {
    trackEvent({
      category: 'Tags',
      action: 'Toggle',
      label: 'Uncheck',
    });
    await unfollowTag({ tag });
  };

  return (
    <Container aria-busy={isLoading}>
      <SearchField
        inputId="search-tags"
        placeholder="Search"
        valueChanged={setTagsQuery}
        css={css`
          margin-right: ${sizeN(2)};
        `}
      />
      {isLoading ? (
        <PlaceholderContainer>
          {Array(5).fill(TagPlaceholder)}
        </PlaceholderContainer>
      ) : (
        <>
          {followedTags?.length > 0 && (
            <Section>
              <SectionHeadline
                css={css`
                  color: var(--theme-label-primary);
                `}
              >
                Tags you follow
              </SectionHeadline>
              <TagsList>
                {followedTags.map((tag) => (
                  <Tag tag={tag} selected key={tag} onClick={onUnfollowTag} />
                ))}
              </TagsList>
            </Section>
          )}
          {availableTags?.length > 0 && (
            <Section>
              <SectionHeadline
                css={css`
                  color: var(--theme-label-primary);
                `}
              >
                {followedTags?.length > 0
                  ? 'Everything else'
                  : 'Choose tags to follow'}
              </SectionHeadline>
              <TagsList>
                {availableTags?.map((tag) => (
                  <Tag tag={tag} key={tag} onClick={onFollowTag} />
                ))}
              </TagsList>
            </Section>
          )}
        </>
      )}
    </Container>
  );
}
