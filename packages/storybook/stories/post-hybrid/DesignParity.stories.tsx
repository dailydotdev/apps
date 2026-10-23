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
  Version,
  Viewer,
} from './doc';
import { PostKind } from './data';

const meta: Meta = {
  title: 'Post Page Hybrid/5. Design parity',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const same = (text = 'Same') => <Cell mark={Mark.Same}>{text}</Cell>;
const changed = (text: string) => <Cell mark={Mark.New}>{text}</Cell>;
const restored = (text: string) => <Cell mark={Mark.Win}>{text}</Cell>;
const gap = (text: string) => <Cell mark={Mark.Loss}>{text}</Cell>;

// Every user-visible decision of the redesign (PostFocusCard and friends at
// d31768762^), audited against the hybrid. Green: back from classic.
// Purple: deliberately different. Red: not carried, with the reason.
const rows = [
  [
    'Padding',
    'px-4, px-6 from tablet, px-8 from laptop; 24px top and bottom',
    changed(
      'As on the profile and Squad pages: 16px sides on phones, 24px on every side from tablet',
    ),
  ],
  [
    'Page frame',
    'One 72rem card, a 768px column, no sidebar',
    changed(
      'Profile and Squad frame: the card beside a 320px rail; the card is up to 656px on laptop and 784px from laptopL, narrower with the app sidebar open',
    ),
  ],
  [
    'Header row',
    'Compact source (40px logo, callout name, hover card, subtle Follow) or author with Follow; Boost; vertical "…" menu',
    changed(
      'Same, plus Read post in the corner from laptop, just left of "…", and no copy link (the action bar has it). Collections show the feed card’s source stack instead of the Collections source',
    ),
  ],
  [
    'Squad attribution',
    '"Shared via" or "Posted in" with the Squad, hover card and verified badge',
    same(),
  ],
  ['Commentary', 'Sharer’s text in body type, line breaks kept', same()],
  [
    'Shared X post',
    'Tweet embed in place of title, cover and Read post',
    changed(
      'Same embed, with Read on X in its top right corner where the X logo was. X posts get the same',
    ),
  ],
  [
    'Title',
    'title3, title1 from tablet, a link to the article, balanced',
    changed('Same, but title1 only once the column is 576px wide'),
  ],
  [
    'Metadata row',
    'Date, read time, "From domain" under the title, wraps on phones',
    same(),
  ],
  [
    'Cover',
    'Always beside the title, every type and width: 112px square below tablet, 192px at 25:13 from tablet',
    changed(
      'Same two shapes, always beside the title, switched by the column’s width so the thumbnail never squeezes the title beside the rail',
    ),
  ],
  [
    'Cover click',
    'Opens the article with a lift, or the lightbox for native posts',
    same(),
  ],
  [
    'Read post',
    'Filled pill, "Read post" / "Watch video", Earth icon in the reader variant, above the TLDR on phones and under it from tablet',
    changed(
      'Moved: the header corner, just left of "…", from laptop. Below laptop it stays under the date and read time, and before the first in-TLDR ad for logged-out visitors. Not on videos: the player is right there',
    ),
  ],
  ['TLDR', 'Secondary text with the snapshot button inline', same()],
  ['Video TLDR', 'Four lines with a measured "… Show more"', same()],
  [
    'Video player',
    '70% wide from mobileXL, grows to full width on first play; the cookie placeholder left a 28px gap under itself',
    changed('Same, without the gap under the cookie placeholder'),
  ],
  [
    'Markdown body',
    'Squad posts and collections: body, paragraph snapshots, embeds',
    same(),
  ],
  ['Tags', 'Not on squad posts or shares', same()],
  [
    'Signup widget',
    'After the content only',
    restored('After the content, and back at the top of the rail'),
  ],
  ['Community sentiment', 'After the tags and the signup widget', same()],
  [
    'Collection sources',
    'Carousel of source cards in the column',
    changed('Classic rail list, second in the rail, so it is not shown twice'),
  ],
  [
    'Direct-sold ad',
    'Flat card in the column, under the article',
    restored(
      'Rail card under the source and creator, "Advertise here" now flush left',
    ),
  ],
  [
    'Stats row',
    'Upvotes and comments both clickable; comments scroll to the thread and focus the composer',
    gap(
      'Comments count is plain text: #6882 removed onCommentsClick from PostUpvotesCommentsCount. One prop to restore in the eng PR',
    ),
  ],
  [
    'Action bar',
    'Glass pill pinned to the bottom from tablet: upvote, downvote, comment, award; bookmark, copy link (tablet up), clickbait shield',
    gap(
      'Same, except the clickbait shield icon: #6882 removed its iconOnly mode. Restore with the stats row',
    ),
  ],
  ['Share after upvote', 'Share band under the action bar', same()],
  ['Answered questions', 'Page only', same()],
  [
    'Discussion',
    'Quiet composer row, share to Squad, comment ad, sort link, thread, end of thread share',
    changed(
      'Same order. The thread ad loses its 192px minimum height and is empty by default, as it is live; the end of thread share has 24px above and below',
    ),
  ],
  [
    'Rail and ads',
    'Rail MPU alone beside the column; direct-sold in the column',
    restored('Production’s full rail for the post type, every widget in order'),
  ],
  [
    'Polls',
    'Classic layout',
    changed('In the new column: author, title, poll options'),
  ],
  [
    'X posts',
    'Classic layout',
    changed('In the new column, as the tweet embed shared X posts use'),
  ],
  ['Briefs', 'Classic layout', same('Classic layout')],
  [
    'Post modal',
    'Large width, sticky navigation, clamped title, no rail',
    gap('Not part of this arm: page only'),
  ],
];

const compare = [
  PostKind.Article,
  PostKind.Video,
  PostKind.SquadPost,
  PostKind.SharedPost,
  PostKind.SharedX,
  PostKind.Collection,
];

const frame = { ...devices.desktop, height: 1100, scale: 0.42 };

export const Overview: StoryObj = {
  render: () => (
    <DocPage
      eyebrow="Post Page Hybrid · Design parity"
      title="Everything the redesign did, checked against the hybrid"
      intro={
        <p>
          Each row is a decision from the redesign as it shipped, audited from
          the code removed in #6882 and its history. The frames below are both
          live: the left one is the redesign rebuilt as the experiment arm
          shipped it, the right one is the hybrid.
        </p>
      }
    >
      <Table head={['Surface', 'Redesign, as shipped', 'Hybrid']} rows={rows} />
      {compare.map((kind) => (
        <Section key={kind} title={`${kind}, logged in`}>
          <div className="flex flex-wrap items-start gap-6">
            <PageFrame
              device={frame}
              version={Version.Redesign}
              kind={kind}
              viewer={Viewer.Member}
              label="Redesign, as shipped"
            />
            <PageFrame
              device={frame}
              kind={kind}
              viewer={Viewer.Member}
              label="Hybrid"
            />
          </div>
        </Section>
      ))}
    </DocPage>
  ),
};
