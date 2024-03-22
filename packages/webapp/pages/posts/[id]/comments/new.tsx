import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import { ParsedUrlQuery } from 'querystring';
import CommentInputPage from '@dailydotdev/shared/src/components/comments/CommentInputPage';

const NewCommentPage = (): ReactElement => {
  const router = useRouter();
  const id = router.query.id as string;
  const replyCommentId = router.query.replyTo as string;

  return <CommentInputPage id={id} replyCommentId={replyCommentId} />;
};

// export async function getStaticPaths(): Promise<GetStaticPathsResult> {
//   return { paths: [], fallback: true };
// }

interface NewCommentPageParams extends ParsedUrlQuery {
  id: string;
}

// export async function getStaticProps({
//   params,
// }: GetStaticPropsContext<NewCommentPageParams>): Promise<
//   GetStaticPropsResult<Props>
// > {
//   const { id } = params;
//   return {
//     props: {
//       id,
//     },
//     revalidate: 60,
//   };
// }

export default NewCommentPage;
