import React from 'react';
import { render, screen } from '@testing-library/react';
import { LiveChatHighlightCardRow } from './LiveChatHighlightCardRow';
import { useLogContext } from '../../../contexts/LogContext';
import { useLiveChatHighlight } from '../hooks/useLiveChatHighlight';
import type { ChatRoom } from '../graphql';
import { ChatRoomStatus } from '../graphql';

jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../hooks/useLiveChatHighlight', () => ({
  useLiveChatHighlight: jest.fn(),
}));

const room: ChatRoom = {
  id: 'r1',
  status: ChatRoomStatus.Active,
  jid: 'r1@conference.chat.daily.dev',
  title: 'Bun 2.0',
  post: {
    id: 'p1',
    title: 'Bun 2.0',
    commentsPermalink: 'https://app.daily.dev/posts/p1',
  },
  expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  occupantCount: 23,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useLogContext)
    .mockReturnValue({ logEvent: jest.fn() } as unknown as ReturnType<
      typeof useLogContext
    >);
});

describe('LiveChatHighlightCardRow', () => {
  it('links the newest room with who is in and how long is left', () => {
    jest.mocked(useLiveChatHighlight).mockReturnValue(room);
    render(<LiveChatHighlightCardRow compact />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://app.daily.dev/posts/p1');
    expect(link).toHaveTextContent('Live chat');
    expect(link).toHaveTextContent('23 here · ends in 2h');
    expect(link).toHaveTextContent('Bun 2.0');
  });

  it('renders nothing without a room', () => {
    jest.mocked(useLiveChatHighlight).mockReturnValue(null);
    const { container } = render(<LiveChatHighlightCardRow />);
    expect(container).toBeEmptyDOMElement();
  });
});
