import { buildCoverPattern, COVER_HEIGHT, COVER_WIDTH } from './coverPattern';

describe('buildCoverPattern', () => {
  it('is deterministic for a post id', () => {
    expect(buildCoverPattern('FXWLOZJKE')).toEqual(
      buildCoverPattern('FXWLOZJKE'),
    );
  });

  it('varies between post ids and keeps the glow on the canvas edge', () => {
    const ids = [
      'FXWLOZJKE',
      'FRa4FFU4W',
      'O8wIkI8m1',
      'DiTzeQNNY',
      'kMBQGH7ir',
    ];
    const patterns = ids.map(buildCoverPattern);
    const distinct = new Set(patterns.map((p) => JSON.stringify(p)));
    expect(distinct.size).toBe(ids.length);
    patterns.forEach((p) => {
      expect(p.shapes.length).toBeGreaterThan(0);
      expect([110, -10]).toContain(p.glow.cy);
      expect(p.glow.cx).toBeGreaterThanOrEqual(0);
      expect(p.glow.cx).toBeLessThanOrEqual(COVER_WIDTH);
      p.shapes.forEach((s) => expect(s.opacity).toBeLessThanOrEqual(0.6));
    });
    expect(COVER_HEIGHT).toBeLessThan(COVER_WIDTH);
  });
});
