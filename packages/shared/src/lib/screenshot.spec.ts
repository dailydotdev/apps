import { toNaturalRect } from './screenshot';

describe('toNaturalRect', () => {
  const display = { width: 400, height: 300 };
  const natural = { width: 1600, height: 1200 };

  it('scales a selection from displayed to natural pixels', () => {
    expect(
      toNaturalRect(
        { x: 100, y: 75, width: 200, height: 150 },
        display,
        natural,
      ),
    ).toEqual({ x: 400, y: 300, width: 800, height: 600 });
  });

  it('is a no-op when the image is displayed at natural size', () => {
    const rect = { x: 10, y: 20, width: 50, height: 60 };

    expect(toNaturalRect(rect, natural, natural)).toEqual(rect);
  });

  it('clamps the selection to the natural bounds', () => {
    expect(
      toNaturalRect(
        { x: 390, y: 290, width: 50, height: 50 },
        display,
        natural,
      ),
    ).toEqual({ x: 1560, y: 1160, width: 40, height: 40 });
  });
});
