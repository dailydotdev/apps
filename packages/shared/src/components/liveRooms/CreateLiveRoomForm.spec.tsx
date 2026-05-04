import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { CreateLiveRoomForm } from './CreateLiveRoomForm';
import { LiveRoomMode } from '../../graphql/liveRooms';

const mockCreateLiveRoom = jest.fn();
const mockDisplayToast = jest.fn();
const mockLogEvent = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('../../hooks/liveRooms/useCreateLiveRoom', () => ({
  useCreateLiveRoom: () => ({
    mutateAsync: mockCreateLiveRoom,
    isPending: false,
  }),
}));

jest.mock('../../hooks/useToastNotification', () => ({
  useToastNotification: () => ({ displayToast: mockDisplayToast }),
}));

jest.mock('../fields/RichTextInput', () => ({
  __esModule: true,
  default: ({
    initialContent,
    maxInputLength,
    onValueUpdate,
    textareaProps,
  }: {
    initialContent?: string;
    maxInputLength?: number;
    onValueUpdate?: (value: string) => void;
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  }) => (
    <textarea
      aria-label={textareaProps?.['aria-label']}
      maxLength={maxInputLength}
      placeholder={textareaProps?.placeholder}
      defaultValue={initialContent}
      onInput={(event) => onValueUpdate?.(event.currentTarget.value)}
    />
  ),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('../../contexts/LogContext', () => ({
  useLogContext: () => ({ logEvent: mockLogEvent }),
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
    scheduledStart: null,
    description: null,
    descriptionHtml: null,
    subscribed: false,
    contentEmbeds: [],
    host: {
      id: '1',
      name: 'Host',
      username: 'host',
      image: '',
      permalink: '#',
    },
  },
});

describe('CreateLiveRoomForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateLiveRoom.mockResolvedValue(createJoinToken());
    mockUseAuthContext.mockReturnValue({
      user: { id: 'user-1', timezone: 'Asia/Jerusalem' },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('submits a custom speaker limit for free-for-all rooms', async () => {
    const onCreated = jest.fn();
    const onCancel = jest.fn();

    render(<CreateLiveRoomForm onCancel={onCancel} onCreated={onCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Open mic architecture' },
    });
    fireEvent.click(screen.getByLabelText('Free for all'));
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '6' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Open mic architecture',
        mode: LiveRoomMode.FreeForAll,
        speakerLimit: 6,
        scheduledStart: undefined,
        description: undefined,
      });
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('omits speakerLimit for moderated rooms', async () => {
    render(<CreateLiveRoomForm onCancel={jest.fn()} onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Structured discussion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Structured discussion',
        mode: LiveRoomMode.Moderated,
        speakerLimit: undefined,
        scheduledStart: undefined,
        description: undefined,
      });
    });
    expect(screen.queryByLabelText('Speaker limit')).not.toBeInTheDocument();
  });

  it('submits scheduled lobby fields as UTC and explains the local delta', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-04T07:00:00.000Z'));

    render(<CreateLiveRoomForm onCancel={jest.fn()} onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Scheduled lobby' },
    });
    fireEvent.input(
      screen.getByPlaceholderText(
        "Outline what you'll cover, drop daily.dev posts to react to, or jot down questions for the room.",
      ),
      { target: { value: '## Agenda\nhttps://daily.dev/posts/example' } },
    );
    fireEvent.click(screen.getByText('Schedule a lobby before going live'));

    expect(screen.getByText(/30 minutes from now/)).toBeInTheDocument();
    expect(screen.getByText(/UTC \+3/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Change timezone' }),
    ).toHaveAttribute('href', 'https://r.daily.dev/timezone');

    fireEvent.change(screen.getByLabelText('Scheduled time'), {
      target: { value: '2026-05-04T12:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Scheduled lobby',
        mode: LiveRoomMode.Moderated,
        speakerLimit: undefined,
        scheduledStart: '2026-05-04T09:00:00.000Z',
        description: '## Agenda\nhttps://daily.dev/posts/example',
      });
    });
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'create standup',
        target_id: 'room-1',
        extra: expect.stringContaining('"scheduled":true'),
      }),
    );
  });

  it('does not submit scheduled lobbies in the past', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-04T07:00:00.000Z'));

    render(<CreateLiveRoomForm onCancel={jest.fn()} onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Scheduled lobby' },
    });
    fireEvent.click(screen.getByText('Schedule a lobby before going live'));
    fireEvent.change(screen.getByLabelText('Scheduled time'), {
      target: { value: '2026-05-04T09:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    await waitFor(() => {
      expect(
        screen.getByText('Scheduled time must be in the future'),
      ).toBeInTheDocument();
    });
    expect(mockCreateLiveRoom).not.toHaveBeenCalled();
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = jest.fn();

    render(<CreateLiveRoomForm onCancel={onCancel} onCreated={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
