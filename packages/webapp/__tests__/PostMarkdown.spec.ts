import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import type { PostMarkdownPost, SimilarPost } from '../lib/postMarkdown';
import { buildPostMarkdown } from '../lib/postMarkdown';

const createPost = (
  overrides: Partial<PostMarkdownPost> = {},
): PostMarkdownPost =>
  ({
    id: 'p1',
    slug: 'why-react-rerenders-twice-abc123',
    title: 'Why your React app re-renders twice',
    type: PostType.Article,
    url: 'https://blog.example.com/react-rerenders',
    permalink: 'https://api.daily.dev/r/abc123',
    commentsPermalink:
      'https://daily.dev/posts/why-react-rerenders-twice-abc123',
    summary: 'StrictMode double-invokes renders in development only.',
    createdAt: '2026-07-14T09:12:00.000Z',
    updatedAt: '2026-07-20T11:03:00.000Z',
    readTime: 7,
    tags: ['react', 'webdev'],
    numUpvotes: 412,
    numComments: 38,
    author: { name: 'Gergely Orosz', username: 'gergely', reputation: 4200 },
    source: {
      handle: 'pragmatic',
      name: 'The Pragmatic Engineer',
      public: true,
    },
    ...overrides,
  } as PostMarkdownPost);

const createComment = (overrides: Partial<Comment> = {}): Comment =>
  ({
    id: 'c1',
    content: 'The double render is StrictMode in dev only.',
    contentHtml: '<p>The double render is StrictMode in dev only.</p>',
    createdAt: '2026-07-14T10:00:00.000Z',
    permalink: 'https://daily.dev/posts/x#c-c1',
    numUpvotes: 24,
    numAwards: 0,
    author: { username: 'gergely', name: 'Gergely Orosz' },
    ...overrides,
  } as Comment);

const build = (
  post = createPost(),
  comments: Comment[] = [],
  similarPosts: SimilarPost[] = [],
) => buildPostMarkdown({ post, comments, similarPosts });

describe('buildPostMarkdown', () => {
  it('emits frontmatter with the canonical and original urls', () => {
    const markdown = build();

    expect(markdown).toContain(
      'url: https://daily.dev/posts/why-react-rerenders-twice-abc123',
    );
    expect(markdown).toContain(
      'source_url: https://blog.example.com/react-rerenders',
    );
    expect(markdown).toContain('type: article');
    expect(markdown).toContain('reading_time: 7');
    expect(markdown).toContain('upvotes: 412');
    expect(markdown).toContain('tags: ["react", "webdev"]');
  });

  it('quotes frontmatter values so colons cannot break the yaml', () => {
    const markdown = build(
      createPost({ title: 'React: the good parts', source: { name: 'A: B' } }),
    );

    expect(markdown).toContain('title: "React: the good parts"');
    expect(markdown).toContain('source: "A: B"');
  });

  it('falls back to the canonical url when the post has no external url', () => {
    const markdown = build(
      createPost({ type: PostType.Freeform, url: undefined, content: 'Hello' }),
    );

    expect(markdown).toContain(
      'source_url: https://daily.dev/posts/why-react-rerenders-twice-abc123',
    );
  });

  it('links out instead of reproducing an external article body', () => {
    const markdown = build(createPost({ content: 'scraped body text' }));

    expect(markdown).toContain('## Full article');
    expect(markdown).toContain('<https://blog.example.com/react-rerenders>');
    expect(markdown).not.toContain('scraped body text');
  });

  it('inlines the body for daily.dev-native posts', () => {
    const markdown = build(
      createPost({
        type: PostType.Freeform,
        url: undefined,
        content: '## My heading\n\nSome squad content.',
      }),
    );

    expect(markdown).toContain('## Content');
    expect(markdown).toContain('Some squad content.');
    expect(markdown).not.toContain('## Full article');
  });

  it('renders top comments as blockquotes', () => {
    const markdown = build(createPost(), [createComment()]);

    expect(markdown).toContain('## Community discussion');
    expect(markdown).toContain('**@gergely** · 24 upvotes');
    expect(markdown).toContain(
      '> The double render is StrictMode in dev only.',
    );
  });

  it('skips the discussion section when no comment has a body', () => {
    const markdown = build(createPost(), [createComment({ content: '' })]);

    expect(markdown).not.toContain('## Community discussion');
  });

  it('renders the community take when the post has one', () => {
    const markdown = build(
      createPost({
        communitySentiment: {
          breakdown: { positive: 62, mixed: 24, critical: 14 },
          tldr: 'Most agree it is a dev-only behaviour.',
          postCount: 2,
          sources: ['Hacker News', 'Lobsters'],
          pros: ['Clear explanation of StrictMode'],
          cons: ['Skips the React 18 changes'],
          bySource: [
            {
              source: 'Hacker News',
              lean: 'positive',
              note: 'Broadly agrees',
              url: 'https://news.ycombinator.com/item?id=1',
            },
          ],
          hottestDebate: 'Whether StrictMode should ship by default.',
          openQuestions: ['Does this change in React 19?'],
          highlights: [
            {
              quote: 'Production renders once.',
              author: 'someone',
              source: 'Hacker News',
              url: 'https://news.ycombinator.com/item?id=2',
              metrics: { points: 214, replies: 88 },
            },
          ],
          discussions: [
            {
              provider: 'hackernews',
              url: 'https://news.ycombinator.com/item?id=1',
              points: 214,
              commentsCount: 88,
            },
          ],
          updatedAt: '2026-07-18T00:00:00.000Z',
        },
      }),
    );

    expect(markdown).toContain('## Community take');
    expect(markdown).toContain(
      'aggregated from 2 discussions and 88 comments across Hacker News, Lobsters (as of 2026-07-18).',
    );
    expect(markdown).toContain(
      '**TL;DR:** Most agree it is a dev-only behaviour.',
    );
    expect(markdown).toContain('62% positive · 24% mixed · 14% skeptical');
    expect(markdown).toContain('**The case for**');
    expect(markdown).toContain('**Hottest debate:**');
    expect(markdown).toContain('> Production renders once.');
    expect(markdown).toContain('214 points · 88 comments');
  });

  it('omits the community take when the post has none', () => {
    expect(build()).not.toContain('## Community take');
  });

  it('lists similar posts with their canonical urls', () => {
    const markdown = build(
      createPost(),
      [],
      [
        {
          id: 'p2',
          title: 'useEffect gotchas',
          slug: 'useeffect-gotchas-def456',
          commentsPermalink: 'https://daily.dev/posts/useeffect-gotchas-def456',
          numUpvotes: 120,
          numComments: 14,
          source: { name: 'Overreacted' },
        },
      ],
    );

    expect(markdown).toContain('## Similar posts on daily.dev');
    expect(markdown).toContain(
      '- [useEffect gotchas](https://daily.dev/posts/useeffect-gotchas-def456) · Overreacted · 120 upvotes · 14 comments',
    );
  });

  it('omits the similar posts section when there are none', () => {
    expect(build()).not.toContain('## Similar posts');
  });

  it('never leaves more than one blank line between blocks', () => {
    expect(build(createPost(), [createComment()])).not.toMatch(/\n{3,}/);
  });
});
