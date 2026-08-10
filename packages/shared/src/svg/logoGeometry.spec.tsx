import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LogoIcon from './LogoIcon';
import LogoText from './LogoText';
import {
  markAlphas,
  markPaths,
  MARK_VIEWBOX,
  wordmarkAlphas,
  wordmarkFillRules,
  wordmarkPaths,
  WORDMARK_VIEWBOX,
} from './logoGeometry';

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

/** The other half of the logo, held to the same rule for the same reason. */
describe('the logo wordmark', () => {
  const view = renderToStaticMarkup(<LogoText />);

  it('is drawn from the shared geometry, letter for letter', () => {
    expect(view).toContain(`viewBox="${WORDMARK_VIEWBOX}"`);

    wordmarkPaths.forEach((d) => expect(view).toContain(d));
    expect(view.match(/<path/g)).toHaveLength(wordmarkPaths.length);
  });

  it('keeps the domain half lighter, and filled by its own rule', () => {
    expect(wordmarkAlphas).toEqual([1, 0.64]);
    expect(wordmarkPaths).toHaveLength(wordmarkAlphas.length);
    expect(wordmarkPaths).toHaveLength(wordmarkFillRules.length);
    expect(view).toContain('fill-opacity="0.64"');
    // Swapping this for the group's `evenodd` punches the counters through.
    expect(view).toContain('fill-rule="nonzero"');
  });

  it('adds the Plus sparkle only when it is asked for', () => {
    expect(view).not.toContain('var(--theme-actions-plus-default)');
    expect(renderToStaticMarkup(<LogoText isPlus />)).toContain(
      'var(--theme-actions-plus-default)',
    );
  });
});
