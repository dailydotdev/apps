import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import CommentInputPage from '@dailydotdev/shared/src/components/comments/CommentInputPage';
import { NextSeo, NextSeoProps } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../../../../next-seo';

interface Props {
  id: string;
}

const seo: NextSeoProps = {
  title: 'Post comment',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const NewCommentPage = ({ id }: Props): ReactElement => {
  const router = useRouter();
  const replyCommentId = router.query.replyTo as string;

  return (
    <>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" noindex nofollow />
      <CommentInputPage postId={id} replyCommentId={replyCommentId} />
    </>
  );
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface NewCommentPageParams extends ParsedUrlQuery {
  id: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<NewCommentPageParams>): Promise<
  GetStaticPropsResult<Props>
> {
  const { id } = params;
  return {
    props: {
      id,
    },
    revalidate: 60,
  };
}

export default NewCommentPage;
