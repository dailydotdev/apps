import React from 'react';
import { QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SharePicksModal from './SharePicksModal';
import { useSlackShareButton } from '../../../hooks/integrations/slack/useSlackShareButton';
import loggedUser from '../../../../__tests__/fixture/loggedUser';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import type { Picks } from '../../../graphql/picks';
import { LogEvent, Origin } from '../../../lib/log';
import { gqlClient } from '../../../graphql/common';
import { webappUrl } from '../../../lib/constants';

const mockShouldUseNativeShare = jest.fn();

jest.mock('../../../lib/func', () => ({
  ...jest.requireActual('../../../lib/func'),
  shouldUseNativeShare: () => mockShouldUseNativeShare(),
}));

const mockLogEvent = jest.fn();
const mockClipboardWrite = jest.fn();
const mockWriteText = jest.fn();
const mockOnSlack = jest.fn();
const mockDisplayToast = jest.fn();

jest.mock('../../../hooks/integrations/slack/useSlackShareButton', () => ({
  useSlackShareButton: jest.fn(() => ({
    onClick: mockOnSlack,
    isLoading: false,
    isConnected: true,
    label: 'Send to Slack',
  })),
}));

jest.mock('../../../hooks/useToastNotification', () => ({
  ...jest.requireActual('../../../hooks/useToastNotification'),
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const post = (id: string, title: string) => ({
  id,
  title,
  image: `https://img.test/${id}.png`,
  permalink: `https://app.daily.dev/r/${id}`,
  commentsPermalink: `https://app.daily.dev/posts/${id}`,
  type: 'article',
});

const picks: Picks = {
  id: 'picks-1',
  weekStart: '2026-11-02',
  author: {
    id: loggedUser.id,
    name: 'Ada',
    username: 'ada',
    image: '',
    permalink: '',
  },
  items: [
    { post: post('p1', 'First pick'), note: 'Read it twice', position: 0 },
    { post: post('p2', 'Second pick'), note: null, position: 1 },
    { post: post('p3', 'Third pick'), note: null, position: 2 },
    { post: post('p4', 'Fourth pick'), note: null, position: 3 },
  ],
};

const renderModal = () =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      auth={{ user: loggedUser }}
      log={{ logEvent: mockLogEvent }}
    >
      <SharePicksModal
        isOpen
        ariaHideApp={false}
        picks={picks}
        origin={Origin.PicksPage}
        onRequestClose={jest.fn()}
      />
    </TestBootProvider>,
  );

const setShare = (value?: unknown) => {
  mockShouldUseNativeShare.mockReturnValue(!!value);
  Object.defineProperty(navigator, 'share', { value, configurable: true });
};

beforeEach(() => {
  jest.clearAllMocks();
  setShare(undefined);
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mockWriteText, write: mockClipboardWrite },
    configurable: true,
  });
  (global as unknown as { ClipboardItem: unknown }).ClipboardItem = class {
    constructor(public items: Record<string, Promise<Blob>>) {}
  };
  mockWriteText.mockResolvedValue(undefined);
  mockClipboardWrite.mockImplementation(async ([item]) => {
    await item.items['text/plain'];
  });
  jest
    .spyOn(gqlClient, 'request')
    .mockResolvedValue({ getShortUrl: 'https://dly.to/abc' });
});

it('should render the preview and the tracked link', async () => {
  renderModal();

  expect(screen.getByText('Share your weekly picks')).toBeInTheDocument();
  expect(screen.getByText('First pick')).toBeInTheDocument();
  expect(screen.getByText('Read it twice')).toBeInTheDocument();
  expect(screen.getByText('4 posts')).toBeInTheDocument();
  expect(
    screen.getByTestId('picks-thumbnails').querySelectorAll('img'),
  ).toHaveLength(3);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  await waitFor(() => expect(input.value).toBe('https://dly.to/abc'));
});

it('should copy the shortened link with the referral params and log it', async () => {
  renderModal();

  fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

  await waitFor(() => expect(mockDisplayToast).toHaveBeenCalled());
  expect(mockDisplayToast.mock.calls[0][0]).toBe('Link copied');
  const requested = (gqlClient.request as jest.Mock).mock.calls.find(
    ([, vars]) => vars?.url,
  )[1].url as string;
  expect(requested).toContain('/picks/picks-1');
  expect(requested).toContain(`userid=${loggedUser.id}`);
  expect(requested).toContain('cid=share_picks');
  expect(mockWriteText.mock.calls[0][0]).toContain('/picks/picks-1');
  expect(() => new URL(mockWriteText.mock.calls[0][0])).not.toThrow();
  expect(mockLogEvent).toHaveBeenCalledWith({
    event_name: LogEvent.SharePicks,
    extra: JSON.stringify({
      provider: 'copy_link',
      picks_id: 'picks-1',
      origin: Origin.PicksPage,
    }),
  });
});

it('should build an absolute link when the webapp url is relative', async () => {
  expect(webappUrl).toBe('/');
  renderModal();

  const input = screen.getByRole('textbox') as HTMLInputElement;
  await waitFor(() => expect(input.value).toBe('https://dly.to/abc'));
  const requested = (gqlClient.request as jest.Mock).mock.calls.find(
    ([, vars]) => vars?.url,
  )[1].url as string;
  expect(new URL(requested).pathname).toBe('/picks/picks-1');
});

it('should link back to the picks page', () => {
  renderModal();

  expect(screen.getByRole('link', { name: 'View your page' })).toHaveAttribute(
    'href',
    '/picks/picks-1',
  );
});

it('should hide Share… when the browser has no native share', () => {
  renderModal();

  expect(
    screen.queryByRole('button', { name: 'Share…' }),
  ).not.toBeInTheDocument();
});

it('should share natively with the short link when available', async () => {
  const share = jest.fn().mockResolvedValue(undefined);
  setShare(share);
  renderModal();

  fireEvent.click(screen.getByRole('button', { name: 'Share…' }));

  await waitFor(() =>
    expect(share).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'https://dly.to/abc' }),
    ),
  );
  await waitFor(() =>
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SharePicks,
        extra: expect.stringContaining('"provider":"native"'),
      }),
    ),
  );
});

it('should not log a native share the user dismissed', async () => {
  const share = jest.fn().mockRejectedValue(new Error('AbortError'));
  setShare(share);
  renderModal();

  fireEvent.click(screen.getByRole('button', { name: 'Share…' }));

  await waitFor(() => expect(share).toHaveBeenCalled());
  expect(mockLogEvent).not.toHaveBeenCalled();
});

it('should hand off to the Slack flow with the picks subject', () => {
  renderModal();

  expect(useSlackShareButton).toHaveBeenCalledWith({
    picks,
    origin: Origin.PicksPage,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Share to Slack' }));

  expect(mockOnSlack).toHaveBeenCalledTimes(1);
  expect(mockLogEvent).not.toHaveBeenCalled();
});
