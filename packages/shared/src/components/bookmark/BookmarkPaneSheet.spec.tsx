import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import post from '../../../__tests__/fixture/post';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import type { Post } from '../../graphql/posts';
import { BookmarkPaneSheet } from './BookmarkPaneSheet';

const renderSheet = (bookmark: Post['bookmark']) =>
  render(
    <TestBootProvider client={new QueryClient()} auth={{ user: loggedUser }}>
      <BookmarkPaneSheet
        post={{ ...post, bookmarked: true, bookmark } as Post}
        onRemove={() => Promise.resolve()}
      />
    </TestBootProvider>,
  );

it('should show the note with the bookmark actions', () => {
  renderSheet({ createdAt: new Date(), note: 'Read before the rewrite' });
  expect(screen.getByText('Read before the rewrite')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Mark as read' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Archive' })).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Remove bookmark' }),
  ).toBeInTheDocument();
});

it('should offer a note and the undo labels for a read, archived bookmark', () => {
  renderSheet({
    createdAt: new Date(),
    read: true,
    archivedAt: new Date(),
    remindAt: new Date(),
  });
  expect(
    screen.getByRole('button', { name: 'Add a note' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Mark as unread' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Restore from archive' }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Edit reminder' }),
  ).toBeInTheDocument();
});
