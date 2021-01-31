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
import {
  size1px,
  size2,
  size3,
  size4,
  size5,
  size6,
  size7,
  size9,
  sizeN,
} from '../styles/sizes';
import { ElementPlaceholder } from './utilities';
import { typoCallout } from '../styles/typography';
import SecondaryButton from '../components/buttons/SecondaryButton';
import Link from 'next/link';
import TertiaryButton from '../components/buttons/TertiaryButton';
import ArrowIcon from '../icons/arrow.svg';
import AuthContext from '../components/AuthContext';
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
} from '../lib/useMutateFilters';
import ReactGA from 'react-ga';

const Container = styled.main`
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: ${size4} ${size4} ${size4} ${size6};
`;

const PlaceholderContainer = styled.div`
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: ${size5};
  grid-row-gap: ${size7};
  margin-top: ${size9};
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const SectionHeadline = styled.h3`
  margin: ${size6} 0;
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
        width: ${size5};
        border-radius: ${sizeN(1.5)};
      `}
    />
  </div>
);

const TagsList = styled.ul`
  display: flex;
  flex-direction: column;
  margin: -${size2} 0;
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
      margin: ${size2} 0;
      padding: 0;
    `}
  >
    <SecondaryButton
      buttonSize="small"
      pressed={selected}
      onClick={() => onClick?.(tag)}
    >
      #{tag}
    </SecondaryButton>
    <div
      css={css`
        height: ${size1px};
        flex: 1;
        margin: 0 ${size3};
        background: var(--theme-divider-tertiary);
      `}
    />
    <Link href={`/tags/${tag}`} passHref prefetch={false}>
      <TertiaryButton
        tag="a"
        icon={
          <ArrowIcon
            style={{
              transform: 'rotate(90deg)',
            }}
          />
        }
      />
    </Link>
  </li>
);

export default function TagsFilter(): ReactElement {
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
      enabled: tokenRefreshed,
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

    ReactGA.event({
      category: 'Tags',
      action: 'Toggle',
      label: 'Check',
    });
    await followTag({ tag });
  };

  const onUnfollowTag = async (tag: string): Promise<void> => {
    ReactGA.event({
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
          margin-right: ${size2};
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
