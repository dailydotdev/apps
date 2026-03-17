import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { sharePost } from '../../../../__tests__/fixture/post';
import {
  getSocialTwitterMetadata,
  getSocialTextDirectionProps,
  getSocialTextDirection,
  getSocialTwitterMetadataLabel,
} from './socialTwitterHelpers';

const basePost: Post = {
  ...sharePost,
  type: PostType.SocialTwitter,
  subType: 'quote',
  sharedPost: {
    ...sharePost.sharedPost,
    type: PostType.SocialTwitter,
  },
};

describe('getSocialTwitterMetadata', () => {
  it('prefers author image when it is available', () => {
    const authorImage = 'https://example.com/author-avatar.png';
    const creatorTwitterImage = 'https://example.com/creator-avatar.png';

    const { embeddedTweetAvatarUser } = getSocialTwitterMetadata({
      ...basePost,
      sharedPost: {
        ...basePost.sharedPost,
        creatorTwitterImage,
        author: {
          ...basePost.sharedPost.author,
          image: authorImage,
        },
      },
    });

    expect(embeddedTweetAvatarUser.image).toBe(authorImage);
  });

  it('prefers creator twitter image over source image for known sources', () => {
    const creatorTwitterImage = 'https://example.com/creator-avatar.png';
    const sourceImage = 'https://example.com/source-logo.png';

    const { embeddedTweetAvatarUser } = getSocialTwitterMetadata({
      ...basePost,
      sharedPost: {
        ...basePost.sharedPost,
        creatorTwitterImage,
        author: {
          ...basePost.sharedPost.author,
          image: undefined,
        },
        source: {
          ...basePost.sharedPost.source,
          id: 'known-source',
          image: sourceImage,
        },
      },
    });

    expect(embeddedTweetAvatarUser.image).toBe(creatorTwitterImage);
  });

  it('uses creator twitter image for unknown sources', () => {
    const creatorTwitterImage = 'https://example.com/creator-avatar.png';

    const { embeddedTweetAvatarUser } = getSocialTwitterMetadata({
      ...basePost,
      sharedPost: {
        ...basePost.sharedPost,
        creatorTwitterImage,
        author: {
          ...basePost.sharedPost.author,
          image: undefined,
        },
        source: {
          ...basePost.sharedPost.source,
          id: 'unknown',
          image: 'https://example.com/source-logo.png',
        },
      },
    });

    expect(embeddedTweetAvatarUser.image).toBe(creatorTwitterImage);
  });

  it('falls back to source image when no author avatar is available', () => {
    const sourceImage = 'https://example.com/source-logo.png';

    const { embeddedTweetAvatarUser } = getSocialTwitterMetadata({
      ...basePost,
      sharedPost: {
        ...basePost.sharedPost,
        creatorTwitterImage: undefined,
        author: {
          ...basePost.sharedPost.author,
          image: undefined,
        },
        source: {
          ...basePost.sharedPost.source,
          image: sourceImage,
        },
      },
    });

    expect(embeddedTweetAvatarUser.image).toBe(sourceImage);
  });

  it('deduplicates handles case-insensitively', () => {
    const { metadataHandles } = getSocialTwitterMetadata({
      ...basePost,
      source: {
        ...basePost.source,
        handle: 'anthropicai',
      },
      sharedPost: {
        ...basePost.sharedPost,
        source: {
          ...basePost.sharedPost.source,
          handle: 'AnthropicAI',
        },
      },
    });

    expect(metadataHandles).toEqual(['anthropicai']);
  });

  it('keeps different handles', () => {
    const { metadataHandles } = getSocialTwitterMetadata({
      ...basePost,
      source: {
        ...basePost.source,
        handle: 'anthropicai',
      },
      sharedPost: {
        ...basePost.sharedPost,
        source: {
          ...basePost.sharedPost.source,
          handle: 'claudeai',
        },
      },
    });

    expect(metadataHandles).toEqual(['anthropicai', 'claudeai']);
  });

  it('returns the fixed x.com metadata label', () => {
    expect(getSocialTwitterMetadataLabel().props.children).toBe('From x.com');
  });
});

describe('getSocialTextDirection', () => {
  it('returns rtl for known rtl languages', () => {
    expect(getSocialTextDirection('he')).toBe('rtl');
    expect(getSocialTextDirection('ar-SA')).toBe('rtl');
    expect(getSocialTextDirection('fa_IR')).toBe('rtl');
  });

  it('returns auto for ltr and unknown languages', () => {
    expect(getSocialTextDirection('en')).toBe('auto');
    expect(getSocialTextDirection('ja')).toBe('auto');
    expect(getSocialTextDirection(undefined)).toBe('auto');
  });
});

describe('getSocialTextDirectionProps', () => {
  it('returns normalized lang with rtl direction when needed', () => {
    expect(getSocialTextDirectionProps('HE-IL')).toEqual({
      dir: 'rtl',
      lang: 'he-il',
    });
  });

  it('returns auto direction without lang when language is empty', () => {
    expect(getSocialTextDirectionProps('')).toEqual({ dir: 'auto' });
  });
});
