import type { ComponentProps } from 'react';
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LiveChatMessageList } from './LiveChatMessageList';
import type { RoomMessage } from '../../messages/types';
import type { RoomPerson } from '../hooks/useRoomPeople';

const messageOf = (
  id: string,
  senderId: string,
  body: string,
): RoomMessage => ({
  id,
  roomJid: 'r1@conference.chat.daily.dev',
  senderId,
  body,
  createdAt: new Date().toISOString(),
});

const personOf = (id: string, name: string): RoomPerson => ({
  id,
  name,
  username: id,
  image: '',
  permalink: '',
});
const people = [personOf('me', 'Me'), personOf('u2', 'Ada')];

const renderList = (
  props: Partial<ComponentProps<typeof LiveChatMessageList>>,
) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <LiveChatMessageList
        typingUserIds={[]}
        people={people}
        usernames={{ u2: 'ada', me: 'me' }}
        viewerId="me"
        viewerUsername="me"
        emptyCopy="Quiet"
        messages={[]}
        {...props}
      />
    </QueryClientProvider>,
  );

describe('LiveChatMessageList', () => {
  it('lets the team remove the sender of a message, but not themselves', () => {
    const onBan = jest.fn();
    renderList({
      messages: [
        messageOf('m1', 'u2', 'buy my course'),
        messageOf('m2', 'me', 'no'),
      ],
      onBan,
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Remove Ada from the chat' }),
    );
    expect(onBan).toHaveBeenCalledWith('u2');
    expect(
      screen.queryByRole('button', { name: 'Remove Me from the chat' }),
    ).not.toBeInTheDocument();
  });

  it('shows no remove action to readers who do not run the room', () => {
    renderList({ messages: [messageOf('m1', 'u2', 'hello')] });

    expect(
      screen.queryByRole('button', { name: /Remove/ }),
    ).not.toBeInTheDocument();
  });
});
