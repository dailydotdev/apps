import { computeRms, rmsToLevel } from './LiveRoomMicLevel';
import { SPEAKING_LEVEL_THRESHOLD } from './useLiveRoomAudioLevel';

describe('LiveRoomMicLevel', () => {
  it('maps normal remote speech RMS to a visible level', () => {
    expect(rmsToLevel(0.02)).toBeGreaterThan(0.5);
  });

  it('keeps silence at zero', () => {
    expect(rmsToLevel(0)).toBe(0);
  });

  it('computes RMS from float audio samples', () => {
    const rms = computeRms(new Float32Array([0.5, -0.5, 0.5, -0.5]));

    expect(rms).toBeCloseTo(0.5);
  });

  it('keeps the speaking indicator above background-noise levels', () => {
    expect(rmsToLevel(0.003)).toBeLessThan(SPEAKING_LEVEL_THRESHOLD);
    expect(rmsToLevel(0.005)).toBeGreaterThan(SPEAKING_LEVEL_THRESHOLD);
  });
});
