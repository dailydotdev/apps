import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import post from '../../../__tests__/fixture/post';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { Origin } from '../../lib/log';
import { generateQueryKey, RequestKey } from '../../lib/query';
import PostEngagements from './PostEngagements';

const socialBarTitle = 'Why not share it on social, too?';
const upvoteBandTitle = 'Should anyone else see this post?';

const renderEngagements = (interaction: 'none' | 'upvote') => {
  const client = new QueryClient();
  client.setQueryData(
    generateQueryKey(RequestKey.PostActions, { id: post.id }),
    {
      interaction,
      previousInteraction: 'none',
    },
  );

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <PostEngagements post={post} logOrigin={Origin.ArticlePage} />
    </TestBootProvider>,
  );
};

const copyLink = () => {
  const button = document.querySelector('#copy-post-btn-post');
  if (!button) {
    throw new Error('copy link button not found');
  }
  fireEvent.click(button);
};

it('should show the social bar after copying the link', async () => {
  renderEngagements('none');
  copyLink();

  expect(await screen.findByText(socialBarTitle)).toBeInTheDocument();
  expect(screen.queryByText(upvoteBandTitle)).not.toBeInTheDocument();
});

it('should keep only the upvote share band after upvoting and copying', async () => {
  renderEngagements('upvote');
  copyLink();

  expect(await screen.findByText(upvoteBandTitle)).toBeInTheDocument();
  expect(screen.queryByText(socialBarTitle)).not.toBeInTheDocument();
});
