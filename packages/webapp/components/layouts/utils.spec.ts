import { getTemplatedTitle } from './utils';

describe('getTemplatedTitle', () => {
  it('keeps suffix at the 48-char boundary', () => {
    const title = 'a'.repeat(48);

    expect(getTemplatedTitle(title)).toBe(`${title} | daily.dev`);
  });

  it('drops suffix at the 49-char boundary', () => {
    const title = 'a'.repeat(49);

    expect(getTemplatedTitle(title)).toBe(title);
  });

  it('returns bare title at exactly 60 chars', () => {
    const title = 'a'.repeat(60);

    expect(getTemplatedTitle(title)).toBe(title);
  });

  it('truncates at exactly 61 chars', () => {
    const title = 'a'.repeat(61);

    expect(getTemplatedTitle(title)).toBe(`${'a'.repeat(57)}...`);
  });

  it('appends suffix when combined title length is within limit', () => {
    const title = 'Ship focused fixes for crawler indexing';

    expect(getTemplatedTitle(title)).toBe(`${title} | daily.dev`);
  });

  it('drops suffix when only suffix causes overflow', () => {
    const title = 'a'.repeat(55);

    expect(getTemplatedTitle(title)).toBe(title);
  });

  it('truncates and appends ellipsis when base title exceeds limit', () => {
    const title = 'b'.repeat(70);

    expect(getTemplatedTitle(title)).toBe(`${'b'.repeat(57)}...`);
  });
});
