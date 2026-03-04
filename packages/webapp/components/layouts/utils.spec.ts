import { getTemplatedTitle } from './utils';

describe('getTemplatedTitle', () => {
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
