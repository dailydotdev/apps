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
import { size2, size3, size6 } from '../../styles/sizes';
import { typoCallout } from '../../styles/typography';
import { useRouter } from 'next/router';
import { NextSeoProps } from 'next-seo/lib/types';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';
import { NextSeo } from 'next-seo';
import Feed from '../../components/Feed';
import { TAG_FEED_QUERY } from '../../graphql/feed';
import AuthContext from '../../components/AuthContext';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import request from 'graphql-request';
import { apiUrl } from '../../lib/config';
import {
  ADD_FILTERS_TO_FEED_MUTATION,
  FeedSettingsData,
  TAGS_SETTINGS_QUERY,
} from '../../graphql/feedSettings';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import ReactGA from 'react-ga';
import { ButtonProps } from '../../components/buttons/BaseButton';
import cloneDeep from 'lodash.clonedeep';
import { laptop } from '../../styles/media';

type TagPageProps = { tag: string };

const TagInformation = styled.div`
  display: flex;
  align-self: stretch;
  align-items: center;
  margin: ${size3} 0;
  color: var(--theme-label-secondary);
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
  font-size: ${size6};
  color: var(--theme-label-tertiary);
  margin-right: ${size2};
`;

const TagPage = ({ tag }: TagPageProps): ReactElement => {
  const { isFallback } = useRouter();
  const { user, showLogin, tokenRefreshed } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const queryKey = [user?.id, 'tags'];
  const { data: feedSettings } = useQuery<FeedSettingsData>(
    queryKey,
    () => request(`${apiUrl}/graphql`, TAGS_SETTINGS_QUERY),
    {
      enabled: !!user && tokenRefreshed,
    },
  );

  const { mutateAsync: addTag } = useMutation(
    () =>
      request(`${apiUrl}/graphql`, ADD_FILTERS_TO_FEED_MUTATION, {
        filters: {
          includeTags: [tag],
        },
      }),
    {
      onMutate: async () => {
        await queryClient.cancelQueries(queryKey);
        queryClient.setQueryData<FeedSettingsData>(queryKey, (cached) => {
          const newData = cloneDeep(cached);
          newData.feedSettings.includeTags.push(tag);
          return newData;
        });
        return () => {
          queryClient.setQueryData(queryKey, feedSettings);
        };
      },
      onError: (err, _, rollback) => rollback(),
    },
  );

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
      ReactGA.event({
        category: 'Feed',
        action: 'Add Filter',
      });
      if (user) {
        await addTag();
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
        variables={{ tag }}
        css={css`
          margin-top: ${size3};
          margin-bottom: ${size3};
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
