import { mergeWithLocalMessages } from './queries';
import type { DmMessage } from './types';
import { DmMessageStatus } from './types';

const message = (id: string, status = DmMessageStatus.Sent): DmMessage => ({
  id,
  peerId: 'peer',
  senderId: 'me',
  body: id,
  createdAt: '2026-10-06T10:00:00Z',
  status,
});

describe('mergeWithLocalMessages', () => {
  it('keeps messages the server never saw after a refetch', () => {
    const merged = mergeWithLocalMessages(
      [message('a'), message('b')],
      [
        message('a'),
        message('pending', DmMessageStatus.Sending),
        message('bounced', DmMessageStatus.Failed),
      ],
    );

    expect(merged.map(({ id }) => id)).toEqual([
      'a',
      'b',
      'pending',
      'bounced',
    ]);
  });

  it('prefers the server copy once it has the message', () => {
    const merged = mergeWithLocalMessages(
      [message('a')],
      [message('a', DmMessageStatus.Sending)],
    );

    expect(merged).toEqual([message('a')]);
  });

  it('drops sent messages the server no longer returns', () => {
    expect(mergeWithLocalMessages([], [message('old')])).toEqual([]);
  });

  it('shows a retried message once when both copies reached the archive', () => {
    expect(
      mergeWithLocalMessages([message('a'), message('a'), message('b')]).map(
        ({ id }) => id,
      ),
    ).toEqual(['a', 'b']);
  });
});
