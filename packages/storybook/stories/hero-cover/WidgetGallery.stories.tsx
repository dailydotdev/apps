import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Case, Page } from './parts';
import {
  unavailableExamples,
  WidgetGallery,
  WidgetGalleryPhone,
  WidgetGalleryPhoneDetail,
} from './widgets/gallery';

const meta: Meta = {
  title: 'Hero Cover/Final/3. Widget gallery',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Labeled = ({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex flex-col gap-2">
    <figcaption className="text-text-tertiary typo-footnote">
      {caption}
    </figcaption>
    {children}
  </figure>
);

const principles: [string, string][] = [
  [
    'See it first',
    'The stage shows the real widget, live, at true scale where it fits. Production’s gallery is a list of icons and one-line descriptions, so readers add a widget without knowing what it looks like.',
  ],
  [
    'Size before add',
    'Small, Tall and Large swap the preview in place, and the widget is added in the size you were looking at. Only the sizes a widget has are offered.',
  ],
  [
    'Find fast',
    'Search, then Suggested for you, then categories (News, You, Community, Tools, daily.dev). A check marks what is on your rail already; a lock marks what needs something first.',
  ],
  [
    'Say why, offer the way',
    'When a widget can’t be added, the footer says why and offers the fix: Find a squad, Turn on streaks. A full rail says so instead of a silent disabled button.',
  ],
  [
    'One action',
    'Add widget, in the footer, always in the same place. Squad updates can be added once per squad (Add another). Removed tips come back from the same place.',
  ],
  [
    'Phones',
    'A sheet: search, suggested widgets as big live cards you swipe, then every widget as a row. Opening one shows its sizes as pages you swipe, with dots, and Add widget at the bottom, as iOS does.',
  ],
];

export const WidgetGalleryPage: StoryObj = {
  name: '3. Widget gallery',
  render: () => (
    <Page
      chapter="Final · 3"
      question="How do readers choose a widget?"
      title="Widget gallery"
      goal="Replace the list of rows with a gallery that shows each widget live, at the size the reader picks, and adds it in one step, with every rule production already has: added, more than one, needs something first, a full rail and removed tips."
      metric="Widgets added per gallery open, the share of opens that end with an add, and how often readers change size after adding."
    >
      <Case title="What changes">
        <dl
          className="grid max-w-[64rem] gap-x-6 gap-y-2.5 typo-callout"
          style={{ gridTemplateColumns: '10rem 1fr' }}
        >
          {principles.map(([term, text]) => (
            <React.Fragment key={term}>
              <dt className="font-bold text-text-primary">{term}</dt>
              <dd className="text-text-secondary">{text}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Case>

      <Case
        title="Desktop"
        note="Opened from New widget in the rail’s header, or the dashed tile at the end of the rail. Everything works: pick a widget, switch its size, search, add."
      >
        <WidgetGallery />
      </Case>

      <Case title="Use cases">
        <div className="flex flex-col gap-10">
          <Labeled caption="A Small widget: Weather">
            <WidgetGallery initial="weather" />
          </Labeled>
          <Labeled caption="Already on your rail">
            <WidgetGallery initial="happening" />
          </Labeled>
          <Labeled caption="More than one: Squad updates, once per squad">
            <WidgetGallery initial="squads" onRail={['featured', 'squads']} />
          </Labeled>
          <Labeled caption="Needs something first: no squads joined">
            <WidgetGallery initial="squads" unavailable={unavailableExamples} />
          </Labeled>
          <Labeled caption="Needs something first: streaks turned off">
            <WidgetGallery initial="streak" unavailable={unavailableExamples} />
          </Labeled>
          <Labeled caption="The rail is full">
            <WidgetGallery initial="todo" isRailFull />
          </Labeled>
          <Labeled caption="Tips were removed: they come back from here">
            <WidgetGallery initial="tips" hasTipsRemoved />
          </Labeled>
          <Labeled caption="Search">
            <WidgetGallery initial="digest" initialQuery="brief" />
          </Labeled>
          <Labeled caption="Search, nothing found">
            <WidgetGallery initial="featured" initialQuery="kubernetes" />
          </Labeled>
        </div>
      </Case>

      <Case
        title="Phone"
        note="The list, then a widget opened: swipe between its sizes."
      >
        <div className="flex flex-wrap gap-8">
          <WidgetGalleryPhone />
          <WidgetGalleryPhoneDetail kind="weather" />
          <WidgetGalleryPhoneDetail kind="todo" />
        </div>
      </Case>
    </Page>
  ),
};
