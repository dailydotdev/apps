import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Cell,
  devices,
  DocPage,
  Mark,
  PageFrame,
  Section,
  Table,
  Viewer,
} from './doc';
import { PostKind } from './data';

const meta: Meta = {
  title: 'Post Page Hybrid, ad slots/1. Ad inventory',
  parameters: { layout: 'fullscreen' },
};

export default meta;

export const Overview: StoryObj = {
  render: () => (
    <DocPage
      eyebrow="Post Page Hybrid · Ad inventory"
      title="Every unit back where it earned"
      intro={
        <>
          <p>
            This folder is the logged-out page with production’s programmatic
            units drawn in. They are not the /articles arbitrage template: they
            run on the regular post page for every logged-out visitor, on
            articles and videos, since the post_adsense experiment won
            (useOrganicAdSlots). The direct-sold card runs for everyone but
            Plus. Slot numbers are the organic map in slots.ts.
          </p>
          <p>
            The experiment kept most slots but moved the two the rail carried:
            the direct-sold card fell into the column under the article, and the
            rail MPU stood alone beside the column, or under the whole thread
            below laptop. The hybrid puts both back at the top of the rail.
          </p>
        </>
      }
    >
      <Table
        head={['Unit', 'Classic today', 'Redesign experiment', 'Hybrid']}
        rows={[
          [
            '15 · Top leaderboard',
            'First thing in the column, tablet up, pinned 10s',
            <Cell key="r" mark={Mark.Same}>
              Same
            </Cell>,
            <Cell key="h" mark={Mark.Same}>
              Same, inside the card
            </Cell>,
          ],
          [
            '21 · Phone strip 320x50',
            'Pinned at the top on phones',
            <Cell key="r" mark={Mark.Same}>
              Same
            </Cell>,
            <Cell key="h" mark={Mark.Same}>
              Same
            </Cell>,
          ],
          [
            '22 · TLDR MPU',
            'Every 250 characters of TLDR, up to four, phones keep the first',
            <Cell key="r" mark={Mark.Same}>
              Same, tighter spacing
            </Cell>,
            <Cell key="h" mark={Mark.Same}>
              Same; below laptop Read post sits above the first one
            </Cell>,
          ],
          [
            'Direct-sold card',
            'Rail, under the source and creator cards',
            <Cell key="r" mark={Mark.Loss}>
              Inline in the column, after the article
            </Cell>,
            <Cell key="h" mark={Mark.Win}>
              Rail, under the source and creator cards
            </Cell>,
          ],
          [
            '16 · Rail MPU',
            'Rail, right under the direct-sold card',
            <Cell key="r" mark={Mark.Loss}>
              Alone beside the column, under the whole thread below laptop
            </Cell>,
            <Cell key="h" mark={Mark.Win}>
              Rail, right under the direct-sold card
            </Cell>,
          ],
          [
            '23 · Above the comments',
            'Above the comments',
            <Cell key="r" mark={Mark.Same}>
              Same
            </Cell>,
            <Cell key="h" mark={Mark.Same}>
              Same, under the action bar
            </Cell>,
          ],
          [
            '24 · Thread MPU',
            'Every 6 comments, tablet up',
            <Cell key="r" mark={Mark.Same}>
              Same
            </Cell>,
            <Cell key="h" mark={Mark.Same}>
              Same
            </Cell>,
          ],
          [
            'Sticky tower 300x600',
            'None',
            <Cell key="r" mark={Mark.Same}>
              None
            </Cell>,
            <Cell key="h" mark={Mark.New}>
              Optional: foot of the rail, sticks while the thread scrolls
            </Cell>,
          ],
        ]}
      />

      <Section
        title="The hybrid with the proposed tower"
        lead="Scroll the desktop frame into the thread: the rail’s widgets end early and the tower holds the empty column beside the comments."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PageFrame
            device={{ ...devices.desktop, height: 1200 }}
            kind={PostKind.Article}
            viewer={Viewer.Anonymous}
            programmatic
            stickyRail
            label="Desktop, 1440px, logged out, tower on"
          />
          <PageFrame
            device={devices.phone}
            kind={PostKind.Article}
            viewer={Viewer.Anonymous}
            programmatic
            label="Phone, 375px, logged out"
          />
        </div>
      </Section>
    </DocPage>
  ),
};
