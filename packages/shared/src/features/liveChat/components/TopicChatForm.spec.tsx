import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { TopicChatForm } from './TopicChatForm';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useLogContext } from '../../../contexts/LogContext';
import { useToastNotification } from '../../../hooks/useToastNotification';
import { ChatRoomStatus, ChatRoomType, openTopicChatRoom } from '../graphql';
import type { ChatRoom } from '../graphql';

jest.mock('next/router', () => ({ useRouter: jest.fn() }));
jest.mock('../../../contexts/AuthContext', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('../../../contexts/LogContext', () => ({
  useLogContext: jest.fn(),
}));
jest.mock('../../../hooks/useToastNotification', () => ({
  useToastNotification: jest.fn(),
}));
jest.mock('../graphql', () => ({
  ...jest.requireActual('../graphql'),
  openTopicChatRoom: jest.fn(),
}));

const room: ChatRoom = {
  id: 'r1',
  type: ChatRoomType.Topic,
  status: ChatRoomStatus.Active,
  jid: 'r1@conference.chat.daily.dev',
  title: 'Is Bun ready?',
  expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
  occupantCount: 0,
  createdAt: new Date().toISOString(),
};

const push = jest.fn();
const logEvent = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRouter).mockReturnValue({ push } as never);
  jest.mocked(useAuthContext).mockReturnValue({
    user: { id: 'u1', isTeamMember: true },
  } as never);
  jest.mocked(useLogContext).mockReturnValue({ logEvent } as never);
  jest
    .mocked(useToastNotification)
    .mockReturnValue({ displayToast: jest.fn() } as never);
  jest.mocked(openTopicChatRoom).mockResolvedValue(room);
});

const renderForm = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <TopicChatForm />
    </QueryClientProvider>,
  );

const submit = () => {
  fireEvent.input(screen.getByLabelText("What's the chat about?"), {
    target: { value: '  Is Bun ready?  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Open the chat' }));
};

describe('TopicChatForm', () => {
  it('opens the room, announced, and lands on its page', async () => {
    renderForm();
    submit();

    await waitFor(() =>
      expect(openTopicChatRoom).toHaveBeenCalledWith({
        title: 'Is Bun ready?',
        description: undefined,
        silent: undefined,
      }),
    );
    await waitFor(() => expect(push).toHaveBeenCalledWith('/chat/r1'));
    expect(logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'start live chat',
        target_id: 'r1',
        extra: JSON.stringify({ origin: 'new live chat', silent: false }),
      }),
    );
  });

  it('opens a test run without the push when asked', async () => {
    renderForm();
    fireEvent.click(screen.getByLabelText("Don't send a push (test run)"));
    expect(screen.getByText(/nobody is pushed about it/)).toBeInTheDocument();
    submit();

    await waitFor(() =>
      expect(openTopicChatRoom).toHaveBeenCalledWith(
        expect.objectContaining({ silent: true }),
      ),
    );
  });
});
