import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { TestBootProvider } from '../../../../__tests__/helpers/boot';
import { mockDesktop } from '../../../../__tests__/helpers/media';
import basePost from '../../../../__tests__/fixture/post';
import type { Post } from '../../../graphql/posts';
import * as copy from '../../../hooks/useCopy';
import * as lazyModal from '../../../hooks/useLazyModal';
import { LazyModal } from '../../../components/modals/common/types';
import { Origin } from '../../../lib/log';
import type { AgentMessage } from '../chat';
import { AgentProvider } from '../AgentContext';
import { AgentChatSection } from './AgentChatSection';

const post = (id: string, title: string): Post =>
  ({
    ...basePost,
    id,
    title,
    commentsPermalink: `https://app.daily.dev/posts/${id}`,
  } as Post);

const reply: AgentMessage = {
  id: 'm1',
  role: 'agent',
  at: new Date(0).toISOString(),
  blocks: [
    { type: 'text', html: '<p>Daily run — kept <strong>2</strong>.</p>' },
    { type: 'posts', caption: 'The two:', posts: [post('p1', 'Zig 0.15')] },
    {
      type: 'picks',
      caption: 'Runners-up:',
      posts: [post('p2', 'Ghostty is open source')],
    },
  ],
};

const renderTranscript = () =>
  render(
    <TestBootProvider client={new QueryClient()}>
      <AgentProvider id="a1" isDemo initialMessages={[reply]}>
        <AgentChatSection />
      </AgentProvider>
    </TestBootProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockDesktop();
});

afterEach(() => jest.restoreAllMocks());

describe('copying a reply', () => {
  const copied = () => {
    const copyText = jest.fn();

    jest.spyOn(copy, 'useCopyText').mockReturnValue([false, copyText]);

    return copyText;
  };

  it('carries the posts it cited, as links', () => {
    const copyText = copied();
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Copy reply'));

    const [{ textToCopy }] = copyText.mock.calls[0];

    expect(textToCopy).toContain('Daily run — kept 2.');
    expect(textToCopy).toContain(
      '- [Zig 0.15](https://app.daily.dev/posts/p1)',
    );
    expect(textToCopy).toContain(
      '- [Ghostty is open source](https://app.daily.dev/posts/p2)',
    );
    expect(textToCopy).toContain('Runners-up:');
  });

  it('strips the markup rather than pasting HTML', () => {
    const copyText = copied();
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Copy reply'));

    const [{ textToCopy }] = copyText.mock.calls[0];

    expect(textToCopy).not.toContain('<p>');
    expect(textToCopy).not.toContain('<strong>');
  });
});

describe('a post the agent found', () => {
  it('can be passed on from the row it sits in', () => {
    renderTranscript();

    expect(screen.getByLabelText('Share: Zig 0.15')).toBeInTheDocument();
    expect(screen.getByLabelText('Add to chat: Zig 0.15')).toBeInTheDocument();
  });

  it('offers its link without going through the sheet', () => {
    const copyLink = jest.fn();
    jest.spyOn(copy, 'useCopyLink').mockReturnValue([false, copyLink] as never);
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Copy link: Zig 0.15'));

    expect(copyLink).toHaveBeenCalled();
  });

  it('puts the outward actions before the one for the next prompt', () => {
    renderTranscript();

    // By document-order index, not ancestry: each button has its own tooltip
    // wrapper, so the cluster has no shared parent to walk.
    const buttons = Array.from(document.querySelectorAll('button'));
    const positionOf = (label: string) =>
      buttons.indexOf(screen.getByLabelText(label) as HTMLButtonElement);

    expect(positionOf('Copy link: Zig 0.15')).toBeLessThan(
      positionOf('Share: Zig 0.15'),
    );
    expect(positionOf('Share: Zig 0.15')).toBeLessThan(
      positionOf('Add to chat: Zig 0.15'),
    );
  });

  it('goes to the app share modal rather than a sheet of its own', () => {
    const openModal = jest.fn();

    jest
      .spyOn(lazyModal, 'useLazyModal')
      .mockReturnValue({ openModal, closeModal: jest.fn() } as never);
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Share: Zig 0.15'));

    expect(openModal).toHaveBeenCalledWith({
      type: LazyModal.Share,
      props: {
        post: expect.objectContaining({ id: 'p1' }),
        origin: Origin.Agent,
      },
    });
  });
});

describe('the reply actions', () => {
  it('are on screen without being hunted for', () => {
    renderTranscript();

    const row = screen.getByLabelText('Copy reply').parentElement;

    expect(row).not.toHaveClass('opacity-0');
    ['Copy reply', 'Good reply', 'Bad reply', 'Share reply'].forEach((label) =>
      expect(screen.getByLabelText(label)).toBeInTheDocument(),
    );
  });

  it('put share at the end of the row', () => {
    renderTranscript();

    const row = screen.getByLabelText('Copy reply').parentElement;
    const labels = Array.from(row?.querySelectorAll('button') ?? []).map(
      (button) => button.getAttribute('aria-label'),
    );

    expect(labels[labels.length - 1]).toBe('Share reply');
  });
});

describe('sharing a reply', () => {
  it('says what the link actually opens', () => {
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Share reply'));

    expect(
      screen.getByText(/opens this agent with its topic ready to run/),
    ).toBeInTheDocument();
  });

  it('offers the two things worth sending, and no bespoke control', () => {
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Share reply'));
    const dialog = screen.getByRole('dialog');

    expect(
      within(dialog).getByRole('button', { name: /Copy link/ }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /Copy image/ }),
    ).toBeInTheDocument();
  });

  it('shows the reply it is about, citations and all', () => {
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Share reply'));
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveTextContent('Daily run');
    expect(
      within(dialog).getByRole('link', { name: 'Zig 0.15' }),
    ).toHaveAttribute('href', 'https://app.daily.dev/posts/p1');
  });

  it('signs the card, so a reply that travels says whose it is', () => {
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Share reply'));
    const dialog = screen.getByRole('dialog');

    expect(dialog).toHaveTextContent('Agent');
    expect(dialog.querySelector('.agent-share-card')).toBeInTheDocument();
    // An element rather than a `::before`, which the clone taken for the image
    // cannot carry.
    expect(dialog.querySelector('.agent-share-glow')).toBeInTheDocument();
  });

  it('keeps the link working alongside it', () => {
    renderTranscript();

    fireEvent.click(screen.getByLabelText('Share reply'));

    expect(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: /Copy link/,
      }),
    ).toBeEnabled();
  });
});
