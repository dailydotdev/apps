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
import { HomeScroll, SettingsScroll, YouScroll } from './scrollPages';
import {
  DiscardSheetStill,
  ProfileEditScroll,
  SettingsListScroll,
  MilestonePopupStill,
  StreakSheetV2Still,
  WorkExperienceFormScroll,
  WorkExperienceListScroll,
  formRules,
  settingsNav,
} from './settingsMocks';

const meta: Meta = {
  title: 'Mobile UX/9d. Streak, settings and forms',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const SettingsAndForms: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s question after the You page"
        title="What the streak opens, how Settings navigates, and what a form page looks like: Save as the check icon, a plus that adds a work experience, and one sheet when you leave with changes."
      >
        <p>
          Three things the shell chapters named but never drew. The streak
          pill on Home and the Streak row on You open the same sheet, built
          from production’s streak popup. Settings is a list page and its
          sections are plain leaves. Forms are leaves with the check icon as
          Save; list-type settings pages carry a plus that adds an entry.
          Everything below is the decided system (chapters 4, 4b, 4d, 4e)
          applied; nothing new is introduced except the discard sheet.
        </p>
        <ChapterNav current="9d" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided: the streak opens the layout v2 panel as a sheet, with the
        celebration on top on a record or milestone day; forms carry Save as
        the check icon and no second Save at the bottom; list pages add with
        a plus. The compact streak sheet is archived. The forms use
        production’s field labels.
      </Status>

      <Goal
        goal="A member can reach any setting in two taps from any root, save a form without hunting for the button, and never lose edits by accident."
        metric="Settings reach for retained members, form completion on Edit profile and Work experience, and discard-sheet appearances per save."
      />

      <Section
        title="The streak"
        description="Tap the pill on Home, or the Streak row on You: a sheet over the page you are on, the layout v2 streak panel one to one, in production’s streak language. Milestones are a different moment and keep their popup, with Snapshot and Share. The compact sheet alternative is in the Archive: Later calls."
      >
        <PhoneRow>
          <Cell label="Home, the pill" verdict={Verdict.Ship} note="12 and the flame in front of the avatar. Tap it.">
            <HomeScroll />
          </Cell>
          <Cell label="The streak sheet: the layout v2 panel" verdict={Verdict.Ship} note="Decided: the v2 streak panel one to one, tied to the tier ladder from the milestone rewards work. The tier you hold (its flame artwork and name) beside the count, the gear, longest and total, Today with the timezone, the 30-day calendar, then Milestones: the tier earned, the next one with its reward and days left, the one after; the freeze row; Daily quests. A tall sheet that scrolls inside.">
            <StreakSheetV2Still />
          </Cell>
          <Cell label="On a milestone day: the popup" verdict={Verdict.Ship} note="The milestone keeps its popup, the one decided in the Milestone rewards review: the tier’s flame over the ember wash, the tier name, the count, the day strip, then Snapshot and Share, and No thanks. It opens by itself on the milestone day over whatever page you are on. The drawer is only the regular state.">
            <MilestonePopupStill />
          </Cell>
          <Cell label="You, the Streak row" verdict={Verdict.Ship} note="The same sheet from the Streak row under Your progress.">
            <YouScroll />
          </Cell>
        </PhoneRow>
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why a sheet, and why the v2 panel">
            It is a number you check, not a place you go. Production shows it
            as a popover on desktop and the v2 layout as a rail panel; on a
            phone the sheet is both. The v2 panel keeps one streak surface
            across desktop and phone: the same count, calendar, freezes and
            quests in the same order, so a member who knows one knows the
            other.
          </Callout>
          <Callout title="The tier ladder inside the sheet">
            The milestone rewards work (its own Storybook folder) names each
            streak day a tier with its own flame: Spark, Kindle, Flame, Blaze,
            Firestorm, Inferno and on, each with a reward. The sheet uses
            exactly that: the tier you hold is the hero and its chip, and a
            three-row ladder under the calendar shows what you earned, what
            is next with its reward and the days to it, and the one after,
            locked. On the milestone day the same artwork carries the
            celebration in the popup from the Milestone rewards review, which
            stays a popup: it is a moment, with Snapshot and Share, not a
            panel you consult.
          </Callout>
          <Callout title="The streak’s own language, kept">
            Everything in these sheets uses production’s streak drawing: a
            read day is the pink disc with the white flame, today a ring on
            top, a freeze the dashed pattern, an untouched day a quaternary
            outline; the pill is the streak icon with the count; the hero
            carries the 3D fire, and a record day the splash. No check marks,
            no black, nothing invented.
          </Callout>
          <Callout title="What changed from the desktop popup">
            The week strip becomes the 30-day grid; the three stat cards
            become the one-line longest and total; the reminder switch moves
            behind the gear (it is a setting); Daily quests join the sheet,
            which is why it is tall and scrolls inside. The gear opens Streaks
            and gamification settings, the same page the v2 gear opens.
          </Callout>
        </div>
      </Section>

      <Section
        title="Settings: the list and a section"
        description="From the You page: Settings is a list of pages in seven groups; every row is a plain leaf with back and its name. The section pages with more than one view use segments (Notifications · Email)."
      >
        <PhoneRow>
          <Cell label="You" note="Settings is the last row of the account group; Help is on the bar.">
            <YouScroll />
          </Cell>
          <Cell label="Settings" verdict={Verdict.Ship} note="Seven groups, labels equal to the page names, Log out last in red. Scroll it: the block hides like any page.">
            <SettingsListScroll />
          </Cell>
          <Cell label="Notifications" verdict={Verdict.Ship} note="A section page with two segments; toggles are the rows. No Save: each switch saves itself.">
            <SettingsScroll />
          </Cell>
        </PhoneRow>
        <Table
          head={['You do', 'What opens', 'Back does']}
          rows={settingsNav.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
          ])}
        />
      </Section>

      <Section
        title="Forms: Save as the check icon"
        description="Edit profile is the model form: back, the name, the check icon dimmed until something changes. Leaving with changes asks once."
      >
        <PhoneRow>
          <Cell label="Edit profile, untouched" verdict={Verdict.Ship} note="The check is dimmed: nothing to save yet. Photo and cover pickers first, then the fields production has, links last.">
            <ProfileEditScroll />
          </Cell>
          <Cell label="Edit profile, changed" verdict={Verdict.Ship} note="The bio changed; the check is live. Tap it: saved, a toast, back to where you came from.">
            <ProfileEditScroll dirty />
          </Cell>
          <Cell label="Back with changes" verdict={Verdict.Ship} note="One sheet: Keep editing or Discard. System back does the same.">
            <DiscardSheetStill />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="Lists with a plus: work experience"
        description="A settings page that is a list of entries carries a plus in the right slot. A row opens the entry’s form; the plus opens an empty one. Education, certifications, projects and the other career pages work the same way."
      >
        <PhoneRow>
          <Cell label="Work experience" verdict={Verdict.Ship} note="The list, newest first, the plus top right. Nothing to save here.">
            <WorkExperienceListScroll />
          </Cell>
          <Cell label="New experience" verdict={Verdict.Ship} note="From the plus: production’s fields (job title, company, domain, employment type, current position, start and end, summary). The check is dimmed until the required fields are filled.">
            <WorkExperienceFormScroll />
          </Cell>
          <Cell label="Edit experience" verdict={Verdict.Ship} note="From a row: the same form filled in, the check live, Delete last in red.">
            <WorkExperienceFormScroll editing />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The rules"
        description="Seven lines for every settings page and form."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={formRules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why the check and not a Save button">
            Round 4 decided that text actions never float in the top row, with
            Save on a form as the one exception, drawn as a check icon. It keeps
            every leaf’s right slot the same shape (icon buttons) and puts Save
            where iOS and Android both put it. A bottom Save bar would collide
            with the keyboard and the cluster; the check does not move.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No Save at the bottom of a form as a second copy. No forms inside
            sheets (they fight the keyboard). No inline add rows that expand in
            place: the plus opens a page. No delete in the top row. No hiding
            the top block while a field is focused.
          </Callout>
        </div>
        <Quote>Back, the name, and a check. Add with a plus, remove at the bottom, ask once before losing anything.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9d" />
      </Section>
    </Page>
  ),
};
