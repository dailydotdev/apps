import { pointInPolygon, shouldKeepSafeZone } from './SidebarDesktopV2';

describe('SidebarDesktopV2 safe zone helpers', () => {
  const panel = {
    left: 80,
    right: 320,
    top: 0,
    bottom: 500,
  };
  const poly: Array<[number, number]> = [
    [70, 60],
    [80, -26],
    [80, 526],
  ];

  it('detects points inside the prediction cone', () => {
    expect(pointInPolygon(75, 80, poly)).toBe(true);
    expect(pointInPolygon(40, 80, poly)).toBe(false);
  });

  it('keeps the safe zone while the pointer is in the cone or panel', () => {
    expect(shouldKeepSafeZone(75, 80, panel, poly)).toBe(true);
    expect(shouldKeepSafeZone(120, 80, panel, poly)).toBe(true);
  });

  it('releases the safe zone once the pointer leaves the cone and panel', () => {
    expect(shouldKeepSafeZone(90, 600, panel, poly)).toBe(false);
    expect(shouldKeepSafeZone(40, 80, panel, poly)).toBe(false);
  });
});
