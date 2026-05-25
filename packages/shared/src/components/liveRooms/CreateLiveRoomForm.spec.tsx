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

const DESCRIPTION_PLACEHOLDER =
  'Add context, drop daily.dev posts to react to, or jot down questions for the room. Shown in the lobby while people RSVP, and in the Agenda tab once the standup is live.';

const createJoinToken = () => ({
  role: 'host',
  token: 'join-token',
  room: {
    id: 'room-1',
    topic: 'Open mic',
    mode: LiveRoomMode.Moderated,
    status: 'created',
    createdAt: '2026-04-28T00:00:00.000Z',
    updatedAt: '2026-04-28T00:00:00.000Z',
    startedAt: null,
    endedAt: null,
    scheduledStart: null,
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

  it('creates a moderated standup with the entered topic', async () => {
    const onCreated = jest.fn();

    render(<CreateLiveRoomForm onCreated={onCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Structured discussion' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Structured discussion',
        mode: LiveRoomMode.Moderated,
        scheduledStart: undefined,
        description: undefined,
      });
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
  });

  it('creates a community moderated standup with community parameters', async () => {
    const onCreated = jest.fn();

    render(<CreateLiveRoomForm onCreated={onCreated} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Community room' },
    });
    fireEvent.click(screen.getByLabelText('Community moderated'));
    fireEvent.change(screen.getByLabelText('Minimum participants to go live'), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText('Speaker limit'), {
      target: { value: '8' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Community room',
        mode: LiveRoomMode.CommunityModerated,
        scheduledStart: undefined,
        minParticipantsToGoLive: 4,
        speakerLimit: 8,
        description: undefined,
      });
    });
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event_name: 'create standup',
        extra: expect.stringContaining('"mode":"community_moderated"'),
      }),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extra: expect.stringContaining('"min_participants_to_go_live":4'),
      }),
    );
    expect(mockLogEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        extra: expect.stringContaining('"speaker_limit":8'),
      }),
    );
  });

  it('requires a participant minimum for community moderated standups', async () => {
    render(<CreateLiveRoomForm onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Community room' },
    });
    fireEvent.click(screen.getByLabelText('Community moderated'));
    fireEvent.change(screen.getByLabelText('Minimum participants to go live'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    expect(
      await screen.findByText(
        'Minimum participants is required for community-moderated rooms',
      ),
    ).toBeInTheDocument();
    expect(mockCreateLiveRoom).not.toHaveBeenCalled();
  });

  it('requires the speaker limit to fit the community participant minimum', async () => {
    render(<CreateLiveRoomForm onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Community room' },
    });
    fireEvent.click(screen.getByLabelText('Community moderated'));
    fireEvent.change(screen.getByLabelText('Minimum participants to go live'), {
      target: { value: '6' },
    });
    fireEvent.change(screen.getByLabelText('Speaker limit'), {
      target: { value: '4' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create standup' }));

    expect(
      await screen.findByText(
        'Speaker limit must be greater than or equal to the participant minimum',
      ),
    ).toBeInTheDocument();
    expect(mockCreateLiveRoom).not.toHaveBeenCalled();
  });

  it('submits scheduled lobby fields as UTC and explains the local delta', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-05-04T07:00:00.000Z'));

    render(<CreateLiveRoomForm onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Scheduled lobby' },
    });
    fireEvent.input(screen.getByPlaceholderText(DESCRIPTION_PLACEHOLDER), {
      target: { value: '## Agenda\nhttps://daily.dev/posts/example' },
    });
    fireEvent.click(screen.getByLabelText('Schedule for later'));

    expect(screen.getByText(/30 minutes from now/)).toBeInTheDocument();
    expect(screen.getByText(/UTC \+3/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Change timezone' }),
    ).toHaveAttribute('href', 'https://r.daily.dev/timezone');

    fireEvent.change(screen.getByLabelText('Scheduled time'), {
      target: { value: '2026-05-04T12:00' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule standup' }));

    await waitFor(() => {
      expect(mockCreateLiveRoom).toHaveBeenCalledWith({
        topic: 'Scheduled lobby',
        mode: LiveRoomMode.Moderated,
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

    render(<CreateLiveRoomForm onCreated={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('Topic'), {
      target: { value: 'Scheduled lobby' },
    });
    fireEvent.click(screen.getByLabelText('Schedule for later'));
    fireEvent.change(screen.getByLabelText('Scheduled time'), {
      target: { value: '2026-05-04T09:30' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Schedule standup' }));

    await waitFor(() => {
      expect(
        screen.getByText('Scheduled time must be in the future'),
      ).toBeInTheDocument();
    });
    expect(mockCreateLiveRoom).not.toHaveBeenCalled();
  });

  it('swaps submit copy based on schedule choice', () => {
    render(<CreateLiveRoomForm onCreated={jest.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Create standup' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Schedule for later'));

    expect(
      screen.getByRole('button', { name: 'Schedule standup' }),
    ).toBeInTheDocument();
  });
});
