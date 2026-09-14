import {
  COMMUNITY_CAP,
  SLOT_GAP,
  SLOT_WIDTH,
  WALL_MAX_HEIGHT,
  boxedLogoHeight,
  fittedSlotCount,
  opticalHeight,
} from './sponsorLogoSizing';

describe('opticalHeight', () => {
  it('should give a square mark more height than a long lockup', () => {
    expect(opticalHeight(1, COMMUNITY_CAP)).toBeGreaterThan(
      opticalHeight(6, COMMUNITY_CAP),
    );
  });

  it('should clamp both extremes so nothing blows out the row', () => {
    expect(opticalHeight(0.1, COMMUNITY_CAP)).toEqual(
      Math.round(COMMUNITY_CAP * 1.6),
    );
    expect(opticalHeight(20, COMMUNITY_CAP)).toEqual(
      Math.round(COMMUNITY_CAP * 0.8),
    );
  });
});

describe('boxedLogoHeight', () => {
  it('should hold a wide lockup down to what the box can show', () => {
    const ratio = 12;

    expect(
      boxedLogoHeight(ratio, COMMUNITY_CAP, SLOT_WIDTH) * ratio,
    ).toBeLessThanOrEqual(SLOT_WIDTH);
  });

  it('should leave a mark that already fits at its optical height', () => {
    expect(boxedLogoHeight(2, COMMUNITY_CAP, SLOT_WIDTH)).toEqual(
      opticalHeight(2, COMMUNITY_CAP),
    );
  });
});

describe('boxedLogoHeight, row ceiling', () => {
  it('should hold a square mark down to the row it sits in', () => {
    // A 1:1 mark takes the tallest optical height there is, which is what
    // would otherwise push the row open.
    expect(
      boxedLogoHeight(1, COMMUNITY_CAP, SLOT_WIDTH, WALL_MAX_HEIGHT),
    ).toEqual(WALL_MAX_HEIGHT);
  });
});

describe('fittedSlotCount', () => {
  it('should count the slots that fit with their gaps', () => {
    const three = SLOT_WIDTH * 3 + SLOT_GAP * 2;

    expect(fittedSlotCount(three)).toEqual(3);
    expect(fittedSlotCount(three + SLOT_WIDTH - 1)).toEqual(3);
  });

  it('should treat an unmeasurably narrow row as unmeasured', () => {
    expect(fittedSlotCount(SLOT_WIDTH - 1)).toBeNull();
    expect(fittedSlotCount(0)).toBeNull();
  });
});
