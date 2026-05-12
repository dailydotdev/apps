import type { LiveRoomChatEntry } from '../../contexts/LiveRoomContext';
import type { UserShortProfile } from '../../lib/user';
import { getLiveRoomMentionSuggestions } from './useLiveRoomStageModel';

const createProfile = (id: string): UserShortProfile => ({
  id,
  username: id,
  name: id,
  image: '',
  createdAt: '2026-05-12T10:00:00.000Z',
  reputation: 0,
  permalink: `/${id}`,
});

const createMessage = (
  participantId: string,
  messageId: string,
): LiveRoomChatEntry => ({
  messageId,
  participantId,
  body: messageId,
  createdAt: '2026-05-12T10:00:00.000Z',
  reactions: [],
});

describe('getLiveRoomMentionSuggestions', () => {
  it('keeps the host first and prioritizes recent unique chat senders', () => {
    const host = createProfile('host');
    const profiles = [
      host,
      createProfile('speaker-1'),
      createProfile('speaker-2'),
      createProfile('speaker-3'),
      createProfile('speaker-4'),
      createProfile('speaker-5'),
      createProfile('speaker-6'),
      createProfile('speaker-7'),
      createProfile('speaker-8'),
      createProfile('audience-1'),
    ];

    const participantProfilesById = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    const suggestions = getLiveRoomMentionSuggestions({
      host,
      participantIds: [
        'speaker-1',
        'speaker-2',
        'speaker-3',
        'speaker-4',
        'speaker-5',
        'speaker-6',
        'speaker-7',
        'speaker-8',
        'audience-1',
      ],
      participantProfilesById,
      chatMessages: [
        createMessage('speaker-1', 'message-1'),
        createMessage('speaker-2', 'message-2'),
        createMessage('speaker-3', 'message-3'),
        createMessage('speaker-4', 'message-4'),
        createMessage('speaker-5', 'message-5'),
        createMessage('speaker-6', 'message-6'),
        createMessage('speaker-7', 'message-7'),
        createMessage('speaker-8', 'message-8'),
      ],
    });

    expect(suggestions.map(({ id }) => id)).toEqual([
      'host',
      'speaker-8',
      'speaker-7',
      'speaker-6',
      'speaker-5',
      'speaker-4',
      'speaker-3',
      'speaker-2',
      'speaker-1',
      'audience-1',
    ]);
  });

  it('deduplicates repeated senders and skips the host from recent sender ranking', () => {
    const host = createProfile('host');
    const speaker = createProfile('speaker');
    const audience = createProfile('audience');
    const participantProfilesById = new Map(
      [host, speaker, audience].map((profile) => [profile.id, profile]),
    );

    const suggestions = getLiveRoomMentionSuggestions({
      host,
      participantIds: ['speaker', 'audience'],
      participantProfilesById,
      chatMessages: [
        createMessage('speaker', 'message-1'),
        createMessage('host', 'message-2'),
        createMessage('speaker', 'message-3'),
      ],
    });

    expect(suggestions.map(({ id }) => id)).toEqual([
      'host',
      'speaker',
      'audience',
    ]);
  });
});
