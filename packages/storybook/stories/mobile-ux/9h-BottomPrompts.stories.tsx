import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Status,
  Table,
  Verdict,
} from './kit';
import {
  ConsentLook,
  ConsentStill,
  FooterAndToastStill,
  MemberAppSheetStill,
  VisitorExploreFooterStill,
  VisitorPostFooterStill,
  bottomCases,
  bottomRules,
  consentLookNotes,
} from './promptsMocks';

const meta: Meta = {
  title: 'Mobile UX/9h. Bottom prompts',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const today: [string, string, string][] = [
  ['Consent banner (iubenda)', 'Fixed 12px above the bottom, full width on phones, z 1000, over the footer nav. Only in TCF regions, only until answered. Skipped in the wrappers.', 'Production'],
  ['Logged-out app footer', 'Merged in #6735 behind mobile_app_footer (off): once a page’s trigger fires (after the second comment, after card 12, after the hero…), the Charm footer replaces the tab bar and the post floating bar: fade, title, Charm pressing Open daily.dev app, 176px, no close, until navigation. Never on the page a search engine sent the reader to.', 'Merged, flag off'],
  ['Logged-in app sheet', 'Same PR behind mobile_app_sheet (off): “See daily.dev in…”, App with Open and Browser with Continue, a Drawer on landing, once per snooze window (72h).', 'Merged, flag off'],
  ['Log in and Open app in the header', 'Shipped (#6744): the logged-out top bars carry Log in and Open app and hide on scroll down. The shell keeps them in the leaf block’s right slot (chapter 4).', 'Production'],
];

export const BottomPrompts: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s question, 1 Oct: the cookie banner, the logged-out footer and the open-the-app prompt"
        title="Three things besides the cluster can own the bottom of a phone: the consent banner, the logged-out Charm footer and the logged-in app sheet. One owner at a time, one sheet at a time, consent first, and the footer replaces the cluster as it already does."
      >
        <p>
          Two of the three are merged behind flags (the app footer and the
          app sheet, #6735) and one is live (iubenda). This chapter puts each
          on the shell, tries four looks for the consent banner, and lists
          every case a visitor or a member can meet so nothing at the bottom
          collides. The ad strip from 9f is on every visitor page here, so
          the worst case is the one drawn.
        </p>
        <ChapterNav current="9h" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided by Tsahi, 1 Oct 2026: the consent banner is the sheet (B);
        the logged-out footer and the logged-in sheet as merged; the cases
        table and the seven rules stand. Looks A, C and D stay on the page
        for the record.
      </Status>

      <Goal
        goal="A visitor or a member never sees two prompts at once, never loses the bar under a prompt, and always knows how to close what is in front of them."
        metric="Consent answered on the first page; footer opens per visitor session unchanged from the flag’s own numbers; zero prompt overlaps in QA."
      />

      <Section title="What exists today" description="Four things, where they come from and how they behave.">
        <Table
          head={['Thing', 'Behaviour', 'Status']}
          rows={today.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            <span key={`${row[0]}-s`} className="whitespace-nowrap text-text-tertiary">
              {row[2]}
            </span>,
          ])}
        />
      </Section>

      <Section
        title="The consent banner: four looks"
        description="On a visitor’s public post, with the strip and the post cluster, the worst case. The recommendation is the sheet."
      >
        <PhoneRow>
          <Cell label="A · The card above the cluster" verdict={Verdict.Skip} note={consentLookNotes[ConsentLook.Card]}>
            <ConsentStill look={ConsentLook.Card} />
          </Cell>
          <Cell label="B · The sheet" verdict={Verdict.Ship} note={consentLookNotes[ConsentLook.Sheet]}>
            <ConsentStill look={ConsentLook.Sheet} />
          </Cell>
          <Cell label="C · One line above the cluster" verdict={Verdict.Skip} note={consentLookNotes[ConsentLook.Strip]}>
            <ConsentStill look={ConsentLook.Strip} />
          </Cell>
          <Cell label="D · In the cluster’s place" verdict={Verdict.Skip} note={consentLookNotes[ConsentLook.Replace]}>
            <ConsentStill look={ConsentLook.Replace} />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the sheet">
            It is a one-time legal question, and the shell already has one
            way to ask a question that must be answered: the sheet, with the
            status bar covered and the cluster under the dim. Accept, reject
            and choose sit at the same level, which the TCF regions want. It
            is the same Drawer the app sheet uses, so the two can never show
            together (one sheet at a time), and it is what iubenda’s own
            mobile layout already looks like once it is full width.
          </Callout>
          <Callout title="What the others cost">
            A keeps the bar usable but stacks three things on a post. C is
            the smallest and needs a second step for reject. D is honest
            about ownership but hides the bar for a question that should
            take one tap. All three leave a visitor able to scroll and tap
            around the question, which is exactly what a consent prompt is
            not supposed to allow.
          </Callout>
        </div>
      </Section>

      <Section
        title="The logged-out footer and the logged-in sheet, on the shell"
        description="As merged. The footer replaces the cluster; the sheet covers it. Scroll the footer phones: the block still hides and returns above the footer."
      >
        <PhoneRow>
          <Cell label="Visitor, post, past the second comment" verdict={Verdict.Ship} note="The Charm footer in the cluster’s place: See all comments, Open daily.dev app. The strip stays on top; Log in and Open app stay in the block. The action bar is gone with the cluster, as the merged footer removes the floating bar too.">
            <VisitorPostFooterStill />
          </Cell>
          <Cell label="Visitor, Explore, past card 12" verdict={Verdict.Ship} note="See all posts. The search field leaves with the cluster and returns on the next page.">
            <VisitorExploreFooterStill />
          </Cell>
          <Cell label="Member, landing on the mobile web" verdict={Verdict.Ship} note="See daily.dev in… App / Browser, the sheet over Home, once per snooze window. Open or Continue closes it; the cluster is under the dim.">
            <MemberAppSheetStill />
          </Cell>
          <Cell label="A toast while the footer shows" verdict={Verdict.Ship} note="12px above the footer, not above where the cluster was. The footer owns the bottom.">
            <FooterAndToastStill />
          </Cell>
        </PhoneRow>
        <Callout tone={CalloutTone.Good} title="Open app twice, accepted">
          Open app appears twice on a visitor page while the footer shows:
          in the block and in the footer. That is what the two merged PRs
          do together, and Tsahi kept it (X does the same: Open app top
          right and the footer).
        </Callout>
      </Section>

      <Section
        title="Every case"
        description="Who, where, what owns the bottom, and what else applies. Visitors and members, the mobile web and the wrappers."
      >
        <Table
          head={['Case', 'What shows', 'Owner of the bottom', 'Also']}
          rows={bottomCases.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            <span key={`${row[0]}-o`} className="whitespace-nowrap font-bold text-text-secondary">
              {row[2]}
            </span>,
            row[3],
          ])}
        />
      </Section>

      <Section title="The rules" description="Seven lines for the shell, the ads and the app prompts to share.">
        <Table
          head={['Rule', 'Detail']}
          rows={bottomRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Quote>One owner of the bottom, one sheet at a time, consent first, toasts follow the owner.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9h" />
      </Section>
    </Page>
  ),
};
