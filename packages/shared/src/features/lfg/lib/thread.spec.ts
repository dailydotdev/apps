import { addLfgPitches } from './thread';
import type { DmMessage } from '../../messages/types';
import { DmMessageStatus } from '../../messages/types';

const message = (id: string, createdAt: string): DmMessage => ({
  id,
  peerId: 'peer',
  senderId: 'peer',
  body: id,
  createdAt,
  status: DmMessageStatus.Sent,
});

describe('addLfgPitches', () => {
  it('adds the pitches a chat the two already had never showed, in time order', () => {
    const messages = [
      message('request-c1', '2026-10-01T10:00:00.000Z'),
      message('hello', '2026-10-01T11:00:00.000Z'),
      message('later', '2026-10-15T12:00:00.000Z'),
    ];

    const thread = addLfgPitches({
      messages,
      requestMessage: 'Count me in',
      peerId: 'peer',
      reachOuts: [
        {
          id: 'opened',
          pitch: 'Count me in',
          createdAt: '2026-10-01T09:00:00.000Z',
          sender: { id: 'peer' },
        },
        {
          id: 'second',
          pitch: 'Happy to review it',
          createdAt: '2026-10-15T09:00:00.000Z',
          sender: { id: 'me' },
        },
        {
          id: 'newest',
          pitch: 'One more idea',
          createdAt: '2026-10-15T13:00:00.000Z',
          sender: { id: 'peer' },
        },
      ],
    });

    expect(thread.map(({ id }) => id)).toEqual([
      'request-c1',
      'hello',
      'lfg-second',
      'later',
      'lfg-newest',
    ]);
    expect(thread[2]).toMatchObject({
      senderId: 'me',
      body: 'Happy to review it',
    });
  });
});
