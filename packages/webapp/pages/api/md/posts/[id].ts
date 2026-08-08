import type { NextApiRequest, NextApiResponse } from 'next';
import type { ClientError } from 'graphql-request';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import type {
  PostMarkdownPost,
  SimilarPost,
} from '../../../../lib/postMarkdown';
import {
  buildPostMarkdown,
  getSimilarPostsVariables,
  POST_MARKDOWN_COMMENTS_QUERY,
  POST_MARKDOWN_QUERY,
  POST_MARKDOWN_SIMILAR_QUERY,
  TOP_COMMENTS_COUNT,
} from '../../../../lib/postMarkdown';
import { getAppOrigin, shouldNoindexPost } from '../../../../lib/seo';

const appOrigin = getAppOrigin();

const sendNotFound = (res: NextApiResponse, id: string): void => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Vary', 'Accept');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res
    .status(404)
    .send(
      `# Not found\n\nNo public post is available at ${appOrigin}/posts/${id}.\n`,
    );
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed');
    return;
  }

  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  if (!id) {
    sendNotFound(res, '');
    return;
  }

  try {
    const { post } = await gqlClient.request<{ post: PostMarkdownPost }>(
      POST_MARKDOWN_QUERY,
      { id },
    );

    // The same gate the HTML page uses for `noindex`. Private posts, private
    // squads, low-reputation authors and thin post types get no markdown twin.
    if (!post || shouldNoindexPost(post)) {
      sendNotFound(res, id);
      return;
    }

    const [comments, similar] = await Promise.all([
      gqlClient
        .request<{ topComments: Comment[] }>(POST_MARKDOWN_COMMENTS_QUERY, {
          postId: post.id,
          first: TOP_COMMENTS_COUNT,
        })
        .catch(() => ({ topComments: [] })),
      gqlClient
        .request<{ similarPosts: SimilarPost[] }>(
          POST_MARKDOWN_SIMILAR_QUERY,
          getSimilarPostsVariables(post),
        )
        .catch(() => ({ similarPosts: [] })),
    ]);

    const markdown = buildPostMarkdown({
      post,
      comments: comments.topComments ?? [],
      similarPosts: similar.similarPosts ?? [],
    });

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    // Set on the markdown variant only. The HTML page is ISR-cached and its
    // negotiation happens in middleware, which runs before the CDN lookup, so
    // adding Vary there would fragment the cache without changing behaviour.
    res.setHeader('Vary', 'Accept');
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=86400, stale-while-revalidate=604800',
    );
    res.setHeader('Link', '</llms.txt>; rel="llms-txt"');
    res.setHeader('X-Llms-Txt', '/llms.txt');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.status(200).send(markdown);
  } catch (error: unknown) {
    const errorCode = (error as ClientError)?.response?.errors?.[0]?.extensions
      ?.code;

    if (errorCode === ApiError.NotFound || errorCode === ApiError.Forbidden) {
      sendNotFound(res, id);
      return;
    }

    // eslint-disable-next-line no-console
    console.error('Error generating post markdown:', error);
    res
      .status(500)
      .send(
        `Unable to generate markdown. Please try again later or visit ${appOrigin}/posts/${id}`,
      );
  }
};

export default handler;
