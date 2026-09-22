import {
  WALL_HEIGHT,
  WALL_MAX_WIDTH,
  boxedLogoHeight,
  fittedSlotCount,
} from './sponsorLogoSizing';

describe('boxedLogoHeight', () => {
  it.each([1, 2, 3.5, 6, 8])(
    'should keep a %s:1 mark at the shared height',
    (ratio) => {
      expect(boxedLogoHeight(ratio, WALL_HEIGHT, WALL_MAX_WIDTH)).toEqual(
        WALL_HEIGHT,
      );
    },
  );

  it('should fit an unusually wide lockup without overflowing its slot', () => {
    const ratio = 12;
    const height = boxedLogoHeight(ratio, WALL_HEIGHT, WALL_MAX_WIDTH);

    expect(height).toBeLessThan(WALL_HEIGHT);
    expect(height * ratio).toEqual(WALL_MAX_WIDTH);
  });
});

describe('fittedSlotCount', () => {
  it('should use each logo width and include gaps only between logos', () => {
    const widths = [20, 80, 40, 100];

    expect(fittedSlotCount(171, widths)).toEqual(2);
    expect(fittedSlotCount(172, widths)).toEqual(3);
    expect(fittedSlotCount(288, widths)).toEqual(4);
  });

  it('should stop before a logo that would be clipped', () => {
    expect(fittedSlotCount(127, [128, 16])).toEqual(0);
    expect(fittedSlotCount(128, [128, 16])).toEqual(1);
  });

  it('should fit compact logos on a row narrower than the maximum logo width', () => {
    expect(fittedSlotCount(48, [16, 16, 16])).toEqual(2);
    expect(fittedSlotCount(0, [16])).toEqual(0);
    expect(fittedSlotCount(500, [])).toEqual(0);
  });
});
