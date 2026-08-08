import type { Comment } from '@dailydotdev/shared/src/graphql/comments';
import type { Post } from '@dailydotdev/shared/src/graphql/posts';
import { PostType } from '@dailydotdev/shared/src/graphql/posts';
import {
  getBreadcrumbJsonLd,
  getCommentsJsonLd,
  getFaqJsonLd,
  getSEOJsonLd,
  getSeoDescription,
} from './PostSEOSchema';

const buildPost = (overrides: Partial<Post> = {}): Post =>
  ({
    id: 'post-id',
    slug: 'post-slug',
    title: 'A post title',
    permalink: 'https://app.daily.dev/posts/post-slug',
    commentsPermalink: 'https://app.daily.dev/posts/post-slug',
    type: PostType.Article,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:10:00.000Z',
    image: 'https://media.daily.dev/image.jpg',
    tags: ['react', 'typescript'],
    readTime: 5,
    language: 'en',
    numComments: 3,
    numUpvotes: 10,
    source: {
      id: 'source-id',
      name: 'daily.dev',
      image: 'https://media.daily.dev/source.jpg',
      permalink: 'https://app.daily.dev/sources/daily',
    },
    author: {
      id: 'author-id',
      name: 'Author Name',
      username: 'author',
      permalink: 'https://app.daily.dev/author',
      companies: [],
    },
    ...overrides,
  } as unknown as Post);

const buildComment = (overrides: Partial<Comment> = {}): Comment =>
  ({
    id: 'comment-id',
    contentHtml: '<p>Hello <strong>world</strong></p>',
    createdAt: '2026-01-01T01:00:00.000Z',
    lastUpdatedAt: '2026-01-01T01:05:00.000Z',
    permalink: 'https://app.daily.dev/posts/post-slug#comment',
    numUpvotes: 2,
    author: {
      id: 'comment-author-id',
      name: 'Commenter',
      username: 'commenter',
      permalink: 'https://app.daily.dev/commenter',
      companies: [],
    },
    children: { edges: [] },
    ...overrides,
  } as unknown as Comment);

describe('PostSEOSchema JSON-LD helpers', () => {
  it('returns parseable JSON-LD for article posts', () => {
    const post = buildPost();
    const jsonLd = getSEOJsonLd(post, [buildComment()]);

    expect(() => JSON.parse(jsonLd)).not.toThrow();
    expect(JSON.parse(jsonLd)).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
      }),
    );
  });

  it('returns parseable JSON-LD for user-generated posts', () => {
    const post = buildPost({
      type: PostType.Share,
      sharedPost: {
        title: 'Shared post',
        permalink: 'https://daily.dev/shared',
      },
    } as Partial<Post>);
    const jsonLd = getSEOJsonLd(post, [buildComment()]);

    expect(() => JSON.parse(jsonLd)).not.toThrow();
    expect(JSON.parse(jsonLd)).toEqual(
      expect.objectContaining({
        '@type': 'DiscussionForumPosting',
      }),
    );
  });

  it('returns parseable breadcrumb JSON-LD', () => {
    const post = buildPost();
    const breadcrumbJson = getBreadcrumbJsonLd(post);

    expect(() => JSON.parse(breadcrumbJson)).not.toThrow();
    expect(JSON.parse(breadcrumbJson)).toEqual(
      expect.objectContaining({
        '@type': 'BreadcrumbList',
      }),
    );
  });

  it('returns parseable comments JSON-LD for non-UGC posts', () => {
    const post = buildPost({ type: PostType.Article });
    const commentsJson = getCommentsJsonLd(post, [buildComment()]);

    expect(commentsJson).toBeTruthy();
    expect(() => JSON.parse(commentsJson as string)).not.toThrow();
  });

  it('truncates seo descriptions to 160 chars with ellipsis', () => {
    const longSummary = 'a'.repeat(220);
    const post = buildPost({ summary: longSummary });

    const description = getSeoDescription(post);

    expect(description.length).toBeLessThanOrEqual(163);
    expect(description.endsWith('...')).toBe(true);
  });
});

describe('getFaqJsonLd', () => {
  const questions = [
    {
      question: 'What session security defaults change in PHP 8.6?',
      answer: 'PHP 8.6 flips three session ini defaults to safer values.',
      cta: 'Teams shipping PHP upgrades track breaking changes like these on daily.dev.',
    },
  ];

  it('returns null when the post has no questions', () => {
    expect(getFaqJsonLd(buildPost())).toBeNull();
    expect(getFaqJsonLd(buildPost({ answeredQuestions: [] }))).toBeNull();
    expect(getFaqJsonLd(buildPost({ answeredQuestions: null }))).toBeNull();
  });

  it('emits a FAQPage entry per question', () => {
    const jsonLd = getFaqJsonLd(buildPost({ answeredQuestions: questions }));

    expect(jsonLd).not.toBeNull();
    const parsed = JSON.parse(jsonLd as string);
    expect(parsed['@type']).toEqual('FAQPage');
    expect(parsed.mainEntity).toHaveLength(1);
    expect(parsed.mainEntity[0]).toEqual(
      expect.objectContaining({
        '@type': 'Question',
        name: questions[0].question,
      }),
    );
  });

  it('appends the cta to the answer so attribution travels with an extracted quote', () => {
    const jsonLd = getFaqJsonLd(buildPost({ answeredQuestions: questions }));
    const parsed = JSON.parse(jsonLd as string);

    expect(parsed.mainEntity[0].acceptedAnswer.text).toEqual(
      `${questions[0].answer} ${questions[0].cta}`,
    );
  });

  it('omits a missing cta rather than emitting a trailing space', () => {
    const jsonLd = getFaqJsonLd(
      buildPost({
        answeredQuestions: [{ ...questions[0], cta: '' }],
      }),
    );
    const parsed = JSON.parse(jsonLd as string);

    expect(parsed.mainEntity[0].acceptedAnswer.text).toEqual(
      questions[0].answer,
    );
  });
});
