import React from 'react';
import type { Category, Family } from '../kit';
import { feedGrid } from './feedGrid';
import { widgetRail } from './widgetRail';
import { framedColumns } from './framedColumns';
import { listPane } from './listPane';
import { workspace } from './workspace';
import { menuPane } from './menuPane';
import { narrowColumn } from './narrowColumn';
import { wideColumn } from './wideColumn';
import { productChrome } from './productChrome';
import { funnelAuth } from './funnelAuth';

/** A copy of a layout category holding only the named variants. */
const pick = (
  category: Category,
  names: string[],
  overrides: Partial<Omit<Category, 'variants'>> = {},
): Category => ({
  ...category,
  ...overrides,
  variants: names.map((name) => {
    const variant = category.variants.find((item) => item.name === name);
    if (!variant) {
      throw new Error(`${category.title} has no variant "${name}"`);
    }
    return variant;
  }),
});

export const discoveryFeedGrid = feedGrid;

export const discoveryWideColumn = pick(wideColumn, [
  'Entity page: hero, rails, then the feed',
  'Directory: strip, hero, grid',
  'Explore hub grid',
  'Squads directory sections',
  'Banner over a full-width grid',
]);

export const contentWorkspace = workspace;
export const contentNarrowColumn = narrowColumn;

export const contentWideColumn = pick(
  wideColumn,
  ['Centred detail', 'Wide single column'],
  {
    summary:
      'One item on a wide single column of stacked sections, capped around 1020–1152px.',
    intro: (
      <p>
        The same stacked column as the discovery pages, but the page is about
        one thing: a user, a game centre, a briefing, a hackathon.
      </p>
    ),
  },
);

export const contentWidgetRail = widgetRail;
export const contentFramedColumns = framedColumns;

export const contentListPane = listPane;

export const contentMenuPane: Category = {
  ...menuPane,
  variants: [
    ...menuPane.variants,
    ...pick(wideColumn, ['Full-width menu']).variants,
  ],
};

export const marketingProductChrome = pick(productChrome, ['Plus', 'Cores'], {
  summary:
    "Product pitch and checkout pages with a header of their own instead of the app's navigation.",
  intro: (
    <p>
      Plus and Cores draw their own header and leave the app navigation and the
      phone bottom bar out. Laptop shows a pitch and a checkout side by side;
      smaller screens get one column.
    </p>
  ),
});

export const standaloneProductChrome = pick(
  productChrome,
  [
    'Recruiter app',
    'Recruiter matches',
    'Opportunity flow',
    'No-sidebar centred',
    '404',
  ],
  {
    summary:
      "Pages that leave the app's sidebar for the recruiter header or a bare global header.",
  },
);

export const standaloneFunnelAuth = funnelAuth;

/** In the order the overview and the sidebar list them. */
export const families: Family[] = [
  {
    title: 'Discovery',
    summary:
      'Pages for browsing many things at once: feeds, directories and hubs whose grids carry the width.',
    groups: [
      {
        categories: [discoveryFeedGrid, discoveryWideColumn],
      },
    ],
  },
  {
    title: 'Content',
    summary:
      'Pages built around one thing to read, fill in or work on: a post, a profile, a thread, a form.',
    groups: [
      {
        categories: [contentWorkspace, contentNarrowColumn, contentWideColumn],
      },
      {
        title: 'Content + widgets',
        summary:
          'The content column with a column of widgets or details beside it.',
        categories: [contentWidgetRail, contentFramedColumns],
      },
      {
        title: 'Content + left sidebar',
        summary: 'A list or menu on the left that drives the pane next to it.',
        categories: [contentListPane, contentMenuPane],
      },
    ],
  },
  {
    title: 'Marketing',
    summary: 'Product pitch and checkout pages: Plus and Cores.',
    groups: [{ categories: [marketingProductChrome] }],
  },
  {
    title: 'Standalone',
    summary:
      "Flows and tools outside the app's navigation: the recruiter product, onboarding, auth, payment and 404.",
    groups: [{ categories: [standaloneProductChrome, standaloneFunnelAuth] }],
  },
];
