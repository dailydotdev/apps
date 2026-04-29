import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  type LiveRoom,
  LiveRoomMode,
  LiveRoomStatus,
} from '../../graphql/liveRooms';
import { LiveRoomCard } from './LiveRoomCard';

const createRoom = (overrides: Partial<LiveRoom> = {}): LiveRoom => ({
  id: 'room-1',
  createdAt: '2026-04-29T10:00:00.000Z',
  updatedAt: '2026-04-29T10:00:00.000Z',
  topic: 'Live room topic',
  mode: LiveRoomMode.Moderated,
  status: LiveRoomStatus.Live,
  startedAt: '2026-04-29T10:00:00.000Z',
  endedAt: null,
  participantCount: 12,
  host: {
    id: 'host-1',
    name: 'Host User',
    username: 'hostuser',
    image: 'https://daily.dev/host.png',
    createdAt: '2026-04-29T10:00:00.000Z',
    reputation: 42,
    permalink: 'https://daily.dev/hostuser',
  },
  ...overrides,
});

describe('LiveRoomCard', () => {
  const renderCard = (room: LiveRoom, onJoin = jest.fn()) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <LiveRoomCard room={room} onJoin={onJoin} />
      </QueryClientProvider>,
    );

  it('renders the participant count when available', () => {
    renderCard(createRoom());

    expect(screen.getByText('12 watching')).toBeInTheDocument();
  });

  it('renders singular watcher copy for a single viewer', () => {
    renderCard(createRoom({ participantCount: 1 }));

    expect(screen.getByText('1 watching')).toBeInTheDocument();
  });

  it('omits the participant count when unavailable', () => {
    renderCard(createRoom({ participantCount: null }));

    expect(screen.queryByText(/watching/i)).not.toBeInTheDocument();
  });

  it('calls onJoin with the room when join is clicked', () => {
    const onJoin = jest.fn();
    const room = createRoom();

    renderCard(room, onJoin);

    fireEvent.click(screen.getByRole('button', { name: 'Join' }));

    expect(onJoin).toHaveBeenCalledWith(room);
  });
});
