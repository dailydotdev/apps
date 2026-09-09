import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { postWithCommunitySentiment as post } from '../../../__tests__/fixture/post';
import type { Post } from '../../graphql/posts';
import { PostType } from '../../graphql/posts';
import { Origin } from '../../lib/log';
import { PostMenuOptions } from './PostMenuOptions';

const renderActions = (postToRender: Post) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <PostMenuOptions origin={Origin.ArticlePage} post={postToRender} />
    </TestBootProvider>,
  );

const copyLink = () => screen.queryByLabelText('Copy link');

describe('PostMenuOptions copy link', () => {
  // Every post type builds its own header, but all of them render this menu,
  // which is why the link hangs off it rather than off any one header.
  it.each([
    PostType.Article,
    PostType.Share,
    PostType.Freeform,
    PostType.Welcome,
    PostType.Collection,
    PostType.VideoYouTube,
    PostType.Poll,
  ])('offers the link on a %s post', (type) => {
    renderActions({ ...post, type } as Post);

    expect(copyLink()).toBeInTheDocument();
  });

  it('sits before the menu button, so it reads as part of that cluster', () => {
    renderActions(post);

    const link = copyLink();
    const options = screen.getByLabelText('Options');
    expect(link?.compareDocumentPosition(options)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
