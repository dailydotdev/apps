import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import {
  mostVisited,
  ShortcutsGetStarted,
  ShortcutsPermission,
  ShortcutsWidget,
} from './shortcuts';

const meta: Meta = {
  title: 'Hero Cover/Widgets/9. Shortcuts',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Shortcuts: StoryObj = {
  name: '9. Shortcuts',
  render: () => (
    <Page
      chapter="Widgets · 9"
      question="Should the shortcuts row become a widget?"
      title="Shortcuts and most visited"
      goal="Move the shortcuts row above the feed into the rail, so it takes no row of its own and the reader decides its size and place."
      metric="Shortcut clicks per visit against today's row, and hero height above the fold."
    >
      <Case
        title="How it works"
        note="The tiles are production's ShortcutTile and AddShortcutTile. Two sources, both existing: the reader's own list (customLinks in settings, synced) and the browser's most visited sites (extension only, behind the topSites permission). On the webapp only the reader's own list shows. Tap a tile to open it; Customize to add, edit or reorder."
      >
        <Decisions
          items={[
            'Retire the shortcuts row once the widget ships, or keep both for a while',
            'Default size: Small (8 sites) or Tall (12)',
            'Tile style: tile, icon only, or chip',
            'Offer Most visited on the webapp at all (it needs the extension)',
          ]}
        />
      </Case>
      <Case title="Every state, at every size">
        <div className="flex flex-col gap-8">
          <StateRow
            title="Your shortcuts"
            note="The reader's own list, with the add tile while there is room. In the extension, Mine and Most visited switch in the header."
            render={(size) => <ShortcutsWidget size={size} />}
          />
          <StateRow
            title="Most visited (extension)"
            note="The browser's top sites. Read-only: the reader can hide a site but not reorder."
            render={(size) => (
              <ShortcutsWidget size={size} initialSource="visited" />
            )}
          />
          <StateRow
            title="On the webapp"
            note="No top sites in a web page, so no switch: only the reader's list."
            render={(size) => (
              <ShortcutsWidget size={size} isExtension={false} />
            )}
          />
          <StateRow
            title="Icon only"
            note="The compact appearance: more sites, no names."
            render={(size) => <ShortcutsWidget size={size} appearance="icon" />}
          />
          <StateRow
            title="Chips"
            note="Name-first, two columns: reads well when sites share a favicon."
            render={(size) => <ShortcutsWidget size={size} appearance="chip" />}
          />
          <StateRow
            title="Most visited, before permission"
            note="The browser asks once. Until then, a clear reason to say yes."
            render={(size) => <ShortcutsPermission size={size} />}
          />
          <StateRow
            title="Nothing pinned yet"
            note="First run, from the hub's get-started state."
            render={(size) => <ShortcutsGetStarted size={size} />}
          />
          <StateRow
            title="A few shortcuts"
            note="Three sites and the add tile: the widget never looks empty."
            render={(size) => (
              <ShortcutsWidget
                size={size}
                isExtension={false}
                shortcuts={mostVisited.slice(0, 3)}
              />
            )}
          />
        </div>
      </Case>
    </Page>
  ),
};
