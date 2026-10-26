import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React from 'react';
import { Case, Page } from './parts';
import type { WidgetKind, WidgetSize } from './widgets/catalog';
import { WidgetContent, WidgetSurface, widgetCatalog } from './widgets/catalog';
import { agreedWidgets, ideaWidgets } from './widgets/library';

const meta: Meta = {
  title: 'Hero Cover/Final/0. Decisions',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Row = [string, string];

const hero: Row[] = [
  [
    'V1',
    'The rail: one horizontal row of widgets above the feed, on the feed’s own columns. Ships first.',
  ],
  [
    'V2',
    'The home screen with stacks, as the next step. Kept in Archive › Finals (V2 direction), direction A.',
  ],
  [
    'Ours',
    'The ad slot is locked and always the second widget. It carries the ad and up to two campaign strips.',
  ],
  [
    'Yours',
    'Everything else: add, remove, reorder, resize, the first slot too, so the top story can grow or shrink.',
  ],
  [
    'Sizes',
    'Three: Small (one column, half height), Tall (one column) and Large (two columns). No wide size.',
  ],
  [
    'Phone',
    'The same rail, swiped sideways. The ad slot leaves the rail and the ad returns to the feed, second, after the first post.',
  ],
];

const customize: Row[] = [
  [
    'Doors',
    'Four ways into one edit mode: Customize on the greeting row (with its E shortcut on the button), Customize hero at the end of the feed’s tab row, a pencil on any widget’s corner on hover, and E from anywhere.',
  ],
  [
    'Edit',
    'Every widget gets a menu (size, move, remove), so nothing needs a drag. Corners resize and snap to the sizes the widget supports.',
  ],
  ['Remove', 'Instant, no dialog, with Undo for 6 seconds.'],
  [
    'Add',
    'The dashed tile at the end opens the gallery; the new widget lands at the end and flashes.',
  ],
  [
    'Leave',
    'Done, Escape or a click outside. Reduced motion drops the jiggle and the lift; everything still works.',
  ],
];

const rules: Row[] = [
  [
    'Frame',
    '16px inside every widget. Content starts right under the header; nothing floats in an empty top half.',
  ],
  [
    'Header',
    'A 16px glyph and the name in caption, in the widget’s accent, top-left. The way out (View all) or the widget’s one control sits top-right.',
  ],
  [
    'Color',
    'One accent per widget. Its mood is a low glow of that accent, so the content always leads. Semantic tokens only, so every widget works in light and dark.',
  ],
  [
    'Lists',
    'Scroll inside the widget and fade only at an edge where there is more.',
  ],
  ['Actions', 'One primary action at most, a design-system button.'],
  [
    'Sizes',
    'Each size is designed, not scaled: Small says one thing, Tall adds the list, Large adds a second column.',
  ],
];

const newWidgets: Row[] = [
  [
    'Weather',
    'In daily.dev’s language, not Apple’s: the sky’s condition as an accent glow, our line glyphs and type. Small is the temperature, then the next four hours. The day ranges use the one accent of the sky. Asks for a location once.',
  ],
  [
    'Shortcuts',
    'Production’s ShortcutTile. In the extension the header is two tabs, Shortcuts and Most visited; on the webapp just Shortcuts. A toggle top-right flips grid and list (name over domain). Up to 12 (MAX_SHORTCUTS); Large lays them out 4 by 3.',
  ],
  [
    'Getting started',
    'Speaks the intro quests popup we are launching (#7049, finalist 2, Checklist): one avocado accent, the reward line over a count title, a segmented meter, dashed circles that fill green, only the current step open with its one button and its rewards under it. Small is that step as a compact card, with the meter folded into the header. Retires itself once every quest is claimed.',
  ],
  [
    'To-do',
    'The + in the header on every size opens the input under it and stays open for the next one; Escape closes. Click a to-do to edit it, clear it to delete it, so there is no delete button. Drag the handle on the right, or Alt + arrows, to reorder. A ticked to-do settles, then folds into Done. Saved on the device for launch.',
  ],
];

const open: Row[] = [
  [
    'Account',
    'Save the reader’s rail (widgets, order, sizes) to their account, so it follows them between the webapp and the extension.',
  ],
  [
    'Settings',
    'Per-widget settings: a city for Weather, a list for Shortcuts.',
  ],
  [
    'Defaults',
    'A starting rail per kind of reader (new, regular, Plus), with Getting started first for new readers.',
  ],
  [
    'Logging',
    'Impressions and clicks per widget, to see which widgets earn their slot.',
  ],
  [
    'More',
    'The next widgets are ranked in Archive › Widget exploration › Launch candidates.',
  ],
];

const Rows = ({ rows }: { rows: Row[] }): ReactElement => (
  <dl className="grid max-w-[64rem] grid-cols-[9rem_1fr] gap-x-6 gap-y-2.5 typo-callout">
    {rows.map(([term, text]) => (
      <React.Fragment key={term}>
        <dt className="font-bold text-text-primary">{term}</dt>
        <dd className="text-text-secondary">{text}</dd>
      </React.Fragment>
    ))}
  </dl>
);

const Names = ({ kinds }: { kinds: WidgetKind[] }): ReactElement => (
  <ul className="flex max-w-[64rem] flex-wrap gap-2">
    {kinds.map((kind) => (
      <li
        key={kind}
        className="rounded-10 bg-surface-float px-3 py-1.5 text-text-secondary typo-footnote"
      >
        {widgetCatalog[kind].name}
      </li>
    ))}
  </ul>
);

const newKinds: WidgetKind[] = ['weather', 'shortcuts', 'introquests', 'todo'];

const Widget = ({
  kind,
  size,
}: {
  kind: WidgetKind;
  size: WidgetSize;
}): ReactElement => (
  <div className="flex h-[27.5rem] w-[17.25rem] shrink-0">
    <WidgetSurface className="flex-1">
      <WidgetContent kind={kind} size={size} />
    </WidgetSurface>
  </div>
);

export const Decisions: StoryObj = {
  name: '0. Decisions',
  render: () => (
    <Page
      chapter="Final · 0"
      question="What did we decide?"
      title="The hero cover, decided"
      goal="One page with every decision we agreed on and built: the rail, how readers customize it, the rules every widget follows, and each new widget. Everything explored and not chosen is in Archive."
      metric="Hero clicks per visit and the share of readers who customize, with ad revenue per visit held flat against today’s hero."
    >
      <Case title="What ships" note="The live rail is on 1. V1 Rail.">
        <Rows rows={hero} />
      </Case>
      <Case title="How readers customize" note="Every door is on 2. Customize.">
        <Rows rows={customize} />
      </Case>
      <Case title="Rules every widget follows">
        <Rows rows={rules} />
      </Case>
      <Case
        title="The launch set"
        note="Each one at every size is on 3. Widget library, with a Launch, Later or Cut call per widget. The ideas below are not in the launch set."
      >
        <div className="flex flex-col gap-3">
          <Names kinds={agreedWidgets} />
          <span className="text-text-tertiary typo-footnote">Ideas</span>
          <Names kinds={ideaWidgets} />
        </div>
      </Case>
      <Case
        title="The four new widgets"
        note="Each has its own page (4 to 7) with every state at every size. All of them work here: add a to-do, flip the shortcuts, start and claim a step."
      >
        <div className="flex flex-col gap-6">
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2">
            {newKinds.map((kind) => (
              <Widget key={kind} kind={kind} size="m" />
            ))}
          </div>
          <Rows rows={newWidgets} />
        </div>
      </Case>
      <Case
        title="Still open"
        note="What the rail needs before it scales, beyond the widgets."
      >
        <Rows rows={open} />
      </Case>
    </Page>
  ),
};
