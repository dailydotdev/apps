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
  title: 'Post Page Hybrid/0. Read me',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const takeaways = [
  {
    lever: 'Keep',
    title: 'Everything that won',
    body: 'The redesign’s column ships as it was: the title and cover, the floating action bar, the composer row, share to Squad, sort as a link and the end of thread share.',
  },
  {
    lever: 'Return',
    title: 'Everything that lost',
    body: 'Production’s right sidebar comes back for every post type: every widget in its order, the direct-sold card, You might like, Best of, the signup widget and the footer.',
  },
  {
    lever: 'Frame',
    title: 'The profile and Squad page layout',
    body: 'One centered frame, 1024px from laptop and 1152px from laptopL, the post as a bordered card beside a 320px rail with 16px between them. Below laptop the rail stacks under the thread.',
  },
];

const folders = [
  [
    '1. Final design',
    'Production today and the hybrid side by side: every width, logged in and out, every post type, and the full change list.',
  ],
  ['2. Logged in', 'Every post type as a member sees it. Plus is a control.'],
  [
    '3. Logged out',
    'Every post type as a visitor sees it, without programmatic ads.',
  ],
  [
    '4. Post modal',
    'The modal the feed opens: production today, the redesign as shipped, and the hybrid.',
  ],
  [
    '5. Design parity',
    'Every redesign decision checked against the hybrid, with live frames side by side.',
  ],
  [
    'Post Page Hybrid, ad slots',
    'The logged-out page with production’s programmatic slots drawn in, and the ad inventory.',
  ],
];

export const Overview: StoryObj = {
  render: () => (
    <DocPage
      eyebrow="Post Page Hybrid · Read me"
      title="The redesign’s reading column, inside the classic page"
      intro={
        <>
          <p>
            The post redesign experiment lost overall. It raised comments,
            engagement and external read clicks, but it removed the right
            sidebar, and with it the rail ad placements and the content that
            turns a visitor into a reader: the creator card, You might like,
            Best of and the signup widget.
          </p>
          <p>
            This hybrid is the follow-up experiment arm. It takes the classic
            page’s structure and keeps the redesign’s look and discussion. It is
            Storybook only, built from the real production components and the
            redesign code removed in #6882, so every frame here is live: scroll
            it, upvote, sort the comments, open the composer.
          </p>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 laptop:grid-cols-3">
        {takeaways.map(({ lever, title, body }) => (
          <div
            key={lever}
            className="flex flex-col gap-2 rounded-16 border border-border-subtlest-tertiary p-5"
          >
            <span className="font-bold uppercase tracking-[0.16em] text-accent-cabbage-default typo-caption1">
              {lever}
            </span>
            <h3 className="font-bold typo-title3">{title}</h3>
            <p className="text-text-secondary typo-callout">{body}</p>
          </div>
        ))}
      </div>

      <Section title="Where everything is">
        <Table head={['Folder', 'What it shows']} rows={folders} />
      </Section>

      <Section
        title="Classic today and the hybrid, logged in"
        lead="Both frames are live at 1440px with the app sidebar. The classic frame is production’s own PostContent with the same props the post page passes."
      >
        <div className="flex flex-wrap items-start gap-6">
          <PageFrame
            device={{ ...devices.desktop, scale: 0.45 }}
            version={Version.Classic}
            kind={PostKind.Article}
            viewer={Viewer.Member}
            label="Classic, production today"
          />
          <PageFrame
            device={{ ...devices.desktop, scale: 0.45 }}
            kind={PostKind.Article}
            viewer={Viewer.Member}
            label="Hybrid"
          />
        </div>
      </Section>

      <Section
        title="What moves where"
        lead="Green is kept or won back, red is what the experiment lost, purple is new to this arm. The full audit is on Design parity."
      >
        <Table
          head={['Surface', 'Classic today', 'Redesign experiment', 'Hybrid']}
          rows={[
            [
              'Page frame',
              'Full width card, 340px widget column with a divider',
              <Cell key="r" mark={Mark.Loss}>
                One 768px column, no sidebar
              </Cell>,
              <Cell key="h" mark={Mark.New}>
                Profile and Squad frame: card plus 320px rail
              </Cell>,
            ],
            [
              'Header and title',
              'Source row with Read post on the right, large title, TLDR, tags, then a cover',
              <Cell key="r" mark={Mark.Win}>
                Source with Follow, title beside a cover thumbnail, meta row
              </Cell>,
              <Cell key="h" mark={Mark.New}>
                Redesign, with the thumbnail sized by the column
              </Cell>,
            ],
            [
              'Read post',
              'Top right of the source row',
              <Cell key="r" mark={Mark.Win}>
                Filled button under the TLDR, above it on phones
              </Cell>,
              <Cell key="h" mark={Mark.New}>
                Filled, in the header corner from laptop, just left of “…”;
                under the date and read time below that
              </Cell>,
            ],
            [
              'Actions',
              'Inline action row above the composer',
              <Cell key="r" mark={Mark.Win}>
                Floating pill that pins to the bottom from tablet up
              </Cell>,
              <Cell key="h" mark={Mark.Win}>
                Redesign
              </Cell>,
            ],
            [
              'Discussion',
              'Composer, comments',
              <Cell key="r" mark={Mark.Win}>
                Quiet composer row, share to Squad, sort link, end of thread
                share
              </Cell>,
              <Cell key="h" mark={Mark.Win}>
                Redesign, tighter comment ad and end of thread spacing
              </Cell>,
            ],
            [
              'Source and creator cards',
              'Top of the rail',
              <Cell key="r" mark={Mark.Loss}>
                Gone
              </Cell>,
              <Cell key="h" mark={Mark.Win}>
                Top of the rail
              </Cell>,
            ],
            [
              'Direct-sold card',
              'Rail, third card',
              <Cell key="r" mark={Mark.Loss}>
                Flattened into the column, under the article
              </Cell>,
              <Cell key="h" mark={Mark.Win}>
                Rail, third card, "Advertise here" flush left
              </Cell>,
            ],
            [
              'You might like, Best of, table of contents',
              'Rail',
              <Cell key="r" mark={Mark.Loss}>
                Gone
              </Cell>,
              <Cell key="h" mark={Mark.Win}>
                Rail
              </Cell>,
            ],
            [
              'Signup widget',
              'Rail and after the content (flagged)',
              <Cell key="r" mark={Mark.Loss}>
                After the content only
              </Cell>,
              <Cell key="h" mark={Mark.Win}>
                Rail and after the content
              </Cell>,
            ],
          ]}
        />
      </Section>

      <Section title="Ads a member sees">
        <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-callout">
          <p>
            Production’s code wires two direct-sold units for every non-Plus
            reader: the card in the rail (PostSidebarAdWidget, served from
            /v1/a) and one above the comments (AdAsComment, served from
            /v1/a/post). Only the rail one fills today. Checked live on Oct 15:
            /v1/a returned an ad on 15 of 15 requests, /v1/a/post returned none
            on 15 of 15. So in practice a member sees one ad, in the rail. The
            check ran logged out from one location, so a signed-in session could
            differ.
          </p>
          <p>
            These stories match that: the thread ad is empty by default. The
            “Fill the thread ad” control shows it, in its tighter hybrid
            version. Logged-out visitors on articles and videos never get it at
            all; production’s programmatic units replace it. Those units are not
            the /articles arbitrage template either: they run on the regular
            post page since the post_adsense experiment won, and live in their
            own folder so the main pages read clean.
          </p>
        </div>
      </Section>

      <Section
        title="How to read the follow-up experiment"
        lead="One arm against classic, logged out and logged in."
      >
        <Table
          head={['Metric', 'Role', 'Why']}
          rows={[
            [
              'Ad impressions per logged-out page view',
              'Primary',
              'The loss that sank the first test. The hybrid restores every rail placement.',
            ],
            [
              'Signup conversion from post pages',
              'Primary',
              'The rail’s signup widget and further reading are back.',
            ],
            [
              'Comments and upvotes per view',
              'Guardrail',
              'The redesign’s win. The column and discussion are unchanged, so these should hold.',
            ],
            [
              'External read clicks',
              'Guardrail',
              'The redesign’s other win, measured with Read post under the TLDR. On laptops it now sits in the header corner, so watch this closely.',
            ],
            [
              'Clicks into You might like and Best of',
              'Secondary',
              'Depth for new users, gone in the first test.',
            ],
          ]}
        />
      </Section>
    </DocPage>
  ),
};
