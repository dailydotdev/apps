import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

const post = {
  id: 'brief-1',
  slug: 'brief-1',
  title: 'Presidential briefing',
  createdAt: '2025-01-01T10:00:00.000Z',
  read: false,
} as Post;

const renderComponent = (onClick = jest.fn()) =>
  render(
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
