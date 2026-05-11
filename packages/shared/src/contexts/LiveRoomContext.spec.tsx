import type { ReactNode } from 'react';
import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveRoomProvider } from './LiveRoomContext';
import {
  readStoredLiveRoomResumeSession,
  writeStoredLiveRoomResumeSession,
} from '../lib/liveRoom/resumeSessionStorage';
import { gqlClient } from '../graphql/common';

const mockUseAuthContext = jest.fn();
const mockUseLogContext = jest.fn();
const connectionInstances: Array<{
  options: {
    token?: string;
    resumeToken?: string;
    url: string;
  };
}> = [];

jest.mock('./AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('./LogContext', () => ({
  useLogContext: () => mockUseLogContext(),
}));

jest.mock('../graphql/common', () => ({
  gqlClient: {
    request: jest.fn(),
  },
}));

function MockLiveRoomConnection(
  this: {
    options: {
      token?: string;
      resumeToken?: string;
      url: string;
    };
    open: jest.Mock;
    close: jest.Mock;
    send: jest.Mock;
    onSessionReady: jest.Mock;
    onSnapshot: jest.Mock;
    onRoomUpdated: jest.Mock;
    onReactionSent: jest.Mock;
    onChatMessage: jest.Mock;
    onChatMessageDeleted: jest.Mock;
    onChatMessageReaction: jest.Mock;
    onChatMessageReactionRemoved: jest.Mock;
    onClose: jest.Mock;
    onError: jest.Mock;
    resumeToken: string | null;
  },
  options: {
    token?: string;
    resumeToken?: string;
    url: string;
  },
): void {
  this.options = options;
  this.open = jest.fn();
  this.close = jest.fn();
  this.send = jest.fn();
  this.onSessionReady = jest.fn(() => jest.fn());
  this.onSnapshot = jest.fn(() => jest.fn());
  this.onRoomUpdated = jest.fn(() => jest.fn());
  this.onReactionSent = jest.fn(() => jest.fn());
  this.onChatMessage = jest.fn(() => jest.fn());
  this.onChatMessageDeleted = jest.fn(() => jest.fn());
  this.onChatMessageReaction = jest.fn(() => jest.fn());
  this.onChatMessageReactionRemoved = jest.fn(() => jest.fn());
  this.onClose = jest.fn(() => jest.fn());
  this.onError = jest.fn(() => jest.fn());
  this.resumeToken = null;
  connectionInstances.push(this);
}

jest.mock('../lib/liveRoom/connection', () => ({
  buildLiveRoomWsUrl: () => 'ws://example.test/flyting/ws',
  LiveRoomConnection: MockLiveRoomConnection,
}));

describe('LiveRoomContext', () => {
  let queryClient = new QueryClient();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    connectionInstances.length = 0;
    jest.clearAllMocks();
    sessionStorage.clear();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      value: {
        enumerateDevices: jest.fn().mockResolvedValue([]),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        getSupportedConstraints: jest.fn().mockReturnValue({}),
      },
    });

    mockUseAuthContext.mockReturnValue({
      user: { id: 'user-1' },
      isAuthReady: true,
    });
    mockUseLogContext.mockReturnValue({
      logEvent: jest.fn(),
    });
    (gqlClient.request as jest.Mock).mockResolvedValue({
      liveRoomJoinToken: {
        token: 'fresh-token',
      },
    });
  });

  it('replaces a mismatched stored resume session with a fresh authenticated join token', async () => {
    writeStoredLiveRoomResumeSession({
      roomId: 'room-1',
      participantId: 'tracking-anon-1',
      resumeToken: 'resume-token-1',
      ttlMs: 30_000,
      updatedAt: Date.now(),
    });

    render(
      <LiveRoomProvider roomId="room-1">
        <div>standup</div>
      </LiveRoomProvider>,
      { wrapper },
    );

    await waitFor(() => expect(gqlClient.request).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(connectionInstances).toHaveLength(1));

    expect(readStoredLiveRoomResumeSession('room-1')).toBeNull();
    expect(connectionInstances[0].options).toEqual(
      expect.objectContaining({
        token: 'fresh-token',
        url: 'ws://example.test/flyting/ws',
      }),
    );
    expect(connectionInstances[0].options.resumeToken).toBeUndefined();
  });
});
