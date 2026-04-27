import { computeRms, rmsToLevel } from './LiveRoomMicLevel';

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
});
