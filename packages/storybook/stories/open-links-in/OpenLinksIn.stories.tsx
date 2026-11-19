import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterStatus,
  DigIn,
  Goal,
  Page,
  PageHeader,
  PhoneRow,
  Quote,
  Section,
  Shot,
  Source,
  Status,
  Table,
  Verdict,
} from './kit';
import { SafariViewStill } from './before';
import {
  FinalAppearance,
  FinalIosSettings,
  FinalReaderControls,
  FinalReaderMenu,
  FinalSurface,
} from './finals';
import {
  comparison,
  copyRows,
  decisions,
  feedback,
  files,
  finalList,
  hunt,
  memberFacts,
  options,
  slackDraft,
  timeline,
} from './data';

const meta: Meta = {
  title: 'Open links in/1. Review and decision',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const bold = (text: string): React.ReactElement => (
  <span className="font-bold text-text-primary">{text}</span>
);

export const ReviewAndDecision: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Member feedback, 2 Nov: the reading screen has no visible switch"
        title="Links always opened in-app, but 1.26 swapped Apple's Safari view for our reader and moved Open in Safari into a menu; the switch arrived three days later, under a dead row in Appearance. Decided: one name, three doors, and the API."
      >
        <p>
          A member wrote that the app &quot;suddenly&quot; opens links in an
          internal browser and that the setting is hard to find. Both halves are
          true and neither is a bug. This page shows what they hit, traces the
          change to the commits, walks the settings the way they did, and
          records the four options reviewed with Tsahi on 3 Nov. The final list
          at the top is what ships, drawn with the app&apos;s own pieces over
          simulator captures. The web side is dailydotdev/apps#7200.
        </p>
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="76">
        The setting ships on every surface with the Reading group at the end of
        Appearance; the reader menu ships with Open in Safari and an Always
        switch, the sheet without a close square like the app&apos;s other
        sheets; a Share square joins the controls band between the page name and
        reload; the iOS Settings bundle ships with the next app release; the
        one-time tip is out.
      </Status>

      <Goal
        goal="A member who wants links in Safari finds the switch within one tap of the surprise, or within one scan of Settings, and never has to ask."
        metric="Feedback mentioning the in-app browser drops to zero; the share of members with the preference set, by surface; link opens that end in Open in Safari per reader session (a high rate means the default is wrong for that member, and the switch should have found them)."
      />

      <Section
        title="The final list"
        description="What ships, in build order, and the phones as the app will show them. The settings page is production's Switch, Radio, Typography and theme buttons in the Appearance page's exact structure; the reader menu is the shared Drawer's sheet over the simulator capture of the real reader; the iOS Settings group sits on the real Settings page for daily.dev. Switch the Storybook theme to dark (toolbar) to see them as the app shows them. Tap through each phone."
      >
        <Table
          head={['Item', 'What ships', 'Where and what it needs']}
          rows={finalList.map((row) => [bold(row[0]), row[1], row[2]])}
        />
        <PhoneRow>
          <Cell
            label="1 · Appearance in the iOS app"
            verdict={Verdict.Ship}
            note="Theme, Preferences without the two Open links rows, Accessibility, then Reading at the end: Open links in, two rows with a footnote each, the radio on the right as on the notifications page. Tap a row, flip a switch."
          >
            <FinalAppearance surface={FinalSurface.Ios} />
          </Cell>
          <Cell
            label="1 · Appearance in the Android app"
            verdict={Verdict.Ship}
            note="The same page naming Chrome. Hidden until the Android wrapper has the reading bridge."
          >
            <FinalAppearance surface={FinalSurface.Android} />
          </Cell>
          <Cell
            label="1 · Appearance in a browser"
            verdict={Verdict.Ship}
            note="Mobile web and desktop: the same control with the browser's two answers, in place of the Open links in new tab switch."
          >
            <FinalAppearance surface={FinalSurface.Browser} />
          </Cell>
        </PhoneRow>
        <PhoneRow>
          <Cell
            label="2 · The controls band: Share"
            verdict={Verdict.Ship}
            note="Close, the page name, Share, reload, drawn with the band's own pieces over the real reader. Share opens the system share sheet with the page: AirDrop, Messages, WhatsApp and the rest, then Copy, Open in Safari and the other browsers on the phone. Tap Share."
          >
            <FinalReaderControls />
          </Cell>
          <Cell
            label="2 · The reader's page menu"
            verdict={Verdict.Ship}
            note="The real reader behind (simulator, 1.26). The sheet is the shared Drawer: grabber, the page name, Back, Forward, Copy link, Open in Safari, a rule, then Always open links in Safari with the Switch. No close square: the app's other sheets have none, and today's reader menu loses its X. Swipe down or tap the scrim closes it."
          >
            <FinalReaderMenu />
          </Cell>
          <Cell
            label="3 · iOS Settings, Apps, daily.dev"
            verdict={Verdict.Ship}
            note="The real page (simulator, iOS 26) with the Reading group the Settings bundle adds under the access permissions. Tap Open links for the list."
          >
            <FinalIosSettings />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="One flag, three doors">
            The setting, the menu switch and the iOS Settings entry read and
            write the same preference. The user setting (openLinksInAppOptOut)
            is the truth once daily-api accepts it; the wrapper mirrors it into
            UserDefaults so iOS Settings shows the current value, and a change
            made in iOS Settings comes back to the web on the next foreground
            through one bridge message, which writes the flag like the other two
            doors. No second truth.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Not in the final">
            The one-time tip (D). A Safari square beside reload: Share took its
            place, and the share sheet lists the browsers anyway. A close square
            on the sheet, left or right: the app&apos;s other sheets have none,
            so the reader menu loses its X. A new settings page for one control.
            Any second Open links row.
          </Callout>
        </div>
      </Section>

      <Section
        title="The feedback"
        description="Posted by the feedback bot on 2 Nov; Chris tagged Tsahi on 3 Nov."
      >
        <Quote>{feedback.quote}</Quote>
        <Table
          head={['Field', 'Value']}
          rows={[
            [
              bold('Member'),
              <Source key="member" href={feedback.memberUrl}>
                {feedback.member}
              </Source>,
            ],
            [bold('When'), feedback.when],
            [
              bold('Category, sentiment, urgency'),
              `${feedback.category}, ${feedback.sentiment}, ${feedback.urgency}`,
            ],
            [bold('Tags'), feedback.tags],
            [bold('Filed from'), feedback.pageUrl],
            [
              bold('Threads'),
              <span key="threads" className="flex flex-col gap-1">
                <Source href={feedback.thread}>Internal feedback thread</Source>
                <Source href={feedback.slack}>Slack, #feedback</Source>
              </span>,
            ],
            ...memberFacts.map(([label, value]) => [bold(label), value]),
          ]}
        />
      </Section>

      <Section
        title="What they hit, and why it feels sudden"
        description="Left to right: the reader as 1.26 shows it (simulator, the 1.26 build), its only way out, and the Safari view every version before it used. The in-app part is twenty-one months old; what changed on 30 Oct is the chrome, and with it the one button that said Safari."
      >
        <PhoneRow>
          <Shot
            src="open-links-in/today-reading.png"
            label="Today: the reader (captured)"
            note="iPhone 17 Pro simulator, the 1.26 build. Close, the page name with a menu glyph, reload, over the article; the post is the drawer below. Nothing on screen says Safari."
          />
          <Shot
            src="open-links-in/today-menu.png"
            label="Today: the page menu (captured)"
            note="Tap the page name: Back, Forward, Copy link, Open in browser. Per page, and it remembers nothing. Four rows down, behind a control that does not look like a menu."
          />
          <Cell
            label="Before 1.26: the Safari view (mock)"
            note="Apple's SFSafariViewController, in the app since its first commit in January 2025. Done and the URL on top; back, forward, share, bookmarks and the Safari compass on the bottom bar, at all times. Members used that compass as their switch."
          >
            <SafariViewStill />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout
            tone={CalloutTone.Good}
            title="Regression or intended? Intended, shipped without its switch"
          >
            The reading screen is the mobile UX review&apos;s decision (chapter
            6b), built in dailydotdev/ios #27 and live as 1.26 on 30 Oct at
            13:48 UTC. The code did not regress: links opened in-app before and
            after. What regressed is the escape. The Safari view kept Open in
            Safari on a permanent bar; the reader keeps it as the fourth row of
            a menu behind the page name. The switch that answers the complaint,
            Open links in the app, reached the web on 2 Nov at 09:59 UTC
            (apps#6895), nine hours before the feedback, under Appearance,
            Preferences, as a client-only flag on one phone.
          </Callout>
          <Callout
            tone={CalloutTone.Bad}
            title="What the member could not know"
          >
            That the app changed on a Thursday and the web caught up on a
            Sunday. That the first Open links row in Appearance is for browser
            tabs and does nothing in the app. That the page name is a menu. That
            Open in browser is Safari. That the choice they make on the phone
            would not follow them to a reinstall.
          </Callout>
        </div>
        <Table
          head={['When', 'What changed', 'Where']}
          rows={timeline.map((row) => [
            bold(row[0]),
            row[1],
            <span key={`${row[0]}-ref`} className="text-text-tertiary">
              {row[2]}
            </span>,
          ])}
        />
      </Section>

      <Section
        title="Where they looked, and why they failed"
        description="The settings as the phone shows them today, walked in the order a member walks them. Two production captures from a logged-in phone-width browser; the app-only row cannot show outside the app."
      >
        <Table
          head={['Step', 'What they see', 'Why it fails']}
          rows={hunt.map((row) => [bold(row[0]), row[1], row[2]])}
        />
        <PhoneRow>
          <Shot
            src="open-links-in/settings-menu.jpg"
            label="Settings (production, phone width)"
            note="Avatar, You, Settings. Profile, Account & Security, Notifications, Appearance, Posting, Invite friends, then Feed settings and on down to Help center. No row says links, browser or reading."
          />
          <Shot
            src="open-links-in/appearance-web.jpg"
            label="Appearance (production, phone width)"
            note="Theme, then Preferences. Open links in new tab is the first link-related row and a browser-tab concept. In a browser the app-only row is absent, which is also what every member saw until 2 Nov."
          />
        </PhoneRow>
      </Section>

      <Section
        title="The four options, as reviewed"
        description="The proposals of round 74 and Tsahi's call on each, 3 Nov: A, B and C ship, D is out. The tap-through drawings of the proposals live in the mobile UX review workspace; the finals above are what ships."
      >
        <Table
          head={[
            'Option',
            'iOS app',
            'Android app',
            'Mobile web',
            'Desktop',
            'Source of truth',
            'Cost',
          ]}
          rows={comparison.map((row) => [bold(row[0]), ...row.slice(1)])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          {options.map((option) => (
            <Callout
              key={option.id}
              tone={option.id === 'D' ? CalloutTone.Bad : CalloutTone.Good}
              title={`${option.id} · ${option.name}${
                option.id === 'D' ? ' (out)' : ' (ships)'
              }`}
            >
              <p>{option.what}</p>
              <p>
                <span className="font-bold text-text-primary">For: </span>
                {option.pros.join(' ')}
              </p>
              <p>
                <span className="font-bold text-text-primary">Against: </span>
                {option.cons.join(' ')}
              </p>
              <p>
                <span className="font-bold text-text-primary">Costs: </span>
                {option.cost}
              </p>
            </Callout>
          ))}
        </div>
      </Section>

      <Section
        title="What ships: copy and files"
        description="Items 1 and 2 are dailydotdev/apps#7200. The API field and item 3 (the ios repository) follow; nothing for Android until its wrapper has the drawer."
      >
        <Table
          head={['Where', 'Copy', 'Note']}
          rows={copyRows.map((row) => [
            bold(row[0]),
            <span key={`${row[0]}-copy`} className="text-text-primary">
              {row[1]}
            </span>,
            row[2],
          ])}
        />
        <Table
          head={['File', 'Change']}
          rows={files.map((row) => [bold(row[0]), row[1]])}
        />
        <Table
          head={['Round', 'Decision']}
          rows={decisions.map((row) => [bold(row[0]), row[1]])}
        />
        <DigIn title="Reply draft for the Slack thread (not posted)">
          <pre className="whitespace-pre-wrap font-sans text-text-secondary typo-footnote">
            {slackDraft}
          </pre>
        </DigIn>
        <Quote>Open links in: one name, three doors, one flag.</Quote>
      </Section>
    </Page>
  ),
};
