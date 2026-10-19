import {
  coverAccents,
  coverLogExtra,
  getCoverAccent,
  getCoverBrand,
  getCoverVariant,
} from './cover';
import { cloudinaryPostImageCoverPlaceholder } from './image';

const realImage =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/abc';
const on = { enabled: true, hook: true };
const patternOnly = { enabled: true, hook: false };
const off = { enabled: false, hook: false };

describe('getCoverVariant', () => {
  it('keeps a real image and the placeholder while disabled', () => {
    expect(getCoverVariant({ image: realImage }, on)).toBe('image');
    expect(getCoverVariant({ image: undefined }, off)).toBe('placeholder');
    expect(
      getCoverVariant({ image: cloudinaryPostImageCoverPlaceholder }, off),
    ).toBe('placeholder');
  });

  it('paints the hook only when both the hook flag and the hook exist', () => {
    const base = { image: cloudinaryPostImageCoverPlaceholder };
    expect(getCoverVariant({ ...base, hook: 'Open in name only' }, on)).toBe(
      'hook',
    );
    expect(
      getCoverVariant({ ...base, hook: 'Open in name only' }, patternOnly),
    ).toBe('pattern');
    expect(getCoverVariant(base, on)).toBe('pattern');
    expect(getCoverVariant({ image: undefined }, on)).toBe('pattern');
  });
});

describe('getCoverBrand', () => {
  it('uses the strongest logo colour when the API has one', () => {
    expect(
      getCoverBrand({ handle: 'hn', flags: { logoColors: ['#FF6D00'] } }),
    ).toBe('#FF6D00');
  });

  it('falls back to a theme accent keyed on the source', () => {
    const brand = getCoverBrand({
      handle: 'phoronix',
      flags: { logoColors: [] },
    });
    expect(brand).toBe(
      `var(--theme-accent-${getCoverAccent({ handle: 'phoronix' })}-default)`,
    );
    expect(coverAccents).toContain(getCoverAccent({ handle: 'phoronix' }));
    expect(getCoverBrand(undefined)).toBe(
      `var(--theme-accent-${coverAccents[0]}-default)`,
    );
  });

  it('ignores a value that is not a hex colour', () => {
    expect(
      getCoverBrand({ handle: 'x', flags: { logoColors: ['red'] } }),
    ).toMatch(/^var\(/);
  });
});

describe('coverLogExtra', () => {
  it('labels only covers that replaced the image', () => {
    expect(coverLogExtra({ image: realImage }, on)).toEqual({});
    expect(
      coverLogExtra(
        { image: cloudinaryPostImageCoverPlaceholder, hook: 'H' },
        on,
      ),
    ).toEqual({ cover: 'hook' });
    expect(
      coverLogExtra({ image: cloudinaryPostImageCoverPlaceholder }, off),
    ).toEqual({
      cover: 'placeholder',
    });
  });
});
