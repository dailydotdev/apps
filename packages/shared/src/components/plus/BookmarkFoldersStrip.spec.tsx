import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { BookmarkFoldersStrip } from './BookmarkFoldersStrip';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { LogEvent, TargetId } from '../../lib/log';

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

const logEvent = jest.fn();

const renderStrip = ({ isPlus = false }: { isPlus?: boolean } = {}) => {
  const client = new QueryClient();
  client.setQueryData(feedQueryKey, {
    pages: [
      {
        page: {
          edges: tagsPerPost.map((tags, index) => ({
            node: {
              itemType: 'post',
              feedMeta: null,
              post: { id: `post-${index}`, tags },
            },
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
      log={{ logEvent }}
    >
      <BookmarkFoldersStrip feedQueryKey={feedQueryKey} />
    </TestBootProvider>,
  );
};

describe('BookmarkFoldersStrip', () => {
  it('should suggest folders from the loaded bookmarks', async () => {
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

  it('should log its impression and click under its own target', async () => {
    logEvent.mockClear();
    renderStrip();

    fireEvent.click(await screen.findByRole('link', { name: 'Get Plus' }));

    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.Impression,
        target_id: TargetId.BookmarksStrip,
      }),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.UpgradeSubscription,
        target_id: TargetId.BookmarksStrip,
      }),
    );
  });
});
