import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import loggedUser from '../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { FeedWidgetGallery } from './FeedWidgetGallery';
import { FeedWidgetKind } from './types';

const onAdd = jest.fn();

const renderGallery = (optOutReadingStreak: boolean) =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      settings={{ optOutReadingStreak }}
    >
      <FeedWidgetGallery
        widgets={[]}
        canAdd
        onAdd={onAdd}
        onRequestClose={jest.fn()}
      />
    </TestBootProvider>,
  );

const streakRow = () =>
  screen.getByText('Streak').closest('div') as HTMLElement;

beforeEach(() => {
  jest.clearAllMocks();
});

it('offers Streak but explains how to turn streaks on when they are off', () => {
  renderGallery(true);

  const add = within(streakRow()).getByRole('button', {
    name: 'Turn on "Show reading streaks" in Streaks & gamification settings to add this widget.',
  });
  expect(add).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(add);
  expect(onAdd).not.toHaveBeenCalled();
});

it('adds Streak when streaks are on', () => {
  renderGallery(false);

  const row = streakRow();
  const add = within(row).getByRole('button', { name: 'Add' });
  expect(add).toBeEnabled();
  fireEvent.click(add);
  expect(onAdd).toHaveBeenCalledWith(FeedWidgetKind.Streak);
});
