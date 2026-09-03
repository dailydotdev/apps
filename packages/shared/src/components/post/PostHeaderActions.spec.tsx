import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { featurePostCopyLink } from '../../lib/featureManagement';
import { PostHeaderActions } from './PostHeaderActions';

const withFlag = () => {
  const gb = new GrowthBook();
  gb.setFeatures({ [featurePostCopyLink.id]: { defaultValue: true } });

  return gb;
};

const renderActions = (postToRender: Post, gb?: GrowthBook) =>
  render(
    <TestBootProvider client={new QueryClient()} gb={gb}>
      <PostHeaderActions
        contextMenuId="post-header-actions-spec"
        onReadArticle={jest.fn()}
        post={postToRender}
      />
    </TestBootProvider>,
  );

const copyLink = () => screen.queryByLabelText('Copy link');

describe('PostHeaderActions copy link', () => {
  // The cluster is shared by every type, and the ask was every type.
  it.each([
    PostType.Article,
    PostType.Share,
    PostType.Freeform,
    PostType.Welcome,
    PostType.Collection,
    PostType.VideoYouTube,
    PostType.Poll,
  ])('offers the link on a %s post', (type) => {
    renderActions({ ...post, type } as Post, withFlag());

    expect(copyLink()).toBeInTheDocument();
  });

  it('stays out of the header when the flag is disabled', () => {
    renderActions(post);

    expect(copyLink()).not.toBeInTheDocument();
  });

  it('sits before the options menu, so it reads as part of that cluster', () => {
    renderActions(post, withFlag());

    const link = copyLink();
    const options = screen.getByLabelText('Options');
    expect(link?.compareDocumentPosition(options)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
