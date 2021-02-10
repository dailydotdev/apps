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
import { FeedPage } from '../../components/utilities';
import HashtagIcon from '../../icons/hashtag.svg';
import PlusIcon from '../../icons/plus.svg';
import styled from '@emotion/styled';
import sizeN from '../../macros/sizeN.macro';
import { typoCallout } from '../../styles/typography';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../../components/Feed';
import { TAG_FEED_QUERY } from '../../graphql/feed';
import AuthContext from '../../components/AuthContext';
import { useQuery } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  FeedSettingsData,
  TAGS_SETTINGS_QUERY,
} from '../../graphql/feedSettings';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import { ButtonProps } from '../../components/buttons/BaseButton';
import { laptop } from '../../styles/media';
import useMutateFilters, {
  getTagsSettingsQueryKey,
} from '../../lib/useMutateFilters';
import { trackEvent } from '../../lib/analytics';

type TagPageProps = { tag: string };

const TagInformation = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;
  margin-bottom: ${sizeN(3)};
  color: var(--theme-label-secondary);
  font-weight: bold;
  ${typoCallout}

  button.laptop {
    display: none;
  }

  ${laptop} {
    button {
      display: none;

      &.laptop {
        display: flex;
      }
    }
  }
`;

const Icon = styled(HashtagIcon)`
  font-size: ${sizeN(6)};
  color: var(--theme-label-tertiary);
  margin-right: ${sizeN(2)};
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
      <TagInformation>
        <Icon />
        <span
          css={css`
            margin-right: auto;
          `}
        >
          {tag}
        </span>
        <PrimaryButton {...buttonProps} css={buttonCss} />
        <PrimaryButton className="laptop" {...buttonProps} css={buttonCss}>
          Add to feed
        </PrimaryButton>
      </TagInformation>
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
