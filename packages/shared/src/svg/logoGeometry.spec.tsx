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

// Asserted against markup rather than a DOM: an `<svg>` of paths has no roles
// to query.
describe('the logo mark', () => {
  const view = renderToStaticMarkup(<LogoIcon />);

  it('is drawn from the shared geometry, stroke for stroke', () => {
    expect(view).toContain(`viewBox="${MARK_VIEWBOX}"`);

    markPaths.forEach((d) => expect(view).toContain(d));
    expect(view.match(/<path/g)).toHaveLength(markPaths.length);
  });

  it('keeps the tail as the lighter stroke', () => {
    expect(markAlphas).toEqual([1, 1, 0.64]);
    expect(markPaths).toHaveLength(markAlphas.length);
    expect(view).toContain('fill-opacity="0.64"');
  });
});

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
    // The group's `evenodd` would punch the letter counters through.
    expect(view).toContain('fill-rule="nonzero"');
  });

  it('adds the Plus sparkle only when it is asked for', () => {
    expect(view).not.toContain('var(--theme-actions-plus-default)');
    expect(renderToStaticMarkup(<LogoText isPlus />)).toContain(
      'var(--theme-actions-plus-default)',
    );
  });
});
