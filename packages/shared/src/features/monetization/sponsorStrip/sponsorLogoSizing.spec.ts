import {
  SLOT_GAP,
  SLOT_GAP_MAX,
  WALL_HEIGHT,
  WALL_MAX_WIDTH,
  boxedLogoHeight,
  fittedSlotCount,
  wallGap,
} from './sponsorLogoSizing';

describe('boxedLogoHeight', () => {
  it.each([1, 2, 3.5, 5.5, 6])(
    'should keep a %s:1 mark at the shared height',
    (ratio) => {
      expect(boxedLogoHeight(ratio, WALL_HEIGHT, WALL_MAX_WIDTH)).toEqual(
        WALL_HEIGHT,
      );
    },
  );

  it('should fit an unusually wide lockup without overflowing its slot', () => {
    const ratio = 8;
    const height = boxedLogoHeight(ratio, WALL_HEIGHT, WALL_MAX_WIDTH);

    expect(height).toBeLessThan(WALL_HEIGHT);
    expect(height * ratio).toEqual(WALL_MAX_WIDTH);
  });
});

describe('fittedSlotCount', () => {
  it('should use each logo width and include gaps only between logos', () => {
    const widths = [20, 80, 40, 100];

    expect(fittedSlotCount(171, widths, 16)).toEqual(2);
    expect(fittedSlotCount(172, widths, 16)).toEqual(3);
    expect(fittedSlotCount(288, widths, 16)).toEqual(4);
  });

  it('should stop before a logo that would be clipped', () => {
    expect(fittedSlotCount(127, [128, 16], 16)).toEqual(0);
    expect(fittedSlotCount(128, [128, 16], 16)).toEqual(1);
  });

  it('should fit compact logos on a row narrower than the maximum logo width', () => {
    expect(fittedSlotCount(48, [16, 16, 16], 16)).toEqual(2);
    expect(fittedSlotCount(0, [16], 16)).toEqual(0);
    expect(fittedSlotCount(500, [], 16)).toEqual(0);
  });
});

describe('wallGap', () => {
  it('should share the spare width between the fitted marks', () => {
    // 3 marks of 60 in 300: 120 spare over two gaps.
    expect(wallGap(300, [60, 60, 60], SLOT_GAP, SLOT_GAP_MAX)).toEqual(60);
  });

  it('should never close below the minimum the marks were fitted with', () => {
    expect(wallGap(200, [60, 60, 60], SLOT_GAP, SLOT_GAP_MAX)).toEqual(
      SLOT_GAP,
    );
  });

  it('should stop opening at the maximum and leave the rest empty', () => {
    expect(wallGap(1000, [60, 60, 60], SLOT_GAP, SLOT_GAP_MAX)).toEqual(
      SLOT_GAP_MAX,
    );
  });

  it('should hold a lone mark at the minimum', () => {
    expect(wallGap(1000, [60], SLOT_GAP, SLOT_GAP_MAX)).toEqual(SLOT_GAP);
    expect(wallGap(1000, [], SLOT_GAP, SLOT_GAP_MAX)).toEqual(SLOT_GAP);
  });
});
