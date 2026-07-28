import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BriefListItem } from './BriefListItem';
import type { Post } from '../../graphql/posts';
import { LogEvent, Origin, TargetId } from '../../lib/log';

const mockOnPostClick = jest.fn();
const mockLogEvent = jest.fn();

jest.mock('../../hooks/useOnPostClick', () => ({
  __esModule: true,
  default: () => mockOnPostClick,
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
}));

jest.mock('../../hooks/usePlusSubscription', () => ({
  usePlusSubscription: () => ({ isPlus: true }),
}));

const mockUseShareBriefingDigest = jest.fn();

jest.mock('../../hooks/useShareBriefingDigest', () => ({
  useShareBriefingDigest: () => mockUseShareBriefingDigest(),
}));

const mockCopyLink = jest.fn();

jest.mock('../../hooks/useSharePost', () => ({
  useSharePost: () => ({ copyLink: mockCopyLink }),
}));

jest.mock('../../hooks/useShareCopyIcon', () => ({
  useShareCopyIcon: () => false,
}));

// ShareActions owns its own popover/native-share behaviour and is covered by
// its own spec; here we only care that the row exposes its trigger.
jest.mock('../share/ShareActions', () => ({
  ShareActions: ({ label }: { label: string }) => (
    <button type="button" aria-label={label} />
  ),
}));

const post = {
  id: 'brief-1',
  slug: 'brief-1',
  title: 'Presidential briefing',
  createdAt: '2025-01-01T10:00:00.000Z',
  read: false,
} as Post;

// The copy control's Tooltip reaches for a QueryClient.
const renderWithClient = (ui: React.ReactElement) =>
  render(
    <QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>,
  );

const renderComponent = (onClick = jest.fn()) =>
  renderWithClient(
    <BriefListItem
      post={post}
      title={post.title}
      onClick={onClick}
      origin={Origin.BriefPage}
      targetId={TargetId.List}
    />,
  );

describe('BriefListItem', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShareBriefingDigest.mockReturnValue(false);
  });

  it('keeps the row untouched while the share gate is off', () => {
    renderComponent();

    // The control row is a link and nothing else — no interactive controls.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders copy-link and share once the share gate is on', () => {
    mockUseShareBriefingDigest.mockReturnValue(true);

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Copy link' }));
    expect(mockCopyLink).toHaveBeenCalledWith({ post });
    expect(
      screen.getByRole('button', { name: 'Share briefing' }),
    ).toBeInTheDocument();
  });

  it('lets an explicit prop pin the controls off even when the gate is on', () => {
    mockUseShareBriefingDigest.mockReturnValue(true);

    renderWithClient(
      <BriefListItem
        post={post}
        title={post.title}
        origin={Origin.BriefPage}
        targetId={TargetId.List}
        showCopyActions={false}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('delegates regular clicks to the parent handler and tracks the click', () => {
    const onClick = jest.fn();
    renderComponent(onClick);
    const link = screen.getByRole('link');

    fireEvent.click(link);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(mockOnPostClick).toHaveBeenCalledWith({ post });
    expect(mockLogEvent).toHaveBeenCalledWith({
      event_name: LogEvent.ClickBrief,
      target_id: TargetId.List,
      extra: JSON.stringify({
        is_demo: false,
        brief_date: post.createdAt,
      }),
    });
  });

  it('keeps cmd-click and ctrl-click out of the parent handler while still tracking', () => {
    const onClick = jest.fn();
    renderComponent(onClick);
    const link = screen.getByRole('link');

    fireEvent.click(link, { metaKey: true });
    fireEvent.click(link, { ctrlKey: true });

    expect(onClick).not.toHaveBeenCalled();
    expect(mockOnPostClick).toHaveBeenCalledTimes(2);
    expect(mockLogEvent).toHaveBeenCalledTimes(2);
  });

  it('keeps middle-click out of the parent handler while still tracking', () => {
    const onClick = jest.fn();
    renderComponent(onClick);
    const link = screen.getByRole('link');

    fireEvent(link, new MouseEvent('auxclick', { bubbles: true, button: 1 }));

    expect(onClick).not.toHaveBeenCalled();
    expect(mockOnPostClick).toHaveBeenCalledWith({ post });
    expect(mockLogEvent).toHaveBeenCalledTimes(1);
  });
});
