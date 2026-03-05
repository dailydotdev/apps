import React from 'react';
import { render, screen } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { sharePost } from '../../../../__tests__/fixture/post';
import {
  getSocialTwitterMetadata,
  getSocialTextDirectionProps,
  getSocialTextDirection,
  getSocialTwitterMetadataLabel,
} from './socialTwitterHelpers';

jest.mock('../../icons', () => ({
  TwitterIcon: () => <span data-testid="twitter-icon" />,
}));

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

  it('shows X icon for multi-handle metadata labels', () => {
    render(
      getSocialTwitterMetadataLabel({
        metadataHandles: ['anthropicai', 'claudeai'],
      }),
    );

    expect(screen.getByTestId('twitter-icon')).toBeInTheDocument();
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
