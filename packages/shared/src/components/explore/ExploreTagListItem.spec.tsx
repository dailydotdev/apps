import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { ExploreTagListItem } from './ExploreTagListItem';

const onToggleFollow = jest.fn();

const renderItem = (isFollowed: boolean) =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <ul>
        <ExploreTagListItem
          tag="react"
          isFollowed={isFollowed}
          onToggleFollow={onToggleFollow}
        />
      </ul>
    </TestBootProvider>,
  );

beforeEach(() => jest.clearAllMocks());

it('links to the topic and offers a follow action when not followed', () => {
  renderItem(false);

  expect(screen.getByText('React').closest('a')).toHaveAttribute(
    'href',
    expect.stringContaining('tags/react'),
  );
  fireEvent.click(screen.getByLabelText('Follow react'));
  expect(onToggleFollow).toHaveBeenCalledWith('react');
});

it('shows a followed indicator (unfollow action) when followed', () => {
  renderItem(true);

  fireEvent.click(screen.getByLabelText('Unfollow react'));
  expect(onToggleFollow).toHaveBeenCalledWith('react');
});
