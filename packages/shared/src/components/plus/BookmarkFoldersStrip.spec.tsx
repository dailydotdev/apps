import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { BookmarkFoldersStrip } from './BookmarkFoldersStrip';
import { generateQueryKey, RequestKey } from '../../lib/query';

const feedQueryKey = ['bookmarks-test'];

const tagsPerPost = [
  ['postgres', 'sql'],
  ['postgres'],
  ['react'],
  ['react', 'nextjs'],
  ['security'],
  ['security'],
  ['postgres'],
  ['rust'],
  ['react'],
  ['go'],
];

const renderStrip = ({ isPlus = false }: { isPlus?: boolean } = {}) => {
  const client = new QueryClient();
  client.setQueryData(feedQueryKey, {
    pages: [
      {
        page: {
          edges: tagsPerPost.map((tags, index) => ({
            node: { id: `post-${index}`, tags },
          })),
          pageInfo: { hasNextPage: false },
        },
      },
    ],
    pageParams: [''],
  });
  client.setQueryData(generateQueryKey(RequestKey.TagTitles), {
    postgres: 'PostgreSQL',
  });

  return render(
    <TestBootProvider
      client={client}
      auth={{ user: { ...loggedUser, isPlus } }}
    >
      <BookmarkFoldersStrip feedQueryKey={feedQueryKey} />
    </TestBootProvider>,
  );
};

describe('BookmarkFoldersStrip', () => {
  it('should name the folders Plus would sort the loaded bookmarks into', async () => {
    renderStrip();

    expect(await screen.findByText('PostgreSQL')).toBeInTheDocument();
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get Plus' })).toBeInTheDocument();
  });

  it('should not render for Plus members', () => {
    renderStrip({ isPlus: true });

    expect(
      screen.queryByRole('link', { name: 'Get Plus' }),
    ).not.toBeInTheDocument();
  });
});
