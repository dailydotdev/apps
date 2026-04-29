import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CreateLiveRoomModal } from './CreateLiveRoomModal';
import { LiveRoomMode } from '../../graphql/liveRooms';

const mockCreateLiveRoom = jest.fn();
const mockDisplayToast = jest.fn();

jest.mock('../modals/common/Modal', () => {
  const MockModal = ({
    children,
    isOpen,
  }: {
    children: ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div>{children}</div> : null);

  const MockModalHeader = ({ title }: { title: string }) => <div>{title}</div>;
  const MockModalBody = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  const MockModalFooter = ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  );
  MockModal.Header = MockModalHeader;
  MockModal.Body = MockModalBody;
  MockModal.Footer = MockModalFooter;
  MockModal.Kind = { FlexibleCenter: 'flexible-center' };
  MockModal.Size = { Small: 'small' };

  return { Modal: MockModal };
});

jest.mock('../../hooks/liveRooms/useCreateLiveRoom', () => ({
  useCreateLiveRoom: () => ({
    mutateAsync: mockCreateLiveRoom,
    isPending: false,
  }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

const createJoinToken = () => ({
  role: 'host',
  token: 'join-token',
  room: {
    id: 'room-1',
    topic: 'Open mic',
    mode: LiveRoomMode.FreeForAll,
    status: 'created',
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
    startedAt: null,
    endedAt: null,
    host: {
      id: '1',
      name: 'Host',
      username: 'host',
      image: '',
      permalink: '#',
    },
  },
});

describe('CreateLiveRoomModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateLiveRoom.mockResolvedValue(createJoinToken());
  });

  it('submits a custom speaker limit for free-for-all rooms', async () => {
    const onCreated = jest.fn();
    const onClose = jest.fn();

    render(
      <CreateLiveRoomModal isOpen onClose={onClose} onCreated={onCreated} />,
    );

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Open mic architecture' },
    });
    fireEvent.click(screen.getByLabelText('Free for all'));
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '6' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start room' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Open mic architecture',
        mode: LiveRoomMode.FreeForAll,
        speakerLimit: 6,
      });
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('omits speakerLimit for moderated rooms', async () => {
    render(
      <CreateLiveRoomModal isOpen onClose={jest.fn()} onCreated={jest.fn()} />,
    );

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Structured discussion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Start room' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Structured discussion',
        mode: LiveRoomMode.Moderated,
        speakerLimit: undefined,
      });
    });
    expect(screen.queryByLabelText('Speaker limit')).not.toBeInTheDocument();
  });
});
