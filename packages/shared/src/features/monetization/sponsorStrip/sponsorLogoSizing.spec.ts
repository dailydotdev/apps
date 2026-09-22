import {
  WALL_HEIGHT,
  SLOT_GAP,
  SLOT_WIDTH,
  boxedLogoHeight,
  fittedSlotCount,
} from './sponsorLogoSizing';

describe('boxedLogoHeight', () => {
  it.each([1, 2, 3.5, 6, 8])(
    'should keep a %s:1 mark at the shared height',
    (ratio) => {
      expect(boxedLogoHeight(ratio, WALL_HEIGHT, SLOT_WIDTH)).toEqual(
        WALL_HEIGHT,
      );
    },
  );

  it('should fit an unusually wide lockup without overflowing its slot', () => {
    const ratio = 12;
    const height = boxedLogoHeight(ratio, WALL_HEIGHT, SLOT_WIDTH);

    expect(height).toBeLessThan(WALL_HEIGHT);
    expect(height * ratio).toEqual(SLOT_WIDTH);
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
