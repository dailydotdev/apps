import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import * as toast from '../../../hooks/useToastNotification';
import type { UserInterest } from '../../../graphql/interests';
import {
  UserInterestCadence,
  UserInterestStatus,
} from '../../../graphql/interests';
import type { AgentMessage } from '../chat';
import { AgentProvider } from '../AgentContext';
import { nodeToPng } from '../nodeToPng';
import { AgentShareReplyModal } from './AgentShareReplyModal';

jest.mock('../nodeToPng');

const interest = {
  id: 'i1',
  query: 'Cool zig projects',
  status: UserInterestStatus.Active,
  cadence: UserInterestCadence.Daily,
  createdAt: '2026-01-01T09:00:00.000Z',
} as UserInterest;

const message: AgentMessage = {
  id: 'm1',
  role: 'agent',
  at: new Date(0).toISOString(),
  blocks: [{ type: 'text', html: '<p>Daily run — kept 2.</p>' }],
};

const displayToast = jest.fn();

const renderSheet = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" interest={interest} isDemo initialMessages={[]}>
        <AgentShareReplyModal
          isOpen
          onRequestClose={jest.fn()}
          message={message}
        />
      </AgentProvider>
    </TestBootProvider>,
  );

/**
 * The anchor the fallback reaches for, with its press recorded — and whether it
 * was in the document at the moment it was pressed, which is the whole
 * difference between a saved file and nothing at all on Firefox.
 */
const captureDownload = () => {
  const create = document.createElement.bind(document);
  const anchor = create('a');
  const wasAttached = { current: false };

  anchor.click = jest.fn(() => {
    wasAttached.current = anchor.isConnected;
  });
  jest
    .spyOn(document, 'createElement')
    .mockImplementation((tag: string) => (tag === 'a' ? anchor : create(tag)));

  return { anchor, wasAttached };
};

const copyImage = () =>
  fireEvent.click(screen.getByRole('button', { name: /Copy image/ }));

beforeEach(() => {
  jest.clearAllMocks();
  mockDesktop();
  jest.spyOn(toast, 'useToastNotification').mockReturnValue({
    displayToast,
    dismissToast: jest.fn(),
  });
  jest.mocked(nodeToPng).mockResolvedValue(new Blob(['png']));
  URL.createObjectURL = jest.fn().mockReturnValue('blob:card');
  URL.revokeObjectURL = jest.fn();
});

afterEach(() => jest.restoreAllMocks());

/**
 * Firefox cannot put an image on the clipboard at all, and a card nobody can
 * paste is worth less than a file they can drag. Saving it is the same outcome
 * by a different route, so it is not reported as a failure — and jsdom, having
 * no `ClipboardItem` either, is exactly that browser.
 */
describe('copying the reply as an image where the clipboard will not take one', () => {
  it('saves the card instead, as a named file', async () => {
    const { anchor } = captureDownload();

    renderSheet();
    copyImage();

    await waitFor(() => expect(anchor.click).toHaveBeenCalled());
    expect(anchor.download).toBe('daily-dev-agent.png');
    expect(anchor.href).toContain('blob:card');
  });

  // Firefox ignores a click on an anchor that is not in the document, so the
  // toast said the image was saved and nothing was.
  it('presses an anchor that is in the document, and leaves none behind', async () => {
    const { anchor, wasAttached } = captureDownload();

    renderSheet();
    copyImage();

    await waitFor(() => expect(anchor.click).toHaveBeenCalled());
    expect(wasAttached.current).toBe(true);
    expect(anchor.isConnected).toBe(false);
  });

  it('says the image was saved rather than reporting a failure', async () => {
    captureDownload();
    renderSheet();
    copyImage();

    await waitFor(() =>
      expect(displayToast).toHaveBeenCalledWith('Image saved'),
    );
  });

  // After the press, and not in the same task as it: revoking the url the
  // download is reading from cancels the download it just started. Fake timers,
  // because "later" is the assertion and a real clock cannot state it.
  it('lets go of the blob url it made, once the press has happened', async () => {
    jest.useFakeTimers();

    try {
      const { anchor } = captureDownload();

      renderSheet();
      copyImage();
      // Drawing the card and the clipboard refusing it are both promises, so
      // they settle without the clock moving at all.
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(anchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();

      act(() => jest.runOnlyPendingTimers());

      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:card');
    } finally {
      jest.useRealTimers();
    }
  });

  // The button must not claim a copy that never reached a clipboard.
  it('does not claim the image was copied', async () => {
    captureDownload();
    renderSheet();
    copyImage();

    await waitFor(() => expect(displayToast).toHaveBeenCalled());
    expect(
      screen.queryByRole('button', { name: /Image copied/ }),
    ).not.toBeInTheDocument();
  });

  it('photographs the card that is on screen, not a second drawing of it', async () => {
    captureDownload();
    renderSheet();
    copyImage();

    await waitFor(() => expect(nodeToPng).toHaveBeenCalled());

    const [node] = jest.mocked(nodeToPng).mock.calls[0];

    expect(node).toHaveClass('agent-share-card');
    expect(node).toHaveTextContent('Daily run');
  });
});

describe('when the card cannot be drawn at all', () => {
  it('says so, and leaves the button pressable again', async () => {
    jest.mocked(nodeToPng).mockRejectedValue(new Error('no 2d context'));
    renderSheet();
    copyImage();

    await waitFor(() =>
      expect(displayToast).toHaveBeenCalledWith(
        'Could not turn the reply into an image',
      ),
    );

    const button = screen.getByRole('button', { name: /Copy image/ });

    expect(button).not.toHaveAttribute('aria-busy', 'true');
    expect(button).toBeEnabled();
  });

  it('saves nothing', async () => {
    jest.mocked(nodeToPng).mockRejectedValue(new Error('no 2d context'));
    const { anchor } = captureDownload();

    renderSheet();
    copyImage();

    await waitFor(() => expect(displayToast).toHaveBeenCalled());
    expect(anchor.click).not.toHaveBeenCalled();
  });
});

describe('copying the reply as an image where the clipboard will take one', () => {
  const write = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    // Neither of these exists in jsdom, so the browser that can do this has to
    // be built by hand.
    (global as unknown as { ClipboardItem: unknown }).ClipboardItem = class {
      constructor(public items: Record<string, Blob>) {}
    };
    Object.defineProperty(global.navigator, 'clipboard', {
      configurable: true,
      value: { write },
    });
  });

  afterEach(() => {
    delete (global as unknown as { ClipboardItem?: unknown }).ClipboardItem;
  });

  it('puts the card on the clipboard and says so on the button itself', async () => {
    renderSheet();
    copyImage();

    await waitFor(() => expect(write).toHaveBeenCalled());
    expect(
      await screen.findByRole('button', { name: /Image copied/ }),
    ).toBeInTheDocument();
    expect(displayToast).not.toHaveBeenCalled();
  });
});
