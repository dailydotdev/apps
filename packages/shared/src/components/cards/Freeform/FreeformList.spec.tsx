import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import post from '../../../../__tests__/fixture/post';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import type { Post } from '../../../graphql/posts';
import { PostType } from '../../../graphql/posts';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { generateQueryKey, RequestKey } from '../../../lib/query';
import { FreeformList } from './FreeformList';

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/' }),
}));

const socialBarTitle = 'Why not share it on social, too?';

const renderCopied = (overrides: Partial<Post>) => {
  const freeformPost: Post = {
    ...post,
    type: PostType.Freeform,
    contentHtml: '<p>Freeform</p>',
    ...overrides,
  };
  const client = new QueryClient();
  client.setQueryData(
    generateQueryKey(RequestKey.PostActions, { id: freeformPost.id }),
    { interaction: 'copy', previousInteraction: 'none' },
  );

  return render(
    <TestBootProvider client={client} auth={{ user: loggedUser }}>
      <FreeformList post={freeformPost} onPostClick={jest.fn()} />
    </TestBootProvider>,
  );
};

it('should show only the cover after copying a post with an image', async () => {
  renderCopied({});

  expect(await screen.findByText('Copied')).toBeInTheDocument();
  expect(screen.queryByText(socialBarTitle)).not.toBeInTheDocument();
});

it('should keep the social bar after copying a post without an image', async () => {
  renderCopied({ image: '' });

  expect(await screen.findByText(socialBarTitle)).toBeInTheDocument();
  expect(screen.queryByText('Copied')).not.toBeInTheDocument();
});
