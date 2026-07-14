import type { ReactElement } from 'react';
import React from 'react';
import { render } from '@testing-library/react';
import type { NextSeoProps } from 'next-seo/lib/types';
import { DefaultSeo, NextSeo } from 'next-seo';
import { HeadManagerContext } from 'next/dist/shared/lib/head-manager-context.shared-runtime';
import { defaultSeo, defaultSeoTitle, robotsProps } from '../next-seo';

// Mirrors the DefaultSeo + page-level NextSeo render order in `_app.tsx`. The
// HeadManagerContext captures the deduped set of head elements that next/head
// would flush, so we can assert exactly one robots tag survives and the
// page-level noindex wins — the whole point of moving robots off
// `additionalMetaTags` and onto next-seo's first-class robots handling.
const renderRobotsTags = (seo?: NextSeoProps): ReactElement[] => {
  let headState: ReactElement[] = [];
  const headManager = {
    mountedInstances: new Set(),
    updateHead: (state: ReactElement[]) => {
      headState = state;
    },
  } as never;

  render(
    <HeadManagerContext.Provider value={headManager}>
      <DefaultSeo
        {...defaultSeo}
        title={defaultSeoTitle}
        robotsProps={robotsProps}
      />
      {!!seo && <NextSeo robotsProps={robotsProps} {...seo} />}
    </HeadManagerContext.Provider>,
  );

  return headState.filter(
    (el) => (el?.props as { name?: string })?.name === 'robots',
  );
};

const contentOf = (tag: ReactElement): string =>
  (tag.props as { content: string }).content;

describe('app SEO robots tag', () => {
  it('emits exactly one robots tag for a public page', () => {
    const robots = renderRobotsTags({ title: 'Public page' });

    expect(robots).toHaveLength(1);
  });

  it('keeps the max-* directives on public pages after migrating off additionalMetaTags', () => {
    const [robots] = renderRobotsTags({ title: 'Public page' });

    expect(contentOf(robots)).toBe(
      'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
    );
  });

  it('makes a private squad noindex,nofollow with no stray index,follow tag', () => {
    const robots = renderRobotsTags({ noindex: true, nofollow: true });

    expect(robots).toHaveLength(1);
    expect(contentOf(robots[0])).toMatch(/^noindex,nofollow/);
    robots.forEach((tag) => expect(contentOf(tag)).not.toContain('index,follow'));
  });

  it('falls back to a single default robots tag when a page renders no page-level seo', () => {
    const robots = renderRobotsTags();

    expect(robots).toHaveLength(1);
    expect(contentOf(robots[0])).toBe(
      'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1',
    );
  });
});
