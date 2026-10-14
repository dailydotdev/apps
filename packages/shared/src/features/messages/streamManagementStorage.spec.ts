import type { SMState } from 'strophe.js';
import { createStreamManagementStorage } from './streamManagementStorage';

const key = 'strophe-sm:user@chat.daily.dev';

// Strophe types id/location/max as non-null although it stores null there.
const state = (overrides: Record<string, unknown> = {}): SMState =>
  ({
    boundJid: 'user@chat.daily.dev/web',
    enableSent: true,
    enabled: true,
    hIn: 3,
    hOutAcked: 2,
    id: 'session-1',
    location: null,
    max: null,
    resumeSupported: true,
    resumed: false,
    sinceLastAck: 0,
    unacked: [],
    ...overrides,
  } as unknown as SMState);

describe('createStreamManagementStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('round-trips resumable state', () => {
    const storage = createStreamManagementStorage();
    storage.save(key, state());

    expect(storage.load(key)).toEqual(state());
  });

  it('drops state saved before the server enabled the session', () => {
    const storage = createStreamManagementStorage();
    // What Strophe persists between <enable/> and <enabled/>.
    storage.save(
      key,
      state({ enabled: false, id: null, resumeSupported: false }),
    );

    expect(storage.load(key)).toBeNull();
    expect(sessionStorage.getItem(key)).toBeNull();
  });

  it('drops state the server would not resume', () => {
    const storage = createStreamManagementStorage();
    storage.save(key, state({ resumeSupported: false }));

    expect(storage.load(key)).toBeNull();
  });

  it('ignores unparseable state', () => {
    sessionStorage.setItem(key, '{not json');

    expect(createStreamManagementStorage().load(key)).toBeNull();
  });

  it('drops the stored state instead of throwing when the write fails', () => {
    const storage = createStreamManagementStorage();
    storage.save(key, state());
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError');
      });

    expect(() => storage.save(key, state({ hIn: 4 }))).not.toThrow();
    setItem.mockRestore();
    expect(storage.load(key)).toBeNull();
  });

  it('clears the key', () => {
    const storage = createStreamManagementStorage();
    storage.save(key, state());
    storage.clear(key);

    expect(storage.load(key)).toBeNull();
  });
});
