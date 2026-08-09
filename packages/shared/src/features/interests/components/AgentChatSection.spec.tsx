import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

/**
 * A reply's whole value is the handful of posts it picked out. Copying it as
 * flat text left someone pasting a paragraph about two articles with no way to
 * reach either.
 */
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
    // The share sits beside the way into the next prompt, not instead of it.
    expect(screen.getByLabelText('Add to chat: Zig 0.15')).toBeInTheDocument();
  });

  // Straight to the app's own share modal: squads, every external provider and
  // the tracked copy link are already there, and a second share UI in one
  // product is a second one to keep honest.
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
