import {
  stableWorldJson,
  worldPayloadHash,
} from '../../components/world/authoredPayload';

describe('authored payload serialisation', () => {
  /* The round trip through the API does not promise key order; an untouched
     payload must still compare equal to itself when it comes back reordered. */
  it('compares a payload equal to its reordered self', () => {
    const authored = {
      tiers: { 1: [{ ops: [{ g: 'box', a: [1, 2, 3] }], size: [1, 2, 1] }] },
    };
    const roundTripped = {
      tiers: { 1: [{ size: [1, 2, 1], ops: [{ a: [1, 2, 3], g: 'box' }] }] },
    };

    expect(stableWorldJson(authored)).toBe(stableWorldJson(roundTripped));
    expect(worldPayloadHash(authored)).toBe(worldPayloadHash(roundTripped));
  });

  it('tells changed payloads apart', () => {
    expect(
      worldPayloadHash({ variants: [{ ops: [], size: [1, 1, 1] }] }),
    ).not.toBe(worldPayloadHash({ variants: [{ ops: [], size: [1, 2, 1] }] }));
  });

  it('leaves arrays in order', () => {
    expect(stableWorldJson({ a: [3, 1, 2] })).toBe('{"a":[3,1,2]}');
  });
});
