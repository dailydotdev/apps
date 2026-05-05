import {
  clearStoredLiveRoomResumeSession,
  readStoredLiveRoomResumeSession,
  touchStoredLiveRoomResumeSession,
  writeStoredLiveRoomResumeSession,
} from './resumeSessionStorage';

describe('resumeSessionStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('returns a stored resume session while it is still fresh', () => {
    writeStoredLiveRoomResumeSession({
      roomId: 'room-1',
      participantId: 'speaker-1',
      resumeToken: 'resume-token-1',
      ttlMs: 30_000,
      updatedAt: 1_000,
    });

    expect(readStoredLiveRoomResumeSession('room-1', 20_000)).toEqual({
      roomId: 'room-1',
      participantId: 'speaker-1',
      resumeToken: 'resume-token-1',
      ttlMs: 30_000,
      updatedAt: 1_000,
    });
  });

  it('clears and ignores an expired resume session', () => {
    writeStoredLiveRoomResumeSession({
      roomId: 'room-2',
      participantId: 'speaker-2',
      resumeToken: 'resume-token-2',
      ttlMs: 10_000,
      updatedAt: 1_000,
    });

    expect(readStoredLiveRoomResumeSession('room-2', 11_001)).toBeNull();
    expect(readStoredLiveRoomResumeSession('room-2', 5_000)).toBeNull();
  });

  it('refreshes the stored timestamp without changing the token payload', () => {
    writeStoredLiveRoomResumeSession({
      roomId: 'room-3',
      participantId: 'speaker-3',
      resumeToken: 'resume-token-3',
      ttlMs: 30_000,
      updatedAt: 1_000,
    });

    touchStoredLiveRoomResumeSession('room-3', 15_000);

    expect(readStoredLiveRoomResumeSession('room-3', 40_000)).toEqual({
      roomId: 'room-3',
      participantId: 'speaker-3',
      resumeToken: 'resume-token-3',
      ttlMs: 30_000,
      updatedAt: 15_000,
    });
  });

  it('removes a stored resume session explicitly', () => {
    writeStoredLiveRoomResumeSession({
      roomId: 'room-4',
      participantId: 'speaker-4',
      resumeToken: 'resume-token-4',
      ttlMs: 30_000,
      updatedAt: 1_000,
    });

    clearStoredLiveRoomResumeSession('room-4');

    expect(readStoredLiveRoomResumeSession('room-4', 2_000)).toBeNull();
  });
});
