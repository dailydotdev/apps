import { gql } from 'graphql-request';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import type { CommunitySentimentPost } from '@dailydotdev/shared/src/components/post/focus/CommunitySentiment';
import {
  escapeMarkdown,
  truncateAtWordBoundary,
} from '@dailydotdev/shared/src/lib/strings';
import { getAppOrigin, getLlmsTxtUrl, getPostCanonicalUrl } from './seo';

/** Post types whose body daily.dev hosts itself. Everything else links out. */
const NATIVE_CONTENT_TYPES = [
  PostType.Freeform,
  PostType.Welcome,
  PostType.Share,
  PostType.Collection,
];

const MAX_COMMENT_LENGTH = 600;
const SIMILAR_POSTS_COUNT = 5;
export const TOP_COMMENTS_COUNT = 5;

export interface PostMarkdownPost
  extends Pick<
    Post,
    | 'id'
    | 'slug'
    | 'title'
    | 'type'
    | 'permalink'
    | 'commentsPermalink'
    | 'content'
    | 'summary'
    | 'description'
    | 'createdAt'
    | 'updatedAt'
    | 'readTime'
    | 'tags'
    | 'language'
    | 'private'
    | 'numUpvotes'
    | 'numComments'
  > {
  url?: string;
  author?: { name?: string; username?: string; reputation?: number };
  source?: { handle?: string; name?: string; public?: boolean };
  sharedPost?: { title?: string; url?: string; summary?: string };
  communitySentiment?: CommunitySentimentPost | null;
}

export interface SimilarPost {
  id: string;
  title?: string;
  slug?: string;
  commentsPermalink: string;
  numUpvotes?: number;
  numComments?: number;
  source?: { name?: string };
}

export const POST_MARKDOWN_QUERY = gql`
  query PostMarkdown($id: ID!) {
    post(id: $id) {
      id
      slug
      title
      type
      url
      permalink
      commentsPermalink
      content
      summary
      description
      createdAt
      updatedAt
      readTime
      tags
      language
      private
      numUpvotes
      numComments
      author {
        name
        username
        reputation
      }
      source {
        handle
        name
        public
      }
      sharedPost {
        title
        url
        summary
      }
      communitySentiment {
        breakdown {
          positive
          mixed
          critical
        }
        tldr
        postCount
        sources
        pros
        cons
        bySource {
          source
          lean
          note
          url
        }
        hottestDebate
        openQuestions
        highlights {
          quote
          author
          source
          url
          metrics {
            points
            replies
            likes
          }
        }
        discussions {
          provider
          url
          points
          commentsCount
        }
        updatedAt
      }
    }
  }
`;

/** Raw markdown bodies, unlike the `contentHtml` the page components render. */
export const POST_MARKDOWN_COMMENTS_QUERY = gql`
  query PostMarkdownComments($postId: ID!, $first: Int) {
    topComments(postId: $postId, first: $first) {
      id
      content
      createdAt
      permalink
      numUpvotes
      author {
        username
        name
      }
    }
  }
`;

export const POST_MARKDOWN_SIMILAR_QUERY = gql`
  query PostMarkdownSimilar($post: ID!, $tags: [String]!, $first: Int) {
    similarPosts: randomSimilarPostsByTags(
      tags: $tags
      post: $post
      first: $first
    ) {
      id
      title
      slug
      commentsPermalink
      numUpvotes
      numComments
      source {
        name
      }
    }
  }
`;

export const getSimilarPostsVariables = (
  post: PostMarkdownPost,
): { post: string; tags: string[]; first: number } => ({
  post: post.id,
  tags: post.tags ?? [],
  first: SIMILAR_POSTS_COUNT,
});

const yaml = (value: string): string => JSON.stringify(value);

const yamlList = (values: string[]): string =>
  `[${values.map(yaml).join(', ')}]`;

const postUrl = (post: Pick<Post, 'slug' | 'commentsPermalink'>): string =>
  post.slug ? getPostCanonicalUrl(post.slug) : post.commentsPermalink;

/**
 * The article this post points at. Native posts have no external URL, so they
 * resolve to their own canonical page rather than leaving the field empty.
 */
const sourceUrl = (post: PostMarkdownPost): string =>
  post.url || post.sharedPost?.url || postUrl(post);

/** The post's own body, when daily.dev hosts it. Empty for external articles. */
const nativeContent = (post: PostMarkdownPost): string =>
  NATIVE_CONTENT_TYPES.includes(post.type) ? post.content?.trim() ?? '' : '';

const buildFrontmatter = (post: PostMarkdownPost): string[] => {
  const lines = ['---'];
  lines.push(
    `title: ${yaml(post.title || post.sharedPost?.title || 'Untitled')}`,
  );
  lines.push(`url: ${postUrl(post)}`);
  lines.push(`source_url: ${sourceUrl(post)}`);
  lines.push(`type: ${post.type}`);

  if (post.source?.name) {
    lines.push(`source: ${yaml(post.source.name)}`);
  }

  const author = post.author?.name || post.author?.username;

  if (author) {
    lines.push(`author: ${yaml(author)}`);
  }

  if (post.createdAt) {
    lines.push(`published: ${post.createdAt}`);
  }

  if (post.updatedAt) {
    lines.push(`updated: ${post.updatedAt}`);
  }

  if (post.tags?.length) {
    lines.push(`tags: ${yamlList(post.tags)}`);
  }

  if (post.readTime) {
    lines.push(`reading_time: ${Math.round(post.readTime)}`);
  }

  lines.push(`upvotes: ${post.numUpvotes ?? 0}`);
  lines.push(`comments: ${post.numComments ?? 0}`);

  if (post.language) {
    lines.push(`language: ${post.language}`);
  }

  lines.push('---');

  return lines;
};

const buildByline = (post: PostMarkdownPost): string => {
  const parts: string[] = [];

  if (post.source?.name) {
    const name = escapeMarkdown(post.source.name);
    parts.push(
      post.source.handle
        ? `**[${name}](${getAppOrigin()}/sources/${post.source.handle})**`
        : `**${name}**`,
    );
  }

  if (post.author?.username) {
    parts.push(
      `[@${post.author.username}](${getAppOrigin()}/${post.author.username})`,
    );
  }

  if (post.readTime) {
    parts.push(`${Math.round(post.readTime)} min read`);
  }

  parts.push(`${post.numUpvotes ?? 0} upvotes`);
  parts.push(`${post.numComments ?? 0} comments`);

  return parts.join(' · ');
};

const buildBody = (post: PostMarkdownPost): string[] => {
  const content = nativeContent(post);

  if (content) {
    return ['## Content', '', content];
  }

  const url = sourceUrl(post);

  return [
    '## Full article',
    '',
    `daily.dev links to this article rather than hosting it. Read it at the original source: <${url}>`,
  ];
};

const buildSummary = (post: PostMarkdownPost): string[] => {
  const summary = post.summary || post.sharedPost?.summary || post.description;

  if (!summary?.trim()) {
    return [];
  }

  return ['## Summary', '', summary.trim(), ''];
};

const formatPercentage = (value: number): string => `${Math.round(value)}%`;

const buildCommunityTake = (post: PostMarkdownPost): string[] => {
  const take = post.communitySentiment;

  if (!take) {
    return [];
  }

  const lines = ['## Community take', ''];
  const { breakdown, discussions, sources, updatedAt } = take;

  const totalComments =
    discussions?.reduce((total, item) => total + item.commentsCount, 0) ?? 0;
  const volume = [
    `${take.postCount} discussion${take.postCount === 1 ? '' : 's'}`,
    totalComments > 0 ? `${totalComments} comments` : undefined,
  ]
    .filter(Boolean)
    .join(' and ');
  const across = sources?.length ? ` across ${sources.join(', ')}` : '';
  const asOf = updatedAt ? ` (as of ${updatedAt.slice(0, 10)})` : '';

  lines.push(
    `How the wider developer community reacted, aggregated from ${volume}${across}${asOf}.`,
  );
  lines.push('');

  if (take.tldr?.trim()) {
    lines.push(`**TL;DR:** ${take.tldr.trim()}`);
    lines.push('');
  }

  if (breakdown) {
    lines.push(
      `**Sentiment:** ${formatPercentage(
        breakdown.positive,
      )} positive · ${formatPercentage(
        breakdown.mixed,
      )} mixed · ${formatPercentage(breakdown.critical)} skeptical`,
    );
    lines.push('');
  }

  if (take.pros?.length) {
    lines.push('**The case for**');
    lines.push('');
    take.pros.forEach((pro) => lines.push(`- ${pro}`));
    lines.push('');
  }

  if (take.cons?.length) {
    lines.push('**The pushback**');
    lines.push('');
    take.cons.forEach((con) => lines.push(`- ${con}`));
    lines.push('');
  }

  if (take.bySource?.length) {
    lines.push('**By community**');
    lines.push('');
    take.bySource.forEach((entry) => {
      const label = entry.url
        ? `[${escapeMarkdown(entry.source)}](${entry.url})`
        : escapeMarkdown(entry.source);
      lines.push(`- ${label} (${entry.lean}): ${entry.note}`);
    });
    lines.push('');
  }

  if (take.hottestDebate?.trim()) {
    lines.push(`**Hottest debate:** ${take.hottestDebate.trim()}`);
    lines.push('');
  }

  if (take.openQuestions?.length) {
    lines.push('**Open questions**');
    lines.push('');
    take.openQuestions.forEach((question) => lines.push(`- ${question}`));
    lines.push('');
  }

  if (take.highlights?.length) {
    lines.push('**Highlights**');
    lines.push('');
    take.highlights.forEach((highlight) => {
      lines.push(`> ${highlight.quote.replace(/\n+/g, ' ')}`);
      const metrics = [
        highlight.metrics?.points
          ? `${highlight.metrics.points} points`
          : undefined,
        highlight.metrics?.replies
          ? `${highlight.metrics.replies} comments`
          : undefined,
        highlight.metrics?.likes
          ? `${highlight.metrics.likes} likes`
          : undefined,
      ].filter(Boolean);
      const attribution = [
        `${highlight.author} on ${highlight.source}`,
        metrics.length ? metrics.join(', ') : undefined,
      ]
        .filter(Boolean)
        .join(' · ');
      lines.push(`> — [${escapeMarkdown(attribution)}](${highlight.url})`);
      lines.push('');
    });
  }

  if (discussions?.length) {
    lines.push('**Source threads**');
    lines.push('');
    discussions.forEach((discussion) => {
      lines.push(
        `- [${escapeMarkdown(discussion.provider)}](${discussion.url}) · ${
          discussion.points
        } points · ${discussion.commentsCount} comments`,
      );
    });
    lines.push('');
  }

  return lines;
};

const buildComments = (comments: Comment[]): string[] => {
  const usable = comments
    .map((comment) => ({ comment, body: comment.content?.trim() ?? '' }))
    .filter(({ body }) => !!body);

  if (!usable.length) {
    return [];
  }

  const lines = [
    '## Community discussion',
    '',
    'Top comments from developers on daily.dev.',
    '',
  ];

  usable.forEach(({ comment, body }) => {
    const handle = comment.author?.username
      ? `@${comment.author.username}`
      : comment.author?.name || 'A daily.dev member';
    lines.push(
      `**${escapeMarkdown(handle)}** · ${comment.numUpvotes ?? 0} upvotes`,
    );
    lines.push('');
    truncateAtWordBoundary(body, MAX_COMMENT_LENGTH)
      .split('\n')
      .forEach((line) => lines.push(`> ${line}`.trimEnd()));
    lines.push('');
  });

  return lines;
};

const buildSimilarPosts = (posts: SimilarPost[]): string[] => {
  if (!posts.length) {
    return [];
  }

  const lines = ['## Similar posts on daily.dev', ''];

  posts.forEach((post) => {
    const meta = [
      post.source?.name ? escapeMarkdown(post.source.name) : undefined,
      `${post.numUpvotes ?? 0} upvotes`,
      `${post.numComments ?? 0} comments`,
    ].filter(Boolean);
    lines.push(
      `- [${escapeMarkdown(post.title || 'Untitled')}](${postUrl(
        post,
      )}) · ${meta.join(' · ')}`,
    );
  });

  lines.push('');

  return lines;
};

const buildFooter = (post: PostMarkdownPost): string[] => {
  const lines = ['---', ''];

  if (post.tags?.length) {
    const tags = post.tags
      .map((tag) => `[#${tag}](${getAppOrigin()}/tags/${tag})`)
      .join(', ');
    lines.push(`Tags: ${tags}`);
    lines.push('');
  }

  lines.push(`[View this post on daily.dev](${postUrl(post)})`);

  return lines;
};

export interface PostMarkdownInput {
  post: PostMarkdownPost;
  comments: Comment[];
  similarPosts: SimilarPost[];
}

export const buildPostMarkdown = ({
  post,
  comments,
  similarPosts,
}: PostMarkdownInput): string => {
  const title = post.title || post.sharedPost?.title || 'Untitled';

  const lines = [
    ...buildFrontmatter(post),
    '',
    '> ## Documentation Index',
    `> Fetch the complete documentation index at: ${getLlmsTxtUrl()}`,
    '> Use this file to discover all available pages before exploring further.',
    '',
    `# ${title}`,
    '',
    buildByline(post),
    '',
    ...buildSummary(post),
    ...buildBody(post),
    '',
    ...buildCommunityTake(post),
    ...buildComments(comments),
    ...buildSimilarPosts(similarPosts),
    ...buildFooter(post),
  ];

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
};
