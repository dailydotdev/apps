import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import type { ParsedUrlQuery } from 'querystring';
import type { ClientError } from 'graphql-request';
import type { NextSeoProps } from 'next-seo/lib/types';
import Head from 'next/head';
import classNames from 'classnames';
import type { Post, PostData } from '@dailydotdev/shared/src/graphql/posts';
import { POST_BY_ID_STATIC_FIELDS_QUERY } from '@dailydotdev/shared/src/graphql/posts';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import { usePostById } from '@dailydotdev/shared/src/hooks';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { ActivePostContextProvider } from '@dailydotdev/shared/src/contexts/ActivePostContext';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import type { FocusCardLeftVariant } from '@dailydotdev/shared/src/components/post/discovery/PostFocusCard';
import { PostDiscoveryLayout } from '@dailydotdev/shared/src/components/post/discovery/PostDiscoveryLayout';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { getLayout } from '../../../components/layouts/MainLayout';
import FooterNavBarLayout from '../../../components/layouts/FooterNavBarLayout';
import { getSeoDescription } from '../../../components/PostSEOSchema';
import { getPageSeoTitles } from '../../../components/layouts/utils';
import type { DynamicSeoProps } from '../../../components/common';
import { seoTitle } from './index';

export interface Props extends DynamicSeoProps {
  id: string;
  initialData?: PostData;
  error?: ApiError;
}

interface VariantControlProps {
  leftVariant: FocusCardLeftVariant;
  onChange: (variant: FocusCardLeftVariant) => void;
}

const VariantControl = ({
  leftVariant,
  onChange,
}: VariantControlProps): ReactElement => {
  const options: { id: FocusCardLeftVariant; label: string }[] = [
    { id: 'lean', label: 'Lean' },
    { id: 'rich', label: 'Rich' },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[75rem] items-center gap-3 px-4 pt-4 tablet:px-6 laptop:px-8">
      <span className="text-text-tertiary typo-footnote">Mockup · content</span>
      <div className="flex items-center gap-1 rounded-12 border border-border-subtlest-tertiary bg-surface-float p-1">
        {options.map((option) => (
          <Button
            key={option.id}
            type="button"
            size={ButtonSize.XSmall}
            variant={
              leftVariant === option.id
                ? ButtonVariant.Primary
                : ButtonVariant.Tertiary
            }
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export const PostDiscoveryPage = ({ id, initialData }: Props): ReactElement => {
  const [leftVariant, setLeftVariant] = useState<FocusCardLeftVariant>('rich');
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });

  if (isLoading) {
    return (
      <div
        className={classNames(
          'flex min-h-page w-full items-center justify-center',
        )}
      >
        <Loader />
      </div>
    );
  }

  if (!post || isError) {
    return (
      <div className="flex min-h-page w-full items-center justify-center text-text-tertiary typo-title3">
        Post not found
      </div>
    );
  }

  return (
    <ActivePostContextProvider post={post}>
      <FooterNavBarLayout post={post}>
        <Head>
          <link as="image" href={post?.image} rel="preload" />
        </Head>
        <VariantControl leftVariant={leftVariant} onChange={setLeftVariant} />
        <PostDiscoveryLayout
          leftVariant={leftVariant}
          origin={Origin.ArticlePage}
          post={post}
        />
      </FooterNavBarLayout>
    </ActivePostContextProvider>
  );
};

PostDiscoveryPage.getLayout = getLayout;
PostDiscoveryPage.layoutProps = {
  screenCentered: false,
};

export default PostDiscoveryPage;

export interface PostParams extends ParsedUrlQuery {
  id: string;
}

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<GetStaticPropsResult<Props>> {
  if (!params?.id) {
    return { notFound: true, revalidate: 60 };
  }

  const { id } = params;
  try {
    const initialData = await gqlClient.request<PostData>(
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );
    const post = initialData.post as Post;
    const pageSeoTitles = getPageSeoTitles(seoTitle(post) ?? '');
    const seo: NextSeoProps = {
      canonical: post?.slug ? `${webappUrl}posts/${post.slug}` : undefined,
      title: pageSeoTitles.title,
      description: getSeoDescription(post),
      // This is an internal mockup surface; keep it out of the index.
      noindex: true,
      nofollow: true,
    };

    return {
      props: { id: initialData.post.id, initialData, seo },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errorCode = clientError?.response?.errors?.[0]?.extensions?.code;
    if (errorCode === ApiError.NotFound) {
      return { notFound: true, revalidate: 60 };
    }

    return { props: { id, error: errorCode as ApiError }, revalidate: 60 };
  }
}
