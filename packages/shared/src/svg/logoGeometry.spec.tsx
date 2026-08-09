import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LogoIcon from './LogoIcon';
import { markAlphas, markPaths, MARK_VIEWBOX } from './logoGeometry';

/**
 * The mark is drawn in one place and sampled in another — the agent's thinking
 * indicator flies it apart grain by grain. The two held the same path strings
 * independently once, which meant a logo tweak would have left the indicator
 * drawing the old shape with nothing failing. This is the guard on that: the
 * geometry module is the only copy, and the logo draws exactly it.
 *
 * Rendered to markup rather than into a DOM, because an `<svg>` of paths has no
 * roles to query and its shape is the whole assertion.
 */
describe('the logo mark', () => {
  const view = renderToStaticMarkup(<LogoIcon />);

  it('is drawn from the shared geometry, stroke for stroke', () => {
    expect(view).toContain(`viewBox="${MARK_VIEWBOX}"`);

    markPaths.forEach((d) => expect(view).toContain(d));
    expect(view.match(/<path/g)).toHaveLength(markPaths.length);
  });

  it('keeps the tail as the lighter stroke', () => {
    // The indicator reads the same alphas to weight its grains, so these are
    // the one thing the two uses share beyond the paths themselves.
    expect(markAlphas).toEqual([1, 1, 0.64]);
    expect(markPaths).toHaveLength(markAlphas.length);
    expect(view).toContain('fill-opacity="0.64"');
  });
});
