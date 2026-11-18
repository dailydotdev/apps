import { PATCHY_DEN_SIZE, toPatchyDenBoxPoint } from './patchyDenLayout';

describe('toPatchyDenBoxPoint', () => {
  const center = {
    x: PATCHY_DEN_SIZE.width / 2,
    y: PATCHY_DEN_SIZE.height / 2,
  };

  it('scales points when the box has the art’s shape', () => {
    const box = {
      width: PATCHY_DEN_SIZE.width / 2,
      height: PATCHY_DEN_SIZE.height / 2,
    };
    expect(toPatchyDenBoxPoint(box, { x: 100, y: 200 })).toEqual({
      x: 50,
      y: 100,
    });
  });

  it('follows the cover crop of a wide, short box', () => {
    // Twice as wide as tall: cover scales to the width and crops top/bottom.
    const box = { width: 1376, height: 400 };
    expect(toPatchyDenBoxPoint(box, center)).toEqual({ x: 688, y: 200 });
    expect(toPatchyDenBoxPoint(box, { x: 10, y: 10 })).toBeNull();
  });

  it('returns null before the box is measured', () => {
    expect(toPatchyDenBoxPoint({ width: 0, height: 0 }, center)).toBeNull();
  });
});
