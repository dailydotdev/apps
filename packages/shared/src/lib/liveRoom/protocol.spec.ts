import { getSnapshotChatMessages } from './protocol';

describe('live room snapshot chat messages', () => {
  it('preserves reactions when hydrating chat history from a snapshot', () => {
    const messages = getSnapshotChatMessages({
      messages: [
        {
          messageId: 'message-1',
          participantId: 'speaker-1',
          body: 'hello',
          createdAt: '2026-05-06T09:00:00.000Z',
          reactions: [
            {
              messageId: 'message-1',
              participantId: 'host-1',
              key: '🔥',
              createdAt: '2026-05-06T09:00:01.000Z',
            },
          ],
        },
      ],
      upToSequence: 12,
    });

    expect(messages).toEqual([
      {
        messageId: 'message-1',
        participantId: 'speaker-1',
        body: 'hello',
        createdAt: '2026-05-06T09:00:00.000Z',
        reactions: [
          {
            messageId: 'message-1',
            participantId: 'host-1',
            key: '🔥',
            createdAt: '2026-05-06T09:00:01.000Z',
          },
        ],
      },
    ]);
  });

  it('keeps only the latest snapshot chat messages when a limit is provided', () => {
    const messages = getSnapshotChatMessages(
      {
        messages: [
          {
            messageId: 'message-1',
            participantId: 'speaker-1',
            body: 'one',
            createdAt: '2026-05-06T09:00:00.000Z',
            reactions: [],
          },
          {
            messageId: 'message-2',
            participantId: 'speaker-2',
            body: 'two',
            createdAt: '2026-05-06T09:00:01.000Z',
            reactions: [],
          },
          {
            messageId: 'message-3',
            participantId: 'speaker-3',
            body: 'three',
            createdAt: '2026-05-06T09:00:02.000Z',
            reactions: [],
          },
        ],
        upToSequence: 14,
      },
      2,
    );

    expect(messages.map((message) => message.messageId)).toEqual([
      'message-2',
      'message-3',
    ]);
  });
});
