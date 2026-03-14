import { getPageSeoTitles, getTemplatedTitle } from './utils';

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
    const title =
      'How to implement authentication and authorization in modern systems with confidence';

    expect(getTemplatedTitle(title)).toBe(
      'How to implement authentication and authorization in...',
    );
  });
});

describe('getPageSeoTitles', () => {
  it('keeps SEO title truncated while og title remains full', () => {
    const title =
      'How to implement authentication and authorization in modern systems with confidence';

    expect(getPageSeoTitles(title)).toEqual({
      title: 'How to implement authentication and authorization in...',
      openGraph: {
        title: `${title} | daily.dev`,
      },
    });
  });

  it('returns matching SEO and og titles when title is short', () => {
    const title = 'Build with confidence';

    expect(getPageSeoTitles(title)).toEqual({
      title: `${title} | daily.dev`,
      openGraph: {
        title: `${title} | daily.dev`,
      },
    });
  });
});
