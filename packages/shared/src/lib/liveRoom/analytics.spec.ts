import { buildStandupAnalyticsExtra } from './analytics';

describe('buildStandupAnalyticsExtra', () => {
  it('serializes the standup analytics context with caller extras', () => {
    const extra = buildStandupAnalyticsExtra(
      {
        roomId: 'room-1',
        authKind: 'authenticated',
        role: 'speaker',
        roomStatus: 'live',
        roomMode: 'moderated',
        connectionStatus: 'connected',
        participantId: 'participant-1',
        isCoHost: false,
        hasLocalAudioTrack: true,
        hasLocalVideoTrack: false,
        videoQuality: 'high',
        audioOnly: false,
        hideSelfView: true,
        isResuming: true,
      },
      {
        source: 'test',
      },
    );

    expect(JSON.parse(extra)).toEqual({
      roomId: 'room-1',
      authKind: 'authenticated',
      role: 'speaker',
      roomStatus: 'live',
      roomMode: 'moderated',
      connectionStatus: 'connected',
      participantId: 'participant-1',
      isCoHost: false,
      hasLocalAudioTrack: true,
      hasLocalVideoTrack: false,
      videoQuality: 'high',
      audioOnly: false,
      hideSelfView: true,
      isResuming: true,
      source: 'test',
    });
  });

  it('omits null and undefined context fields', () => {
    const extra = buildStandupAnalyticsExtra({
      roomId: 'room-1',
      authKind: 'anonymous',
      role: null,
      roomStatus: null,
      roomMode: undefined,
      connectionStatus: 'connecting',
      participantId: undefined,
      isCoHost: undefined,
      hasLocalAudioTrack: false,
    });

    expect(JSON.parse(extra)).toEqual({
      roomId: 'room-1',
      authKind: 'anonymous',
      connectionStatus: 'connecting',
      hasLocalAudioTrack: false,
    });
  });
});
