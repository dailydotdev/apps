import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import React from 'react';
import type { LiveRoomChatEntry } from '../../contexts/LiveRoomContext';
import type { UserShortProfile } from '../../lib/user';
import { LiveRoomChatPanel } from './LiveRoomChatPanel';

jest.mock('../Markdown', () => ({
  __esModule: true,
  default: ({ content }: { content: string }) => <span>{content}</span>,
}));

jest.mock('../ProfilePicture', () => ({
  ProfilePicture: () => <div>avatar</div>,
  ProfileImageSize: { Small: 'small' },
}));

jest.mock('../profile/ProfileTooltip', () => ({
  ProfileTooltip: (props: {
    children: ReactElement;
    initialUser?: { name: string };
    userId: string;
  }) => {
    const mockReact = jest.requireActual('react') as Pick<
      typeof React,
      'cloneElement'
    >;

    return mockReact.cloneElement(props.children, {
      'data-profile-tooltip-user-id': props.userId,
      'data-profile-tooltip-user-name': props.initialUser?.name,
    });
  },
}));

jest.mock('../tooltips/Portal', () => ({
  RootPortal: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../drawers', () => ({
  Drawer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('../fields/EmojiPicker', () => ({
  EmojiPicker: () => null,
}));

jest.mock('./LiveRoomChatReactions', () => ({
  LiveRoomChatReactions: () => null,
  getChatReactionGroups: () => [],
}));

jest.mock('../../hooks', () => {
  const actual = jest.requireActual('../../hooks');
  return {
    ...actual,
    useViewSize: () => true,
  };
});

jest.mock('../../hooks/useTouchLongPress', () => ({
  useTouchLongPress: () => ({
    onTouchStart: jest.fn(),
    onTouchEnd: jest.fn(),
    onTouchMove: jest.fn(),
    onTouchCancel: jest.fn(),
  }),
}));

const createMessage = (messageId: string, body: string): LiveRoomChatEntry => ({
  messageId,
  participantId: 'participant-1',
  body,
  createdAt: '2026-05-12T10:00:00.000Z',
  reactions: [],
});

const participantProfile: UserShortProfile = {
  id: 'participant-1',
  name: 'Participant',
  username: 'participant',
  image: '',
  createdAt: '2026-05-12T10:00:00.000Z',
  reputation: 0,
  permalink: '/participant',
};

const defaultProps = {
  chatMessages: [createMessage('message-1', 'First message')],
  participantProfilesById: new Map([['participant-1', participantProfile]]),
  mentionSuggestions: [],
  participantChatPermissions: {},
  currentParticipantId: 'participant-1',
  hostParticipantId: 'host-1',
  coHostParticipantIds: [],
  canChat: false,
  isLive: true,
  isEnded: false,
  isLoggedIn: true,
  hasHostPrivileges: false,
  onSendMessage: jest.fn(),
  onDeleteMessage: jest.fn(),
  onSendMessageReaction: jest.fn(),
  onRemoveMessageReaction: jest.fn(),
  onKickParticipant: jest.fn(),
  onSetParticipantChatEnabled: jest.fn(),
  onRequestLogin: jest.fn(),
};

type ScrollMetrics = {
  scrollHeight: number;
  clientHeight: number;
  scrollTop: number;
};

const setScrollMetrics = (
  element: HTMLDivElement,
  initialMetrics: ScrollMetrics,
): ScrollMetrics => {
  const metrics = initialMetrics;

  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    get: () => metrics.scrollHeight,
  });
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    get: () => metrics.clientHeight,
  });
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    get: () => metrics.scrollTop,
    set: (value: number) => {
      metrics.scrollTop = value;
    },
  });

  return metrics;
};

describe('LiveRoomChatPanel', () => {
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafId = 0;
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof window.cancelAnimationFrame;

  const flushAnimationFrames = (): void => {
    let attempts = 0;
    while (rafCallbacks.size > 0 && attempts < 10) {
      const callbacks = [...rafCallbacks.values()];
      rafCallbacks.clear();
      callbacks.forEach((callback) => callback(0));
      attempts += 1;
    }
  };

  beforeEach(() => {
    jest.useFakeTimers();
    rafCallbacks = new Map();
    rafId = 0;
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;

    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      rafId += 1;
      rafCallbacks.set(rafId, callback);
      return rafId;
    }) as typeof window.requestAnimationFrame;

    window.cancelAnimationFrame = ((id: number) => {
      rafCallbacks.delete(id);
    }) as typeof window.cancelAnimationFrame;
  });

  afterEach(() => {
    act(() => {
      flushAnimationFrames();
      jest.runOnlyPendingTimers();
    });
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    jest.useRealTimers();
  });

  it('links and shows the profile tooltip on resolved sender names and avatars', () => {
    render(<LiveRoomChatPanel {...defaultProps} />);

    const senderNameLink = screen.getByRole('link', { name: '@participant' });
    expect(senderNameLink).toHaveAttribute(
      'href',
      participantProfile.permalink,
    );
    expect(senderNameLink).toHaveAttribute('target', '_blank');
    expect(senderNameLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(senderNameLink).toHaveAttribute(
      'data-profile-tooltip-user-id',
      participantProfile.id,
    );
    expect(senderNameLink).toHaveAttribute(
      'data-profile-tooltip-user-name',
      participantProfile.name,
    );

    const senderAvatarLink = screen.getByRole('link', {
      name: 'Open @participant profile',
    });
    expect(senderAvatarLink).toHaveAttribute(
      'href',
      participantProfile.permalink,
    );
    expect(senderAvatarLink).toHaveAttribute('target', '_blank');
    expect(senderAvatarLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(senderAvatarLink).toHaveAttribute(
      'data-profile-tooltip-user-id',
      participantProfile.id,
    );
    expect(senderAvatarLink).toHaveAttribute(
      'data-profile-tooltip-user-name',
      participantProfile.name,
    );
  });

  it('scrolls to the full height of a newly added long message', () => {
    const { rerender } = render(<LiveRoomChatPanel {...defaultProps} />);

    const scrollContainer = screen.getByTestId(
      'live-room-chat-scroll',
    ) as HTMLDivElement;
    const metrics = setScrollMetrics(scrollContainer, {
      scrollHeight: 120,
      clientHeight: 80,
      scrollTop: 40,
    });

    act(() => {
      flushAnimationFrames();
    });

    metrics.scrollHeight = 320;

    rerender(
      <LiveRoomChatPanel
        {...defaultProps}
        chatMessages={[
          createMessage('message-1', 'First message'),
          createMessage(
            'message-2',
            'This is a long message that wraps across several lines in the standup chat.',
          ),
        ]}
      />,
    );

    act(() => {
      flushAnimationFrames();
    });

    expect(metrics.scrollTop).toBe(320);
  });

  it('waits until the user stops scrolling before auto-scrolling new messages', () => {
    const { rerender } = render(<LiveRoomChatPanel {...defaultProps} />);

    const scrollContainer = screen.getByTestId(
      'live-room-chat-scroll',
    ) as HTMLDivElement;
    const metrics = setScrollMetrics(scrollContainer, {
      scrollHeight: 160,
      clientHeight: 100,
      scrollTop: 60,
    });

    act(() => {
      flushAnimationFrames();
    });

    metrics.scrollTop = 60;
    fireEvent.scroll(scrollContainer);

    metrics.scrollHeight = 240;

    rerender(
      <LiveRoomChatPanel
        {...defaultProps}
        chatMessages={[
          createMessage('message-1', 'First message'),
          createMessage('message-2', 'Second message'),
        ]}
      />,
    );

    act(() => {
      flushAnimationFrames();
    });

    expect(metrics.scrollTop).toBe(60);

    act(() => {
      jest.advanceTimersByTime(150);
      flushAnimationFrames();
    });

    expect(metrics.scrollTop).toBe(240);
  });
});
