import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BriefCopyMenu } from './BriefCopyMenu';
import type { MenuItemProps } from '../dropdown/common';
import type { Post } from '../../graphql/posts';
import { LogEvent, Origin } from '../../lib/log';
import { ShareProvider } from '../../lib/share';

const mockDisplayToast = jest.fn();
const mockLogEvent = jest.fn();
const mockCopyLink = jest.fn();
const writeText = jest.fn().mockResolvedValue(undefined);

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../../hooks/useSharePost', () => ({
  useSharePost: () => ({ copyLink: mockCopyLink }),
}));

jest.mock('../../hooks/useShareCopyIcon', () => ({
  useShareCopyIcon: () => true,
}));

jest.mock('../dropdown/DropdownMenu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) =>
    children,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuOptions: ({ options }: { options: MenuItemProps[] }) => (
    <div>
      {options.map(({ label, action }) => (
        <button key={label} type="button" onClick={action}>
          {label}
        </button>
      ))}
    </div>
  ),
}));

const post = {
  id: 'brief-1',
  title: 'Presidential briefing',
  summary: 'Rust 1.90 lands async closures.',
  commentsPermalink: 'https://app.daily.dev/posts/brief-1',
} as Post;

const renderComponent = (props: Partial<Post> = {}) =>
  render(
    <BriefCopyMenu post={{ ...post, ...props }} origin={Origin.BriefPage} />,
  );

describe('BriefCopyMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText } });
  });

  it('exposes an accessible trigger and every copy action', () => {
    renderComponent();

    expect(screen.getByLabelText('Copy')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy link' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy summary' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy title and link' }),
    ).toBeInTheDocument();
  });

  it('hides the summary action when the brief has no generated summary', () => {
    renderComponent({ summary: undefined });

    expect(
      screen.queryByRole('button', { name: 'Copy summary' }),
    ).not.toBeInTheDocument();
  });

  it('delegates copy link to the shared post-share path', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));

    expect(mockCopyLink).toHaveBeenCalledWith({ post });
  });

  it('writes the summary to the clipboard, toasts and logs the share', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Copy summary' }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(post.summary));
    expect(mockDisplayToast).toHaveBeenCalledWith(
      '✅ Copied summary to clipboard',
      expect.anything(),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: LogEvent.SharePost,
        extra: expect.stringContaining(ShareProvider.CopyLink),
      }),
    );
  });

  it('writes the title and link snippet to the clipboard', async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy title and link' }),
    );

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${post.title}\n${post.commentsPermalink}`,
      ),
    );
    expect(mockDisplayToast).toHaveBeenCalledWith(
      '✅ Copied to clipboard',
      expect.anything(),
    );
  });
});
