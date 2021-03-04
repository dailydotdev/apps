/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import React, { ReactElement, useContext, useMemo } from 'react';
import { getLayout } from '../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../components/layouts/MainFeedPage';
import {
  CustomFeedHeader,
  customFeedIcon,
  FeedPage,
} from '../../components/utilities';
import HashtagIcon from '../../icons/hashtag.svg';
import PlusIcon from '../../icons/plus.svg';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../../components/Feed';
import { TAG_FEED_QUERY } from '../../graphql/feed';
import AuthContext from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  FeedSettingsData,
  TAGS_SETTINGS_QUERY,
} from '../../graphql/feedSettings';
import Button, { ButtonProps } from '../../components/buttons/Button';
import useMutateFilters, {
  getTagsSettingsQueryKey,
} from '../../hooks/useMutateFilters';
import { trackEvent } from '../../lib/analytics';

type TagPageProps = { tag: string };

const Icon = styled(HashtagIcon)`
  ${customFeedIcon}
`;

const TagPage = ({ tag }: TagPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  // Must be memoized to prevent refreshing the feed
  const queryVariables = useMemo(() => ({ tag }), [tag]);

  const queryKey = getTagsSettingsQueryKey(user);
  const { data: feedSettings } = useQuery<FeedSettingsData>(
    queryKey,
    () => request(`${apiUrl}/graphql`, TAGS_SETTINGS_QUERY),
    {
      enabled: !!user && tokenRefreshed,
    },
  );

  const { followTag } = useMutateFilters(user);

  const showAddTag = useMemo(() => {
    if (!feedSettings?.feedSettings) {
      return true;
    }
    return (
      feedSettings.feedSettings.includeTags.findIndex(
        (includedTag) => tag === includedTag,
      ) < 0
    );
  }, [feedSettings, tag]);

  if (isFallback) {
    return <></>;
  }

  const seo: NextSeoProps = {
    title: `${tag} posts on daily.dev`,
    titleTemplate: '%s',
    openGraph: { ...defaultOpenGraph },
    ...defaultSeo,
  };

  const buttonCss = css`
    visibility: ${showAddTag ? 'visible' : 'hidden'};
  `;
  const buttonProps: ButtonProps<'button'> = {
    buttonSize: 'small',
    icon: <PlusIcon />,
    title: 'Add tag to feed',
    onClick: async (): Promise<void> => {
      trackEvent({
        category: 'Feed',
        action: 'Add Filter',
      });
      if (user) {
        await followTag({ tag });
      } else {
        showLogin();
      }
    },
  };

  return (
    <FeedPage>
      <NextSeo {...seo} />
      <CustomFeedHeader>
        <Icon />
        <span
          css={css`
            margin-right: auto;
          `}
        >
          {tag}
        </span>
        <Button className="btn-primary" {...buttonProps} css={buttonCss} />
        <Button className="btn-primary laptop" {...buttonProps} css={buttonCss}>
          Add to feed
        </Button>
      </CustomFeedHeader>
      <Feed
        query={TAG_FEED_QUERY}
        variables={queryVariables}
        css={css`
          margin-top: ${sizeN(3)};
          margin-bottom: ${sizeN(3)};
        `}
      />
    </FeedPage>
  );
};

TagPage.getLayout = getLayout;
TagPage.layoutProps = mainFeedLayoutProps;

export default TagPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface TagPageParams extends ParsedUrlQuery {
  tag: string;
}

export function getStaticProps({
  params,
}: GetStaticPropsContext<TagPageParams>): GetStaticPropsResult<TagPageProps> {
  return {
    props: {
      tag: params.tag,
    },
  };
}
