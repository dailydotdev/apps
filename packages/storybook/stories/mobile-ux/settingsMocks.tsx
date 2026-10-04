import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { ReadingStreakIcon } from '@dailydotdev/shared/src/components/icons/ReadingStreak';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { TrashIcon } from '@dailydotdev/shared/src/components/icons/Trash';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { HotIcon } from '@dailydotdev/shared/src/components/icons/Hot';
import { cloudinaryStreakFire } from '@dailydotdev/shared/src/lib/image';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { sponsoredGiftArt, streakLadder, tierArt } from '../milestone-rewards/data';
import type { StreakMilestone } from '../milestone-rewards/data';
import { StreakTier } from '../milestone-rewards/data';
import { DayStrip, EmberPanel, FlameBadge, FlameSize, NoThanks, TierName } from '../milestone-rewards/moment';
import { Control } from '../features/snapshot/surfaceChrome';
import CloseButton from '@dailydotdev/shared/src/components/CloseButton';
import { ButtonSize, ButtonVariant } from '@dailydotdev/shared/src/components/buttons/Button';
import { CoreFlatIcon } from '@dailydotdev/shared/src/components/icons/CoreFlat';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';
import {
  Avatar,
  FeedList,
  HeaderAvatar,
  Logo,
  SegmentedRow,
  StreakPill,
} from './mocks';
import { Circle, LeafTop } from './chrome';
import { BarMaterial } from './floating';
import { ScrollPage, TopKind } from './scrollPages';
import { Sheet, SheetGroup, SheetRow, settingsGroups } from './sheets';
import { quietChipClassName } from './rowStyle';
import { posts } from './data';

// Chapter 9d: what the streak opens, how Settings navigates, and the form
// pages (Save as the check icon, plus to add an entry).

const material = BarMaterial.Glass;

const Switch = ({ on }: { on: boolean }): ReactElement => (
  <span className={classNames('relative h-6 w-10 shrink-0 rounded-[999px]', on ? 'bg-text-primary' : 'bg-border-subtlest-secondary')}>
    <span className={classNames('absolute top-0.5 size-5 rounded-max bg-background-default', on ? 'left-[1.125rem]' : 'left-0.5')} />
  </span>
);

// Production's streak language (StreakMonthCalendar, DayStreak): a read day
// is a pink disc with a white flame, today is a ring on top, a freeze is the
// dashed pattern, an untouched day is a quaternary outline. Never a check,
// never black.
type DayState = 'read' | 'today' | 'readToday' | 'freeze' | 'none' | 'future';

const DayDot = ({ state, large = false }: { state: DayState; large?: boolean }): ReactElement => {
  const read = state === 'read' || state === 'readToday';
  const today = state === 'today' || state === 'readToday';
  return (
    <span
      className={classNames(
        'relative flex items-center justify-center rounded-max border',
        large ? 'size-8' : 'size-4',
        read && 'border-transparent bg-accent-bacon-default',
        !read && today && 'border-transparent',
        state === 'freeze' && 'border-transparent bg-[repeating-linear-gradient(135deg,currentColor_0_1.5px,transparent_1.5px_4px)] text-text-quaternary',
        (state === 'none' || state === 'future') && 'border-text-quaternary',
      )}
    >
      {read && <HotIcon secondary size={large ? IconSize.XSmall : IconSize.XXSmall} className="text-white" />}
      {today && <span aria-hidden className="pointer-events-none absolute inset-0 z-1 rounded-max ring-1 ring-text-primary" />}
    </span>
  );
};

// The streak sheet: production's popup content (current streak, longest,
// total reading days, the calendar, freezes, the reminder) as the sheet
// every menu uses, opened from the streak pill on Home or the Streak row on
// the You page.
const week: [string, DayState][] = [
  ['M', 'read'], ['T', 'read'], ['W', 'freeze'], ['T', 'read'], ['F', 'read'], ['S', 'readToday'], ['S', 'future'],
];

export const StreakSheet = (): ReactElement => (
  <Sheet title="Reading streak">
    <div className="flex flex-col gap-4 px-5 pb-2">
      <div className="flex items-center gap-3">
        <img src={cloudinaryStreakFire} alt="" className="h-14 w-14 text-accent-bacon-default" />
        <div className="flex flex-col">
          <span className="font-bold tabular-nums leading-none typo-mega2">12</span>
          <span className="text-text-quaternary typo-subhead">reading days</span>
        </div>
      </div>
      <div className="flex justify-between">
        {week.map(([day, state], index) => (
          <span key={`${day}-${index}`} className="flex flex-col items-center gap-1">
            <DayDot state={state} large />
            <span className="text-text-quaternary typo-caption2">{day}</span>
          </span>
        ))}
      </div>
      <div className="flex gap-3">
        {[['61', 'Longest streak'], ['412', 'Total reading days'], ['2 of 2', 'Freezes left']].map(([value, label]) => (
          <span key={label} className="flex flex-1 flex-col rounded-12 bg-surface-float px-3 py-2">
            <span className="font-bold tabular-nums typo-title3">{value}</span>
            <span className="text-text-tertiary typo-caption1">{label}</span>
          </span>
        ))}
      </div>
    </div>
    <SheetGroup>
      <span className="flex h-12 items-center gap-3 px-5 typo-callout">
        <span className="flex-1">Daily reminder</span>
        <span className="text-text-tertiary typo-footnote">09:00</span>
        <Switch on />
      </span>
      <SheetRow icon={<ArrowIcon size={IconSize.Medium} className="rotate-90" />} label="Streak settings" chevron />
    </SheetGroup>
  </Sheet>
);

// The layout v2 streak panel (StreakQuestsSection) as a sheet: the regular
// state, opened by the streak pill or the Streak row. Milestones are not
// here: they keep the popup from the Milestone rewards review (below). The big
// count with the gear top right, the longest and total line, Today with the
// timezone, the 30-day calendar, the freeze row, then Daily quests with their
// rewards and a Claim.
const monthDays: DayState[] = [
  'read', 'read', 'none', 'read', 'read', 'read', 'read', 'freeze', 'read', 'read',
  'read', 'read', 'read', 'none', 'none', 'read', 'read', 'read', 'read', 'read',
  'read', 'read', 'read', 'read', 'read', 'read', 'read', 'read', 'readToday', 'future',
];

const quests: { title: string; detail: string; reward: string; cores?: boolean; status: string; claim?: boolean }[] = [
  { title: 'Read 3 posts', detail: 'Any post counts, including from the digest.', reward: '20 XP', status: '2 of 3' },
  { title: 'Upvote a post you liked', detail: 'One upvote, anywhere.', reward: '5', cores: true, status: 'Claim', claim: true },
  { title: 'Join a discussion', detail: 'Reply or leave a comment.', reward: '15 XP', status: '0 of 1' },
];

// The tier ladder from the milestone rewards work (stories/milestone-rewards,
// artwork from the streak progression PR): the tier you hold, the next one
// with its reward and the days left, and the one after. It sits under the
// calendar so the sheet argues for tomorrow as well as today.
const tierFor = (days: number): StreakMilestone | undefined =>
  [...streakLadder].reverse().find((item) => item.day <= days);

const nextFor = (days: number): StreakMilestone | undefined => streakLadder.find((item) => item.day > days);

const TierArt = ({ item, size }: { item: StreakMilestone; size: number }): ReactElement => (
  <img src={item.mystery ? sponsoredGiftArt : tierArt(item.tier)} alt={item.label} style={{ width: size, height: size }} className="object-contain" />
);

const TierChip = ({ item }: { item: StreakMilestone }): ReactElement => (
  <span className="flex h-6 items-center gap-1 rounded-8 bg-accent-bacon-default px-2 font-bold text-white typo-caption1">
    <HotIcon secondary size={IconSize.XXSmall} />
    {item.label}
  </span>
);

const Ladder = ({ days }: { days: number }): ReactElement => {
  const current = tierFor(days);
  const index = current ? streakLadder.indexOf(current) : -1;
  const rows = streakLadder.slice(Math.max(index, 0), Math.max(index, 0) + 3);
  return (
    <div className="flex flex-col px-3 pb-2">
      <span className="px-2 py-1 text-text-quaternary typo-callout">Milestones</span>
      {rows.map((item) => {
        const done = item.day <= days;
        const next = !done && item === nextFor(days);
        return (
          <span key={item.day} className={classNames('flex items-center gap-3 rounded-10 px-2 py-2', next && 'bg-surface-float')}>
            <span className={classNames('flex size-9 shrink-0 items-center justify-center', !done && !next && 'opacity-50')}>
              {done || next ? <TierArt item={item} size={32} /> : <LockIcon size={IconSize.Small} className="text-text-quaternary" />}
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-center gap-2">
                <span className={classNames('font-bold typo-footnote', done ? 'text-text-primary' : next ? 'text-text-primary' : 'text-text-tertiary')}>{item.label}</span>
                <span className="text-text-quaternary typo-caption2">day {item.day}</span>
              </span>
              <span className="text-text-tertiary typo-caption1">
                {done ? `${item.reward} · earned` : next ? `${item.reward} · ${item.day - days} ${item.day - days === 1 ? 'day' : 'days'} away` : item.reward}
              </span>
            </span>
            {done && <HotIcon secondary size={IconSize.XSmall} className="text-accent-bacon-default" />}
          </span>
        );
      })}
    </div>
  );
};

export const StreakSheetV2 = (): ReactElement => (
  <Sheet title="Current streak" detent="full">
    <div className="map-scroll-none flex min-h-0 flex-1 flex-col overflow-y-auto">
      {(
        <div className="flex flex-col px-5 pb-4">
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-3">
              {tierFor(12) ? <TierArt item={tierFor(12) as StreakMilestone} size={56} /> : <img src={cloudinaryStreakFire} alt="" className="h-12 w-12" />}
              <span className="flex flex-col gap-1">
                <span className="font-bold tabular-nums leading-none typo-mega1">12</span>
                {tierFor(12) && <TierChip item={tierFor(12) as StreakMilestone} />}
              </span>
            </span>
            <span className="-mr-1 flex size-8 items-center justify-center rounded-10 text-text-tertiary">
              <SettingsIcon size={IconSize.Small} />
            </span>
          </div>
          <span className="mt-2 tabular-nums text-text-tertiary typo-caption1">61 Longest · 412 Total</span>
        </div>
      )}
      <div className="flex flex-col px-5 pb-4">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="font-bold typo-caption1">Today, Sep 30</span>
          <span className="text-text-tertiary typo-caption1">Asia/Jerusalem</span>
        </div>
        <div className="grid grid-cols-10 gap-x-2 gap-y-2.5">
          {monthDays.map((state, index) => (
            <span key={`${state}-${index}`} className="flex justify-center">
              <DayDot state={state} />
            </span>
          ))}
        </div>
      </div>
      <span className="mx-4 h-px bg-border-subtlest-tertiary" />
      <Ladder days={12} />
      <span className="mx-4 h-px bg-border-subtlest-tertiary" />
      <span className="flex h-12 items-center gap-3 px-5 typo-callout">
        <span className="flex-1">Streak freezes</span>
        <span className="text-text-tertiary typo-footnote">2 of 2</span>
        <span className={quietChipClassName(false, true)}>Get more</span>
      </span>
      <span className="mx-4 h-px bg-border-subtlest-tertiary" />
      <div className="flex flex-col px-3 pb-4 pt-2">
        <span className="px-2 py-1 text-text-quaternary typo-callout">Daily quests</span>
        {quests.map((quest) => (
          <span key={quest.title} className="flex flex-col gap-1 rounded-10 px-2 py-2.5">
            <span className="font-bold typo-footnote">{quest.title}</span>
            <span className="text-text-tertiary typo-caption1">{quest.detail}</span>
            <span className="mt-0.5 flex items-center justify-between gap-2">
              <span className={classNames('flex items-center gap-1 typo-caption1', quest.cores ? 'font-bold text-accent-cheese-default' : 'text-text-primary')}>
                {quest.cores && <CoreFlatIcon size={IconSize.XSmall} />}
                {quest.reward}
              </span>
              {quest.claim ? (
                <span className={quietChipClassName(true, true)}>{quest.status}</span>
              ) : (
                <span className="tabular-nums text-text-tertiary typo-caption1">{quest.status}</span>
              )}
            </span>
          </span>
        ))}
      </div>
    </div>
  </Sheet>
);

export const StreakSheetV2Still = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center gap-3 px-4">
        <Logo />
        <span className="flex-1" />
        <StreakPill />
        <HeaderAvatar />
      </div>
      <SegmentedRow active={1} menuIndex={1} />
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <FeedList items={posts} />
      </div>
      <StreakSheetV2 />
    </div>
  </Phone>
);

export const StreakSheetStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center gap-3 px-4">
        <Logo />
        <span className="flex-1" />
        <StreakPill />
        <HeaderAvatar />
      </div>
      <SegmentedRow active={1} menuIndex={1} />
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <FeedList items={posts} />
      </div>
      <StreakSheet />
    </div>
  </Phone>
);

// Settings: the list page, then a section page. Both are plain leaves:
// back, the name beside it, no Save because nothing here is a form.
const Row = ({ label, meta, onDark }: { label: string; meta?: string; onDark?: boolean }): ReactElement => (
  <span className={classNames('flex h-11 items-center gap-3 px-4 typo-callout', onDark && 'text-accent-ketchup-default')}>
    <span className="flex-1">{label}</span>
    {meta && <span className="text-text-tertiary typo-footnote">{meta}</span>}
    {!onDark && <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-quaternary" />}
  </span>
);

export const SettingsListScroll = (): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Settings" active="Home">
    <div className="flex flex-col pb-4">
      {settingsGroups.map((group) => (
        <div key={group.title ?? 'account'} className="flex flex-col border-b border-border-subtlest-tertiary py-2">
          {group.title && <span className="px-4 pb-1 pt-2 text-text-tertiary typo-caption1">{group.title}</span>}
          {group.rows.map((row) => (
            <Row key={row} label={row} />
          ))}
        </div>
      ))}
      <div className="py-2">
        <Row label="Log out" onDark />
      </div>
    </div>
  </ScrollPage>
);

// Form pages: the check icon top right is Save, the one text action allowed
// in the floating row (round 4). Fields are full width, 48px, label above.
export const Field = ({ label, value, placeholder, multiline }: { label: string; value?: string; placeholder?: string; multiline?: boolean }): ReactElement => (
  <label className="flex flex-col gap-1 px-4">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <span
      className={classNames(
        'flex w-full rounded-12 border border-border-subtlest-secondary px-3 typo-callout',
        multiline ? 'min-h-24 items-start py-2' : 'h-12 items-center',
        value ? 'text-text-primary' : 'text-text-quaternary',
      )}
    >
      {value ?? placeholder}
    </span>
  </label>
);

export const Select = ({ label, value }: { label: string; value: string }): ReactElement => (
  <label className="flex flex-col gap-1 px-4">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <span className="flex h-12 w-full items-center rounded-12 border border-border-subtlest-secondary px-3 typo-callout">
      <span className="flex-1">{value}</span>
      <ArrowIcon size={IconSize.Small} className="rotate-180 text-text-quaternary" />
    </span>
  </label>
);

const SaveAction = ({ enabled }: { enabled: boolean }): ReactElement => (
  <Circle material={material} fixed className={enabled ? undefined : 'opacity-40'}>
    <VIcon size={IconSize.Small} />
  </Circle>
);

const ProfileEditBody = ({ dirty }: { dirty: boolean }): ReactElement => (
  <div className="flex flex-col gap-4 pb-8 pt-2">
    <div className="flex items-center gap-4 px-4">
      <span className="relative">
        <Avatar size={64} />
        <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-max border-2 border-background-default bg-text-primary text-surface-invert">
          <PlusIcon size={IconSize.XSmall} />
        </span>
      </span>
      <div className="flex flex-col">
        <span className="font-bold typo-callout">Change photo</span>
        <span className="text-text-tertiary typo-footnote">Cover image below</span>
      </div>
    </div>
    <div className="mx-4 h-20 rounded-12 bg-gradient-to-br from-accent-cabbage-default to-accent-onion-default" />
    <Field label="Name" value="Maya Chen" />
    <Field label="Username" value="mayachen" />
    <Field label="Bio" value={dirty ? 'Building the reading experience at daily.dev. Rust on weekends.' : 'Building the reading experience at daily.dev.'} multiline />
    <Field label="Company" value="daily.dev" />
    <Field label="Job title" value="Staff engineer" />
    <Field label="Location" placeholder="City, country" />
    <span className="px-4 pt-2 text-text-tertiary typo-caption1">Links</span>
    <Field label="GitHub" value="github.com/mayachen" />
    <Field label="X" placeholder="x.com/username" />
    <Field label="Website" placeholder="https://" />
  </div>
);

export const ProfileEditScroll = ({ dirty = false }: { dirty?: boolean }): ReactElement => (
  <ScrollPage kind={TopKind.Page} title="Edit profile" active="Home" actions={<SaveAction enabled={dirty} />}>
    <ProfileEditBody dirty={dirty} />
  </ScrollPage>
);

const experiences: [string, string, string][] = [
  ['Staff engineer', 'daily.dev · Full-time', '2020 to now · 5 yrs'],
  ['Engineer', 'Acme · Full-time', '2017 to 2020 · 3 yrs'],
  ['Intern', 'Beta Labs · Internship', '2016 · 4 mos'],
];

// A list-type settings page: the plus top right adds an entry; a row opens
// its form. Nothing to save on the list itself.
export const WorkExperienceListScroll = (): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title="Work experience"
    active="Home"
    actions={
      <Circle material={material} fixed>
        <PlusIcon size={IconSize.Small} />
      </Circle>
    }
  >
    <div className="flex flex-col pb-8">
      {experiences.map(([title, org, when]) => (
        <span key={title} className="flex items-center gap-3 border-b border-border-subtlest-tertiary px-4 py-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-12 bg-surface-float font-bold typo-callout">{org.slice(0, 1)}</span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-bold typo-callout">{title}</span>
            <span className="text-text-secondary typo-footnote">{org}</span>
            <span className="text-text-tertiary typo-caption1">{when}</span>
          </span>
          <ArrowIcon size={IconSize.Small} className="rotate-90 text-text-quaternary" />
        </span>
      ))}
      <span className="px-4 pt-4 text-text-tertiary typo-footnote">Verified roles show a badge on your profile. Add one with the plus.</span>
    </div>
  </ScrollPage>
);

export const WorkExperienceFormScroll = ({ editing = false }: { editing?: boolean }): ReactElement => (
  <ScrollPage
    kind={TopKind.Page}
    title={editing ? 'Edit experience' : 'New experience'}
    active="Home"
    actions={<SaveAction enabled={editing} />}
  >
    <div className="flex flex-col gap-4 pb-8 pt-2">
      <Field label="Job title*" value={editing ? 'Staff engineer' : undefined} placeholder="Ex: Senior Frontend Engineer" />
      <Field label="Company or organization*" value={editing ? 'daily.dev' : undefined} placeholder="Ex: Acme" />
      <Field label="Company domain" value={editing ? 'daily.dev' : undefined} placeholder="Ex: company.com" />
      <Select label="Employment type" value={editing ? 'Full-time' : 'Please select'} />
      <span className="flex h-12 items-center gap-3 px-4 typo-callout">
        <span className="flex-1">Current position</span>
        <Switch on={editing} />
      </span>
      <div className="grid grid-cols-2 gap-3">
        <Select label="Start" value={editing ? 'Mar 2020' : 'Month, year'} />
        <Select label="End" value={editing ? 'Present' : 'Month, year'} />
      </div>
      <Field label="Summary of the work, focus area" value={editing ? 'Reading experience, feeds and the mobile shell.' : undefined} placeholder="What you built and owned" multiline />
      {editing && (
        <span className="mx-4 mt-2 flex h-12 items-center justify-center gap-2 rounded-12 border border-border-subtlest-tertiary font-bold text-accent-ketchup-default typo-callout">
          <TrashIcon size={IconSize.Small} />
          Delete this experience
        </span>
      )}
    </div>
  </ScrollPage>
);

// Back with unsaved changes: one sheet, the same primitive as every menu.
export const DiscardSheetStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-2 z-2">
        <LeafTop material={material} title="Edit profile" actions={<SaveAction enabled />} />
      </div>
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden pt-14">
        <ProfileEditBody dirty />
      </div>
      <Sheet title="Discard changes?">
        <div className="flex flex-col gap-3 px-5 pt-1">
          <p className="text-text-tertiary typo-footnote">Your edits to the profile are not saved.</p>
          <span className="flex h-12 items-center justify-center rounded-12 bg-text-primary font-bold text-surface-invert typo-callout">Keep editing</span>
          <span className="flex h-12 items-center justify-center rounded-12 border border-border-subtlest-secondary font-bold text-accent-ketchup-default typo-callout">Discard</span>
        </div>
      </Sheet>
    </div>
  </Phone>
);

export const formRules: [string, string][] = [
  ['Save is the check icon, top right', 'The one text action allowed in the floating row (round 4): a 38px button with the check glyph. Dimmed until something changed; a tap saves, shows a toast and goes back.'],
  ['Plus adds, top right, on list pages', 'Work experience, education, certifications, projects, custom feeds, blocked content: the list page carries a plus in the right slot and no Save. A row opens the entry’s form; the plus opens an empty one.'],
  ['One form, one page', 'Every form is its own leaf with back and the name beside it: New experience, Edit experience, Edit profile. No sheet forms, no accordions inside a list.'],
  ['Back with unsaved changes asks once', 'A sheet: Keep editing or Discard. System back and the back button behave the same.'],
  ['Destructive actions sit at the bottom', 'Delete this experience, Log out, Delete account: last on the page, red, never in the top row.'],
  ['The top block does not hide on forms', 'Forms are short; the block hides only when a page scrolls past its dead zone, so on most forms it simply stays. The keyboard pushes the field into view and the block stays where it is.'],
  ['Fields', 'Full width, 48px, label above in the tertiary colour, hairline border, 12px radius; selects show a chevron; switches are the system look. Required fields carry the asterisk production uses.'],
];

export const settingsNav: [string, string, string][] = [
  ['Tap the avatar on any root', 'The You page (a leaf): lists, your progress, wallet, invite, Settings; Help on the bar.', 'Back returns to the root you were on.'],
  ['Tap Settings', 'The Settings list: seven groups, the labels equal to the page names.', 'Back returns to You.'],
  ['Tap Notifications', 'The Notifications page with its segments (Notifications · Email).', 'Back returns to the Settings list, scrolled where you left it.'],
  ['Tap Profile', 'Edit profile: a form with Save as the check icon.', 'Back with changes asks Keep editing or Discard; without changes it just goes back.'],
  ['Tap Work experience', 'The list with the plus; a row opens Edit experience, the plus opens New experience.', 'Back from a form returns to the list, which shows the new or changed entry.'],
  ['Tap the streak (Home pill, or the Streak row on You)', 'The streak sheet over the page you are on.', 'Swipe down or tap outside closes it; Streak settings inside it pushes the settings page.'],
];


// The milestone: the popup from the Milestone rewards review (celebration
// panel: tier art over the ember wash, the tier name, the count, the day
// strip) with Snapshot and Share, and No thanks. It opens by itself on the
// milestone day, over whatever page you are on; the drawer stays the regular
// state behind the streak pill.
const INFERNO = streakLadder.find((item) => item.tier === StreakTier.Inferno) as StreakMilestone;

export const MilestonePopup = ({ milestone = INFERNO }: { milestone?: StreakMilestone }): ReactElement => (
  <div className="absolute inset-x-0 -top-11 bottom-0 z-3 flex items-center justify-center bg-overlay-quaternary-onion px-4">
    <div className="relative flex w-full flex-col overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default">
      <CloseButton className="absolute right-3 top-3 z-2" size={ButtonSize.Small} />
      <EmberPanel className="flex-col items-center gap-4 p-6 text-center">
        <FlameBadge milestone={milestone} size={FlameSize.Medium} withEmbers={false} />
        <TierName milestone={milestone} />
        <div className="flex flex-col gap-1">
          <span className="flex items-baseline justify-center gap-2 text-text-primary">
            <strong className="font-bold tabular-nums typo-mega2">{milestone.day}</strong>
            <span className="font-normal typo-title3">day streak</span>
          </span>
          <h2 className="text-text-primary typo-title3">{milestone.headline}</h2>
        </div>
        <DayStrip />
      </EmberPanel>
      <div className="flex flex-col gap-3 p-5">
        <div className="grid grid-cols-2 gap-3">
          <Control action="Snapshot" label size={ButtonSize.Medium} variant={ButtonVariant.Float} className="w-full" />
          <Control action="Share to" label size={ButtonSize.Medium} variant={ButtonVariant.Float} className="w-full" />
        </div>
        <NoThanks />
      </div>
    </div>
  </div>
);

export const MilestonePopupStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 items-center gap-3 px-4">
        <Logo />
        <span className="flex-1" />
        <StreakPill />
        <HeaderAvatar />
      </div>
      <SegmentedRow active={1} menuIndex={1} />
      <div className="map-scroll-none min-h-0 flex-1 overflow-hidden">
        <FeedList items={posts} />
      </div>
      <MilestonePopup />
    </div>
  </Phone>
);
