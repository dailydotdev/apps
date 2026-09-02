import { withoutLayoutVariantPrefix } from './layoutVariant';

describe('withoutLayoutVariantPrefix', () => {
  it('drops the mirror prefix so page-path checks still match', () => {
    expect(withoutLayoutVariantPrefix('/layout-v2/posts/[id]')).toBe(
      '/posts/[id]',
    );
  });

  it('leaves an unmirrored route untouched', () => {
    expect(withoutLayoutVariantPrefix('/posts/[id]')).toBe('/posts/[id]');
  });

  it('does not strip a route that merely starts with the same segment', () => {
    expect(withoutLayoutVariantPrefix('/layout-v2-preview')).toBe(
      '/layout-v2-preview',
    );
  });

  it('handles a missing route', () => {
    expect(withoutLayoutVariantPrefix(undefined)).toBe('');
  });
});
