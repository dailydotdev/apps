import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../parts';
import { Decisions, StateRow } from './review';
import {
  mostVisited,
  myShortcuts,
  ShortcutsGetStarted,
  ShortcutsPermission,
  ShortcutsWidget,
} from './shortcuts';

const meta: Meta = {
  title: 'Hero Cover/Archive/Widget states/Shortcuts',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Shortcuts: StoryObj = {
  name: 'Shortcuts',
  render: () => (
    <Page
      chapter="Widget states"
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
            'Tile style in grid: tile, icon only, or chip',
          ]}
        />
      </Case>
      <Case title="Every state, at every size">
        <div className="flex flex-col gap-8">
          <StateRow
            title="Your shortcuts"
            note="The reader's own list, with the add tile while there is room. In the extension, Small and Tall switch between Shortcuts and Most visited with tabs in the header, and Large shows both; the toggle on the right flips grid and list."
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
            note="No top sites in a web page, so no tabs: the header is just Shortcuts."
            render={(size) => (
              <ShortcutsWidget size={size} isExtension={false} />
            )}
          />
          <StateRow
            title="List mode: your shortcuts"
            note="A row per site with its domain, so similar favicons never get confused. Scrolls past what fits; Large splits into two columns."
            render={(size) => <ShortcutsWidget size={size} layout="list" />}
          />
          <StateRow
            title="List mode: most visited"
            render={(size) => (
              <ShortcutsWidget
                size={size}
                layout="list"
                initialSource="visited"
              />
            )}
          />
          <StateRow
            title="List mode on the webapp"
            render={(size) => (
              <ShortcutsWidget size={size} layout="list" isExtension={false} />
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
            title="Large: both lists"
            note="In the extension Large has room for both sources, so it shows them side by side and needs no tabs. The column names are the header, each over its own column."
            variants={[
              {
                caption: 'Large · grid',
                size: 'l',
                node: <ShortcutsWidget size="l" />,
              },
              {
                caption: 'Large · list',
                size: 'l',
                node: <ShortcutsWidget size="l" layout="list" />,
              },
            ]}
          />
          <StateRow
            title="Large: a short list on one side"
            note="Each column keeps its own length; Shortcuts ends with the add tile while there is room."
            variants={[
              {
                caption: 'Large · four shortcuts',
                size: 'l',
                node: (
                  <ShortcutsWidget
                    size="l"
                    shortcuts={myShortcuts.slice(0, 4)}
                  />
                ),
              },
              {
                caption: 'Large · both short, as a list',
                size: 'l',
                node: (
                  <ShortcutsWidget
                    size="l"
                    shortcuts={myShortcuts.slice(0, 4)}
                    visited={mostVisited.slice(0, 5)}
                    layout="list"
                  />
                ),
              },
            ]}
          />
          <StateRow
            title="Large: nothing pinned yet, or most visited not allowed"
            note="An empty side asks for what would fill it, in place, so the other list keeps its column."
            variants={[
              {
                caption: 'Large · nothing pinned',
                size: 'l',
                node: <ShortcutsWidget size="l" shortcuts={[]} />,
              },
              {
                caption: 'Large · most visited not allowed',
                size: 'l',
                node: <ShortcutsWidget size="l" isMostVisitedAllowed={false} />,
              },
            ]}
          />
          <StateRow
            title="Large: one list"
            note="Without most visited (the webapp), Large is one list sized to fill: launcher tiles 4 by 3, or two columns of six rows."
            variants={[
              {
                caption: 'Large · webapp grid',
                size: 'l',
                node: <ShortcutsWidget size="l" isExtension={false} />,
              },
              {
                caption: 'Large · webapp list',
                size: 'l',
                node: (
                  <ShortcutsWidget size="l" isExtension={false} layout="list" />
                ),
              },
            ]}
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
