import type { ReactElement } from 'react';
import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { TestBootProvider } from '../../__tests__/helpers/boot';
import loggedUser from '../../__tests__/fixture/loggedUser';
import { isIOS } from '../lib/func';
import { LogEvent, Origin } from '../lib/log';
import { ReferralCampaignKey } from '../lib/referral';
import { ShareProvider } from '../lib/share';
import { HOLD_GESTURE, useHoldToShare } from './useHoldToShare';

jest.mock('../lib/func', () => ({
  ...jest.requireActual('../lib/func'),
  isIOS: jest.fn(() => false),
}));

const mockIsIOS = isIOS as jest.Mock;
const writeText = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();
const onRowLinkClick = jest.fn();
const link = 'https://app.daily.dev/squads/webdev';
const HOLD_MS = 350;

const Row = (): ReactElement => {
  const { isHeld, holdProps } = useHoldToShare({
    origin: Origin.SquadDirectory,
    shareProps: {
      text: 'Check out the webdev squad on daily.dev',
      link,
      cid: ReferralCampaignKey.ShareSource,
      logObject: () => ({
        event_name: LogEvent.ShareSource,
        target_id: 'webdev',
      }),
    },
  });

  return (
    <div {...holdProps} data-held={isHeld} data-testid="row">
      <a href={link} onClick={onRowLinkClick}>
        Open
      </a>
      <button type="button">Join</button>
    </div>
  );
};

// jsdom has no Touch constructor, so the touch list rides on a plain event.
const touch = (type: string, x = 0, y = 0): Event => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, 'touches', {
    value: [{ clientX: x, clientY: y }],
  });

  return event;
};

const renderRow = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent }}
    >
      <Row />
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  mockIsIOS.mockReturnValue(false);
  Object.assign(navigator, { clipboard: { writeText } });
});

afterEach(() => {
  jest.useRealTimers();
});

it('shares the tracked link while the finger is still down, and swallows the click', () => {
  renderRow();
  const row = screen.getByTestId('row');

  fireEvent(row, touch('touchstart'));
  act(() => {
    jest.advanceTimersByTime(HOLD_MS);
  });

  expect(row).toHaveAttribute('data-held', 'true');
  expect(writeText).toHaveBeenCalledWith(
    `${link}?userid=${loggedUser.id}&cid=share_source`,
  );
  expect(logEvent).toHaveBeenCalledWith({
    event_name: LogEvent.ShareSource,
    target_id: 'webdev',
    extra: JSON.stringify({
      provider: ShareProvider.CopyLink,
      origin: Origin.SquadDirectory,
      gesture: HOLD_GESTURE,
    }),
  });

  fireEvent(row, touch('touchend'));

  expect(writeText).toHaveBeenCalledTimes(1);
  expect(row).toHaveAttribute('data-held', 'false');

  fireEvent.click(screen.getByRole('link'));
  expect(onRowLinkClick).not.toHaveBeenCalled();

  // Only the click the hold produced is swallowed.
  fireEvent.click(screen.getByRole('link'));
  expect(onRowLinkClick).toHaveBeenCalledTimes(1);
});

it('on iOS shares when the finger lifts, where the gesture still counts', () => {
  mockIsIOS.mockReturnValue(true);
  renderRow();
  const row = screen.getByTestId('row');

  fireEvent(row, touch('touchstart'));
  act(() => {
    jest.advanceTimersByTime(HOLD_MS);
  });

  expect(row).toHaveAttribute('data-held', 'true');
  expect(writeText).not.toHaveBeenCalled();

  fireEvent(row, touch('touchend'));

  expect(writeText).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('link'));
  expect(onRowLinkClick).not.toHaveBeenCalled();
});

it('leaves a tap alone', () => {
  renderRow();
  const row = screen.getByTestId('row');

  fireEvent(row, touch('touchstart'));
  act(() => {
    jest.advanceTimersByTime(200);
  });
  fireEvent(row, touch('touchend'));
  fireEvent.click(screen.getByRole('link'));

  expect(writeText).not.toHaveBeenCalled();
  expect(onRowLinkClick).toHaveBeenCalledTimes(1);
});

it('lets a scroll through', () => {
  renderRow();
  const row = screen.getByTestId('row');

  fireEvent(row, touch('touchstart'));
  fireEvent(row, touch('touchmove', 0, 40));
  act(() => {
    jest.advanceTimersByTime(HOLD_MS);
  });
  fireEvent(row, touch('touchend'));

  expect(row).toHaveAttribute('data-held', 'false');
  expect(writeText).not.toHaveBeenCalled();
});

it('does not share from a hold on a button inside the row', () => {
  renderRow();
  const button = screen.getByRole('button', { name: 'Join' });

  fireEvent(button, touch('touchstart'));
  act(() => {
    jest.advanceTimersByTime(HOLD_MS);
  });
  fireEvent(button, touch('touchend'));

  expect(writeText).not.toHaveBeenCalled();
});
