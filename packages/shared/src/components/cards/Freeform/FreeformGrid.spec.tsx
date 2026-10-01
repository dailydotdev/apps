import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { PostType } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { FreeformGrid } from './FreeformGrid';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

it('should keep the social cover after copying a post without an image', async () => {
  const freeformPost = {
    ...post,
    type: PostType.Freeform,
    image: '',
    contentHtml: '<p>No image here</p>',
  };
  const client = new QueryClient();
  client.setQueryData(
    generateQueryKey(RequestKey.PostActions, { id: freeformPost.id }),
    { interaction: 'copy', previousInteraction: 'none' },
  );

  render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <FreeformGrid post={freeformPost} onPostClick={jest.fn()} />
    </TestBootProvider>,
  );

  expect(
    await screen.findByText('Why not share it on social, too?'),
  ).toBeInTheDocument();
  expect(screen.queryByText('Connect Slack')).not.toBeInTheDocument();
  expect(screen.queryByText('Send to Slack')).not.toBeInTheDocument();
});
