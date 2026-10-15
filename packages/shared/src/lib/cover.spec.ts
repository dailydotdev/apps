import {
  coverAccents,
  coverLogExtra,
  getCoverAccent,
  getCoverVariant,
} from './cover';
import { cloudinaryPostImageCoverPlaceholder } from './image';

const realImage =
  'https://media.daily.dev/image/upload/f_auto,q_auto/v1/posts/1f76bef532ec04b262c93b31de84abaa';

describe('getCoverVariant', () => {
  it('keeps the real image regardless of the flag', () => {
    const post = { image: realImage, hook: 'Open in name only', title: 'T' };
    expect(getCoverVariant(post, true)).toBe('image');
    expect(getCoverVariant(post, false)).toBe('image');
  });

  it('stays on the placeholder while the flag is off', () => {
    const post = {
      image: cloudinaryPostImageCoverPlaceholder,
      hook: 'Open in name only',
      title: 'T',
    };
    expect(getCoverVariant(post, false)).toBe('placeholder');
  });

  it('prefers the hook and falls back to the title', () => {
    const base = { image: cloudinaryPostImageCoverPlaceholder, title: 'T' };
    expect(getCoverVariant({ ...base, hook: 'Open in name only' }, true)).toBe(
      'hook',
    );
    expect(getCoverVariant(base, true)).toBe('title');
    expect(getCoverVariant({ image: undefined, title: '' }, true)).toBe(
      'placeholder',
    );
  });
});

describe('getCoverAccent', () => {
  it('is stable for a tag and always a theme accent', () => {
    expect(getCoverAccent('open-source')).toBe(getCoverAccent('open-source'));
    expect(coverAccents).toContain(getCoverAccent('open-source'));
    expect(coverAccents).toContain(getCoverAccent(undefined));
  });
});

describe('coverLogExtra', () => {
  it('labels only covers that replaced the image', () => {
    expect(coverLogExtra({ image: realImage, title: 'T' }, true)).toEqual({});
    expect(
      coverLogExtra(
        { image: cloudinaryPostImageCoverPlaceholder, title: 'T', hook: 'H' },
        true,
      ),
    ).toEqual({ cover: 'hook' });
    expect(
      coverLogExtra(
        { image: cloudinaryPostImageCoverPlaceholder, title: 'T' },
        false,
      ),
    ).toEqual({ cover: 'placeholder' });
  });
});
