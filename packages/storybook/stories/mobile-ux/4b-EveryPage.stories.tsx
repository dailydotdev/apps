import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Table,
  Verdict,
  ChapterStatus,
  Status,
} from './kit';
import {
  LoginSheetPhone,
  PostSheetPhone,
  SettingsListPhone,
  SettingsPagePhone,
  SquadSheetPhone,
  TodayPostMenuPhone,
} from './sheets';
import {
  backRows,
  fixes,
  menuRows,
  nameRows,
  pageRows,
  settingsLabels,
  sheetRows,
} from './pages';

const meta: Meta = {
  title: 'Mobile UX/4b. Every page',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const EveryPage: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Does the system hold on every page, every menu, every drawer?"
        title="Twenty-one page types, twenty-plus three-dots menus, a dozen drawer variants and seven back behaviours, reduced to one leaf header, one action sheet, one sheet primitive and one back rule."
      >
        <p>
          A code inventory of everything a phone user meets, page by page, done
          on 28 Sep 2026. Two facts drive most of what follows: every options
          menu on a phone is a floating desktop popup (the post one holds up to
          twenty rows), and phones never get the v2 page header, so each page
          grew its own bar. This chapter applies chapter 3b and chapter 4 to all
          of them and lists every fix.
        </p>
        <ChapterNav current="4b" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="4">
        System applied to 19 page types; action sheet, sheet primitive, settings
        as pages, one back rule; 27 fixes, each with the PR in chapter 10 that
        closes it.
      </Status>

      <Callout title="Archived from this chapter">
        The round 4 gallery of every page in the new chrome now lives in Mobile
        UX / Archive / Headers, titles and covers. Chapter 4d draws the pages at
        rest under the title rule and chapter 4e draws them on scroll.
      </Callout>

      <Goal
        goal="No page without a way back, no menu that is not a sheet, no action that appears twice, no label that changes between the bar and the page."
        metric="Four counts that go to zero: pages without a back affordance (11 today), menus opening as popups on touch (20+), duplicated actions on one screen (5), footer-versus-page name mismatches (4)."
      />

      <Section
        title="The four primitives"
        description="Everything below is built from these. If a page needs something else, that is a product question, not a design one."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Leaf header (chapter 3b)">
            Back button on the left, up to two action buttons on the right,
            nothing in the middle. Roots use the Home header or a title row
            instead. Never a name, avatar or date the first content row already
            shows.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Action sheet">
            Every three-dots menu. Bottom sheet with a grabber, rows with one
            icon style, grouped: primary actions, then owner or staff actions,
            then destructive. Seven rows visible; the long tail (per-tag blocks,
            moderator tools) sits behind a sub-sheet.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Sheet">
            One bottom sheet component for pickers, Create, streak, share,
            filters, login, confirmations: grabber, shared title row, swipe to
            dismiss, auto height with a full detent, always portaled to the
            root, one at a time. The bottom &quot;Close&quot; button and the
            four hand-rolled headers retire.
          </Callout>
          <Callout tone={CalloutTone.Good} title="List → page">
            Settings, Feed settings and Squad Manage share one pattern: a list
            page with its heading in content, each row a page with the leaf
            header and at most one action button (Save). No left drawer, no
            full-screen modal with Cancel/Save.
          </Callout>
        </div>
      </Section>

      <Section
        title="Three-dots menus"
        description="Today's post menu against the action sheet. Same actions, a third of the rows, and it reads like the phone."
      >
        <PhoneRow>
          <Cell
            label="Today"
            verdict={Verdict.Skip}
            note="Radix popup anchored to a 24px button; twenty rows on a long post; closes when the page scrolls."
          >
            <TodayPostMenuPhone />
          </Cell>
          <Cell
            label="Action sheet"
            verdict={Verdict.Ship}
            note="Share · Read it later · Follow · Not interested · Report, then owner rows, then More."
          >
            <PostSheetPhone />
          </Cell>
          <Cell
            label="Not interested sub-sheet"
            note="Source, author, each tag and the content type in one place, hide last. This is where the per-tag rows went. It is the same sheet with its content slid left: the chevron in the title row slides the first level back in; swipe down or the scrim closes the whole sheet from either level."
          >
            <PostSheetPhone sub />
          </Cell>
          <Cell
            label="Squad sheet"
            note="One menu for the page and the card: Manage first for staff, then share and invite, then report and leave."
          >
            <SquadSheetPhone />
          </Cell>
        </PhoneRow>
        <Table
          head={['Menu', 'Today', 'Proposed']}
          rows={menuRows.map((row) => [
            <span key={row.menu} className="font-bold text-text-primary">
              {row.menu}
            </span>,
            row.today,
            row.proposed,
          ])}
        />
        <Callout tone={CalloutTone.Bad} title="Invisible on touch today">
          Highlight card options, the squad ad card menu and the menus inside
          source and squad entity cards are hover-only triggers. On a phone
          those actions do not exist. They become visible Tertiary buttons on
          touch devices.
        </Callout>
      </Section>

      <Section
        title="Page by page"
        description="What each page draws today and what it draws under the system. Roots have no back; every leaf gets the back button."
      >
        <Table
          head={[
            'Page',
            'Today: header',
            'Today: actions',
            'Proposed: header',
            'Proposed: actions',
            'Back',
          ]}
          rows={pageRows.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.today,
            row.todayActions,
            row.proposed,
            row.proposedActions,
            row.back,
          ])}
        />
      </Section>

      <Section
        title="Settings"
        description="Today a left-side full-screen drawer with 33 rows; a sub-page's back arrow reopens the drawer, the drawer's own back goes to your profile, and notification settings has neither a back nor a title. Proposed: pages under You."
      >
        <PhoneRow>
          <Cell
            label="Settings list"
            verdict={Verdict.Ship}
            note="Reached from the You page. Heading in content, seven groups, labels equal to the page titles."
          >
            <SettingsListPhone />
          </Cell>
          <Cell
            label="A settings page"
            verdict={Verdict.Ship}
            note="Same leaf header; back returns to the list. Notification settings gets this chrome too."
          >
            <SettingsPagePhone />
          </Cell>
          <Cell
            label="Login sheet"
            verdict={Verdict.Ship}
            note="Every gated action opens this medium sheet instead of a full-screen modal or a jump to /onboarding."
          >
            <LoginSheetPhone />
          </Cell>
        </PhoneRow>
        <Table
          head={['Menu label today', 'Page title today']}
          rows={settingsLabels.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <DigIn title="What else changes in settings">
          <p>
            The Cores balance leaves the drawer bar and becomes a row in
            Billing. External rows (Docs, Advertise, Apps, Reputation) get an
            open-in-browser glyph. Squad Manage and Feed settings adopt the same
            list → page pattern, with Save as the one action button, so the
            three &quot;settings list then section&quot; flows in the app become
            one.
          </p>
        </DigIn>
      </Section>

      <Section
        title="Drawers, sheets and modals"
        description="Twenty-seven surfaces open from the bottom, the left or full screen today, with five different close affordances and no drag handle anywhere. One primitive, three detents."
      >
        <Table
          head={['Surface', 'Today', 'Proposed']}
          rows={sheetRows.map((row) => [
            <span key={row.surface} className="font-bold text-text-primary">
              {row.surface}
            </span>,
            row.today,
            row.proposed,
          ])}
        />
        <Callout title="Sheet rules">
          Grabber always. Title row when the sheet has more than one group or
          asks a question. Swipe down to dismiss, tap outside to dismiss, Escape
          on keyboards. Auto height up to 60%, full detent for long lists and
          pickers, keyboard-height for composers. One sheet at a time; a
          sub-sheet replaces its parent with a back row. Portaled to the root so
          it never closes the parent modal. Dark overlay only over media.
        </Callout>
      </Section>

      <Section
        title="Back, one rule"
        description="Seven behaviours today. One tomorrow: back goes to the previous screen in this tab if there is one, else to the tab's root."
      >
        <Table
          head={['Where', 'Today']}
          rows={backRows.map((row) => [
            <span key={row.where} className="font-bold text-text-primary">
              {row.where}
            </span>,
            row.today,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="goBack()">
            If the previous history entry is in-app and belongs to the same tab,
            router.back(). Otherwise navigate to the owner root of this page
            (chapter 5&apos;s map) with replace. The header chevron, the iOS
            edge swipe and Android back all call it. Closing a sheet is never
            back.
          </Callout>
          <Callout tone={CalloutTone.Good} title="One glyph">
            ArrowIcon Medium in the back button, everywhere. MoveToIcon, the
            three sizes and the logo fallback retire. A list page&apos;s back
            returns to the list it came from, never to a fixed URL.
          </Callout>
        </div>
      </Section>

      <Section
        title="Names"
        description="The bar, the page and the row should use one word for one thing."
      >
        <Table
          head={['Where', 'Today', 'Proposed']}
          rows={nameRows.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
        <Quote>
          If the footer says Activity and the page says Notifications, the user
          has to learn two names for one room.
        </Quote>
      </Section>

      <Section
        title="The fix list"
        description="Every inconsistency found in the inventory, with the PR from chapter 10 that closes it. The 0.x rows are copy and icon fixes that need no design decision."
      >
        <Table
          head={['#', 'Fix', 'PR']}
          rows={fixes.map((fix) => [
            <span
              key={fix.id}
              className="font-bold tabular-nums text-text-primary"
            >
              {fix.id}
            </span>,
            fix.fix,
            <span
              key={`${fix.id}-pr`}
              className="whitespace-nowrap tabular-nums text-text-secondary"
            >
              {fix.pr}
            </span>,
          ])}
        />
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="4b" />
      </Section>
    </Page>
  ),
};
