import { getBrandColor, getBrandInk, isHexColor } from './branding';

describe('squad branding', () => {
  it('accepts six digit hex colours only', () => {
    expect(isHexColor('#FF570A')).toBe(true);
    expect(isHexColor('#ff570a')).toBe(true);
    expect(isHexColor('#FFF')).toBe(false);
    expect(isHexColor('orange')).toBe(false);
    expect(isHexColor(null)).toBe(false);
  });

  it('picks the button text with the higher contrast', () => {
    // White on this orange is 3.2:1, below AA; dark text reads at 5.9:1
    const orange = getBrandInk('#FF570A');
    expect(orange.isDark).toBe(true);
    expect(orange.ratio).toBeGreaterThan(4.5);

    const purple = getBrandInk('#7147ED');
    expect(purple.isDark).toBe(false);
    expect(purple.ink).toBe('#FFFFFF');
  });

  it('ignores a missing or invalid brand colour', () => {
    expect(getBrandColor({ color: '#2D7FF9', button: null })).toBe('#2D7FF9');
    expect(getBrandColor({ color: 'blue', button: null })).toBeNull();
    expect(getBrandColor(undefined)).toBeNull();
  });
});
