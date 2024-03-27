import React, { ReactElement } from 'react';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import CommentInputPage from '@dailydotdev/shared/src/components/comments/CommentInputPage';
import { NextSeo, NextSeoProps } from 'next-seo';
import { defaultOpenGraph, defaultSeo } from '../../../../../next-seo';

export interface Props {
  id: string;
  commentId: string;
}

const seo: NextSeoProps = {
  title: 'Edit comment',
  openGraph: { ...defaultOpenGraph },
  ...defaultSeo,
};

const EditCommentPage = ({ id, commentId }: Props): ReactElement => {
  return (
    <>
      <NextSeo {...seo} titleTemplate="%s | daily.dev" noindex nofollow />
      <CommentInputPage postId={id} editCommentId={commentId} />
    </>
  );
};

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

interface EditCommentPageParams extends ParsedUrlQuery {
  id: string;
  commentId: string;
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<EditCommentPageParams>): Promise<
  GetStaticPropsResult<Props>
> {
  const { id, commentId } = params;
  return {
    props: {
      id,
      commentId,
    },
    revalidate: 60,
  };
}

export default EditCommentPage;
