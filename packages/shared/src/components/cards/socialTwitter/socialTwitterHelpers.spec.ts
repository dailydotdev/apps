import { render } from '@testing-library/react';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { sharePost } from '../../../../__tests__/fixture/post';
import {
  getSocialTwitterMetadata,
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
    const { container } = render(
      getSocialTwitterMetadataLabel({
        metadataHandles: ['anthropicai', 'claudeai'],
      }),
    );

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
