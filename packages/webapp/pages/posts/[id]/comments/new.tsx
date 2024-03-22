import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import CommentInputPage from '@dailydotdev/shared/src/components/comments/CommentInputPage';

interface Props {
  id: string;
}

const NewCommentPage = ({ id }): ReactElement => {
  const router = useRouter();
  const replyCommentId = router.query.replyTo as string;

  return <CommentInputPage postId={id} replyCommentId={replyCommentId} />;
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
