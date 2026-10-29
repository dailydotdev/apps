import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { FeedControlDuration, FeedTopicMode } from '../types';
import { TopicLevelPicker } from './TopicLevelPicker';

const onChange = jest.fn();

const openPicker = async (isPlus: boolean) => {
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: { ...defaultUser, isPlus } }}
    >
      <TopicLevelPicker
        tag="rust"
        weight={0.3}
        isSet={false}
        onChange={onChange}
      />
    </TestBootProvider>,
  );
  await userEvent.click(screen.getByLabelText('Boost for #rust: ×1.30'));
};

const getDuration = (label: string) =>
  within(
    screen.getByRole('radiogroup', {
      name: 'How long the level or boost you pick lasts',
    }),
  ).getByRole('radio', { name: new RegExp(`^${label}`) });

beforeEach(() => {
  onChange.mockClear();
});

describe('TopicLevelPicker under Plus', () => {
  it('should set a level for the duration picked first', async () => {
    await openPicker(true);

    await userEvent.click(getDuration('1 week'));
    await userEvent.click(screen.getByRole('radio', { name: /^Show less/ }));

    expect(onChange).toHaveBeenCalledWith({
      mode: FeedTopicMode.Demote,
      duration: FeedControlDuration.Week,
    });
  });

  it('should set an exact boost once the slider is let go', async () => {
    await openPicker(true);

    fireEvent.keyDown(
      screen.getByRole('slider', { name: 'Exact boost for #rust' }),
      { key: 'ArrowRight' },
    );

    expect(onChange).toHaveBeenCalledWith({ weight: 0.35 });
  });

  it('should lock the exact boost and timed changes for a free reader', async () => {
    await openPicker(false);

    expect(
      screen.getByRole('slider', { name: 'Exact boost for #rust' }),
    ).toHaveAttribute('data-disabled');
    expect(screen.getByText('Get Plus')).toBeInTheDocument();
    await userEvent.click(getDuration('3 days'));
    await userEvent.click(screen.getByRole('radio', { name: /^Show more/ }));

    expect(onChange).toHaveBeenCalledWith({ mode: FeedTopicMode.Boost });
  });
});
