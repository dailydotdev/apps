import React from 'react';
import type { RenderResult } from '@testing-library/react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { GrowthBook } from '@growthbook/growthbook-react';
import {
  activeDiscussionCommentThreshold,
  EndOfConversationShare,
} from './EndOfConversationShare';
import type { Post } from '../../graphql/posts';
import { TestBootProvider } from '../../../__tests__/helpers/boot';
import { useViewSize } from '../../hooks/useViewSize';
import { useToastNotification } from '../../hooks/useToastNotification';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

jest.mock('../../hooks/useViewSize', () => {
  const actual = jest.requireActual('../../hooks/useViewSize');
  return { __esModule: true, ...actual, useViewSize: jest.fn() };
});

jest.mock('../../hooks/useToastNotification', () => {
  const actual = jest.requireActual('../../hooks/useToastNotification');
  return { __esModule: true, ...actual, useToastNotification: jest.fn() };
});

const useViewSizeMock = useViewSize as jest.Mock;
const useToastNotificationMock = useToastNotification as jest.Mock;
const displayToast = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);
const logEvent = jest.fn();

const permalink = 'https://app.daily.dev/posts/abc';

const createPost = (numComments: number): Post =>
  ({
    id: 'abc',
    title: 'Why your CI is slow',
    permalink: 'https://daily.dev/posts/abc',
    commentsPermalink: permalink,
    numComments,
  } as Post);

const enabledFlags = {
  sharing_visibility: { defaultValue: true },
  share_end_of_conversation: { defaultValue: true },
};

beforeEach(() => {
  jest.clearAllMocks();
  useViewSizeMock.mockReturnValue(true); // default: laptop
  useToastNotificationMock.mockReturnValue({
    displayToast,
    dismissToast: jest.fn(),
  });
  Object.assign(navigator, { clipboard: { writeText }, maxTouchPoints: 0 });
  delete (navigator as unknown as { share?: unknown }).share;
});

const renderComponent = (
  numComments: number,
  features: Record<string, { defaultValue: boolean }> = enabledFlags,
): RenderResult =>
  render(
    <TestBootProvider
      client={new QueryClient()}
      gb={new GrowthBook({ features })}
      log={{ logEvent }}
    >
      <EndOfConversationShare post={createPost(numComments)} />
    </TestBootProvider>,
  );

const band = () => screen.queryByText('Enjoyed this discussion?');

describe('EndOfConversationShare threshold', () => {
  it(`stays hidden at exactly ${activeDiscussionCommentThreshold} comments`, () => {
    renderComponent(activeDiscussionCommentThreshold);

    expect(band()).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Copy link' }),
    ).not.toBeInTheDocument();
  });

  it('stays hidden with no comments at all', () => {
    renderComponent(0);

    expect(band()).not.toBeInTheDocument();
  });

  it(`renders one comment past the threshold`, () => {
    renderComponent(activeDiscussionCommentThreshold + 1);

    expect(band()).toBeInTheDocument();
    expect(screen.getByText('Enjoyed this discussion?')).toBeInTheDocument();
  });
});

describe('EndOfConversationShare flags', () => {
  it('stays hidden when the master kill-switch is off', () => {
    renderComponent(12, {
      sharing_visibility: { defaultValue: false },
      share_end_of_conversation: { defaultValue: true },
    });

    expect(band()).not.toBeInTheDocument();
  });

  it('stays hidden when its own experiment flag is off', () => {
    renderComponent(12, {
      sharing_visibility: { defaultValue: true },
      share_end_of_conversation: { defaultValue: false },
    });

    expect(band()).not.toBeInTheDocument();
  });

  it('stays hidden with both flags at their defaults', () => {
    renderComponent(12, {});

    expect(band()).not.toBeInTheDocument();
  });
});

describe('EndOfConversationShare sharing', () => {
  it('copies the link from the main half of the split button on desktop', async () => {
    renderComponent(12);

    const copyButton = screen.getByRole('button', { name: 'Copy link' });
    // Both glyphs are always mounted so they can cross-fade; only the check's
    // opacity says which one is showing.
    const check = () => copyButton.querySelector('.text-status-success');
    expect(check()).toHaveClass('opacity-0');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    // The copy glyph cross-fades to a green check for the confirmation window.
    await waitFor(() => expect(check()).not.toHaveClass('opacity-0'));
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(permalink));
    expect(displayToast).toHaveBeenCalledWith(
      '✅ Copied link to clipboard',
      expect.anything(),
    );
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SharePost,
        extra: JSON.stringify({
          provider: ShareProvider.CopyLink,
          origin: Origin.EndOfConversation,
        }),
      }),
    );
  });

  it('opens the full share list from the chevron half, without copying', async () => {
    renderComponent(12);

    // Radix dropdowns open on pointerdown (which jsdom cannot synthesise) or on
    // Enter, so the keyboard path is what a test can drive.
    await act(async () => {
      fireEvent.keyDown(screen.getByLabelText('More share options'), {
        key: 'Enter',
      });
    });

    const popover = await screen.findByRole('menu');
    expect(within(popover).getByTestId('social-share-X')).toBeInTheDocument();
    expect(
      within(popover).getByTestId('social-share-WhatsApp'),
    ).toBeInTheDocument();
    expect(writeText).not.toHaveBeenCalled();

    // The copy action inside the list still works and logs the same origin.
    await act(async () => {
      fireEvent.click(within(popover).getByTestId('social-share-Copy link'));
    });

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(permalink));
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SharePost,
        extra: JSON.stringify({
          provider: ShareProvider.CopyLink,
          origin: Origin.EndOfConversation,
        }),
      }),
    );
  });

  it('opens the native share sheet on a single tap on mobile', async () => {
    useViewSizeMock.mockReturnValue(false);
    const share = jest.fn().mockResolvedValue(undefined);
    // `shouldUseNativeShare` also requires a touch device.
    Object.assign(navigator, { share, maxTouchPoints: 2 });

    renderComponent(12);

    // Mobile keeps a single button — no chevron half, no popover.
    expect(
      screen.queryByLabelText('More share options'),
    ).not.toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    });

    await waitFor(() => expect(share).toHaveBeenCalled());
    expect(writeText).not.toHaveBeenCalled();
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SharePost,
        extra: JSON.stringify({
          provider: ShareProvider.Native,
          origin: Origin.EndOfConversation,
        }),
      }),
    );
  });
});
