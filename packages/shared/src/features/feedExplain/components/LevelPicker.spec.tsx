import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import defaultUser from '../../../../__tests__/fixture/loggedUser';
import { LogEvent, TargetId, TargetType } from '../../../lib/log';
import type { FeedControl } from '../types';
import { FeedControlDuration, FeedTopicMode } from '../types';
import { TopicLevelPicker } from './TopicLevelPicker';
import { SourceLevelPicker } from './SourceLevelPicker';

const onChange = jest.fn();
const logEvent = jest.fn();

const openPicker = async (
  isPlus: boolean,
  control?: FeedControl<FeedTopicMode>,
) => {
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: { ...defaultUser, isPlus } }}
      log={{ logEvent }}
    >
      <TopicLevelPicker
        tag="rust"
        weight={0.3}
        computedWeight={0.3}
        isSet={!!control}
        control={control}
        onChange={onChange}
      />
    </TestBootProvider>,
  );
  await userEvent.click(screen.getByLabelText('Boost for #rust: ×1.30'));
};

const getDuration = (label: string) =>
  within(screen.getByRole('radiogroup', { name: 'How long' })).getByRole(
    'radio',
    { name: new RegExp(`^${label}`) },
  );

beforeEach(() => {
  onChange.mockClear();
  logEvent.mockClear();
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

  it('should re-time the level that is set when the duration changes', async () => {
    await openPicker(true, {
      mode: FeedTopicMode.Demote,
      weight: null,
      expiresAt: null,
    });

    await userEvent.click(getDuration('3 days'));

    expect(onChange).toHaveBeenCalledWith({
      mode: FeedTopicMode.Demote,
      duration: FeedControlDuration.ThreeDays,
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to Auto (×1.30)' }),
    );
    expect(onChange).toHaveBeenLastCalledWith({ mode: null });
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

  it('should log a Get Plus click as coming from the levels', async () => {
    await openPicker(false);

    fireEvent.click(screen.getByText('Get Plus'));

    expect(logEvent).toHaveBeenCalledWith({
      event_name: LogEvent.UpgradeSubscription,
      target_type: TargetType.Plus,
      target_id: TargetId.FeedControls,
      extra: JSON.stringify({ feature: 'levels' }),
    });
  });
});

describe('SourceLevelPicker', () => {
  it.each([
    [false, false],
    [true, true],
  ])(
    'should offer Off only on a followed source (followed: %s)',
    async (isFollowed, hasOff) => {
      render(
        <TestBootProvider client={new QueryClient()}>
          <SourceLevelPicker
            name="Echo JS"
            factor={isFollowed ? 1.7 : 1}
            isFollowed={isFollowed}
            onChange={onChange}
          />
        </TestBootProvider>,
      );
      await userEvent.click(screen.getByLabelText(/^Boost for Echo JS/));

      const levels = screen.getByRole('radiogroup', {
        name: 'Level for Echo JS',
      });
      expect(!!within(levels).queryByRole('radio', { name: /^Off/ })).toBe(
        hasOff,
      );
    },
  );
});
