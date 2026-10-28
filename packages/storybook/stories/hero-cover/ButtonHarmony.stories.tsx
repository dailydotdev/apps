import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonColor,
  ButtonIconPosition,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { DevPlusIcon } from '@dailydotdev/shared/src/components/icons/DevPlus';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { FlagIcon } from '@dailydotdev/shared/src/components/icons/Flag';
import { MedalBadgeIcon } from '@dailydotdev/shared/src/components/icons/MedalBadge';
import { MenuIcon } from '@dailydotdev/shared/src/components/icons/Menu';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { Case, Page } from './parts';

const meta: Meta = {
  title: 'Hero Cover/Proposals/Button harmony',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const quiet = {
  variant: ButtonVariant.Tertiary,
  size: ButtonSize.Small,
} as const;

const Badge = ({ n }: { n: number }): ReactElement => (
  <span className="absolute -left-2 -top-2 z-1 flex size-5 items-center justify-center rounded-[999px] bg-accent-cabbage-default font-bold text-white typo-caption2">
    {n}
  </span>
);

const Mark = ({ n, children }: { n: number; children: ReactNode }) => (
  <span className="relative inline-flex">
    <Badge n={n} />
    {children}
  </span>
);

const Divider = (): ReactElement => (
  <span aria-hidden className="mx-1 h-6 w-px bg-border-subtlest-tertiary" />
);

const Arrows = (): ReactElement => (
  <span className="flex items-center gap-1">
    <Button
      {...quiet}
      icon={<ArrowIcon className="-rotate-90" />}
      aria-label="Previous"
      disabled
    />
    <Button
      {...quiet}
      icon={<ArrowIcon className="rotate-90" />}
      aria-label="Next"
    />
  </span>
);

const AchievementGlyph = (): ReactElement => (
  <span className="relative inline-flex">
    <MedalBadgeIcon size={IconSize.Small} />
    <span className="absolute -right-0.5 -top-0.5 size-2 rounded-[999px] bg-accent-bacon-default" />
  </span>
);

const PlusGlyph = (): ReactElement => (
  <DevPlusIcon className="text-accent-bacon-default" />
);

const Greeting = (): ReactElement => (
  <div className="flex min-w-0 flex-1 flex-col">
    <span className="truncate font-bold text-text-primary typo-title3">
      Good morning, Alex
    </span>
    <span className="truncate text-text-tertiary typo-footnote">
      Wednesday, October 28
    </span>
  </div>
);

const RailStub = (): ReactElement => (
  <div className="grid grid-cols-3 gap-4">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-24 rounded-16 border border-border-subtlest-tertiary bg-surface-float"
      />
    ))}
  </div>
);

const Tabs = (): ReactElement => (
  <div className="flex items-center gap-1">
    <Button
      variant={ButtonVariant.Float}
      size={ButtonSize.Small}
      pressed
      icon={<ArrowIcon size={IconSize.Size16} className="rotate-180" />}
      iconPosition={ButtonIconPosition.Right}
    >
      For you
    </Button>
    <Button {...quiet}>Frontend</Button>
    <Button {...quiet} icon={<PlusIcon />} aria-label="New feed" />
  </div>
);

const Frame = ({
  header,
  tabs,
}: {
  header: ReactNode;
  tabs: ReactNode;
}): ReactElement => (
  <div className="flex w-full max-w-[60rem] flex-col gap-4 rounded-24 border border-border-subtlest-tertiary bg-background-default p-6">
    <div className="flex min-h-12 items-center gap-2">
      <Greeting />
      <div className="flex shrink-0 items-center gap-1">{header}</div>
    </div>
    <RailStub />
    <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary pb-3">
      <div className="min-w-0 flex-1">
        <Tabs />
      </div>
      <div className="flex shrink-0 items-center gap-1">{tabs}</div>
    </div>
  </div>
);

const Score = ({
  styles,
  buttons,
  verdict,
}: {
  styles: string;
  buttons: string;
  verdict: string;
}): ReactElement => (
  <dl className="grid max-w-[60rem] grid-cols-[8rem_1fr] gap-x-4 gap-y-1 typo-callout">
    <dt className="text-text-tertiary">Button styles</dt>
    <dd className="text-text-primary">{styles}</dd>
    <dt className="text-text-tertiary">Controls</dt>
    <dd className="text-text-primary">{buttons}</dd>
    <dt className="text-text-tertiary">Trade-off</dt>
    <dd className="text-text-secondary">{verdict}</dd>
  </dl>
);

const MenuRow = ({
  icon,
  label,
  detail,
}: {
  icon: ReactNode;
  label: string;
  detail?: string;
}): ReactElement => (
  <span className="flex items-center gap-3 rounded-10 px-3 py-2 text-text-primary typo-callout">
    <span className="flex text-text-secondary">{icon}</span>
    <span className="flex-1">{label}</span>
    {detail && (
      <span className="text-text-tertiary typo-footnote">{detail}</span>
    )}
  </span>
);

const Menu = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex w-64 flex-col rounded-16 border border-border-subtlest-tertiary bg-background-popover p-1">
    {children}
  </div>
);

const ShieldRow = (): ReactElement => (
  <MenuRow
    icon={<ShieldCheckIcon />}
    label="Clickbait shield"
    detail="1 of 5 left"
  />
);

const Today = (): ReactElement => (
  <Frame
    header={
      <>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<FlagIcon />}
        >
          2/6
        </Button>
        <Mark n={1}>
          <Button
            variant={ButtonVariant.Primary}
            color={ButtonColor.Bacon}
            size={ButtonSize.Small}
            icon={<DevPlusIcon />}
          >
            Get Plus
          </Button>
        </Mark>
        <Mark n={2}>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New post
          </Button>
        </Mark>
        <Divider />
        <Mark n={3}>
          <Button
            {...quiet}
            icon={<SettingsIcon />}
            aria-label="Customize widgets"
          />
        </Mark>
        <Arrows />
      </>
    }
    tabs={
      <>
        <Mark n={4}>
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Medium}
            icon={<ShieldCheckIcon className="text-status-success" />}
          >
            1/5
          </Button>
        </Mark>
        <Mark n={5}>
          <Button
            {...quiet}
            icon={<AchievementGlyph />}
            aria-label="Achievements"
            className="!size-8 !rounded-10 !border-transparent !bg-transparent !p-0"
          />
        </Mark>
        <Mark n={6}>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<FilterIcon />}
          >
            Feed settings
          </Button>
        </Mark>
        <Mark n={7}>
          <Button {...quiet} icon={<PlusIcon />}>
            Shortcuts
          </Button>
        </Mark>
      </>
    }
  />
);

const QuietFamily = (): ReactElement => (
  <Frame
    header={
      <>
        <Button {...quiet} icon={<FlagIcon />}>
          2/6
        </Button>
        <Button {...quiet} icon={<PlusGlyph />}>
          Get Plus
        </Button>
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
        >
          New post
        </Button>
        <Divider />
        <Button
          {...quiet}
          icon={<SettingsIcon />}
          aria-label="Customize widgets"
        />
        <Arrows />
      </>
    }
    tabs={
      <>
        <Button {...quiet} icon={<ShieldCheckIcon />}>
          1/5
        </Button>
        <Button
          {...quiet}
          icon={<AchievementGlyph />}
          aria-label="Achievements"
        />
        <Button {...quiet} icon={<PlusIcon />}>
          Shortcuts
        </Button>
        <Button {...quiet} icon={<FilterIcon />}>
          Feed settings
        </Button>
      </>
    }
  />
);

const IconsFirst = (): ReactElement => (
  <Frame
    header={
      <>
        <Button {...quiet} icon={<FlagIcon />}>
          2/6
        </Button>
        <Button {...quiet} icon={<PlusGlyph />} aria-label="Get Plus" />
        <Button
          variant={ButtonVariant.Primary}
          size={ButtonSize.Small}
          icon={<PlusIcon />}
        >
          New post
        </Button>
        <Divider />
        <Button
          {...quiet}
          icon={<SettingsIcon />}
          aria-label="Customize widgets"
        />
        <Arrows />
      </>
    }
    tabs={
      <>
        <Button
          {...quiet}
          icon={<ShieldCheckIcon />}
          aria-label="Clickbait shield, 1 of 5 left"
        />
        <Button
          {...quiet}
          icon={<AchievementGlyph />}
          aria-label="Achievements"
        />
        <Button {...quiet} icon={<PlusIcon />} aria-label="Shortcuts" />
        <Divider />
        <Button {...quiet} icon={<FilterIcon />}>
          Feed settings
        </Button>
      </>
    }
  />
);

const Toolbar = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="flex items-center gap-0.5 rounded-12 border border-border-subtlest-tertiary p-0.5">
    {children}
  </span>
);

const Toolbars = (): ReactElement => (
  <Frame
    header={
      <>
        <Toolbar>
          <Button {...quiet} icon={<FlagIcon />}>
            2/6
          </Button>
          <Button {...quiet} icon={<PlusGlyph />}>
            Get Plus
          </Button>
          <Button {...quiet} icon={<PlusIcon />}>
            New post
          </Button>
        </Toolbar>
        <Toolbar>
          <Button
            {...quiet}
            icon={<SettingsIcon />}
            aria-label="Customize widgets"
          />
          <Button
            {...quiet}
            icon={<ArrowIcon className="-rotate-90" />}
            aria-label="Previous"
            disabled
          />
          <Button
            {...quiet}
            icon={<ArrowIcon className="rotate-90" />}
            aria-label="Next"
          />
        </Toolbar>
      </>
    }
    tabs={
      <Toolbar>
        <Button {...quiet} icon={<ShieldCheckIcon />}>
          1/5
        </Button>
        <Button
          {...quiet}
          icon={<AchievementGlyph />}
          aria-label="Achievements"
        />
        <Button {...quiet} icon={<PlusIcon />} aria-label="Shortcuts" />
        <Button {...quiet} icon={<FilterIcon />}>
          Feed settings
        </Button>
      </Toolbar>
    }
  />
);

const MovedHome = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <Frame
      header={
        <>
          <Button {...quiet} icon={<FlagIcon />}>
            2/6
          </Button>
          <Button
            {...quiet}
            icon={<AchievementGlyph />}
            aria-label="Achievements"
          />
          <Button {...quiet} icon={<PlusGlyph />}>
            Get Plus
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New post
          </Button>
          <Divider />
          <Button
            {...quiet}
            icon={<SettingsIcon />}
            aria-label="Customize widgets"
          />
          <Arrows />
        </>
      }
      tabs={
        <Button {...quiet} icon={<FilterIcon />}>
          Feed settings
        </Button>
      }
    />
    <div className="flex max-w-[60rem] flex-wrap items-start gap-6">
      <Menu>
        <MenuRow icon={<FilterIcon />} label="Tags and sources" />
        <ShieldRow />
        <MenuRow icon={<SettingsIcon />} label="All feed settings" />
      </Menu>
      <p className="max-w-[28rem] text-text-secondary typo-callout">
        The clickbait shield is a feed setting, so it moves into the Feed
        settings menu with its count. The achievement tracker is progress, so it
        sits next to Getting started. Shortcuts is a widget now, so the old row
        toggle goes and readers add it from New widget.
      </p>
    </div>
  </div>
);

const Minimal = (): ReactElement => (
  <div className="flex flex-col gap-4">
    <Frame
      header={
        <>
          <Button {...quiet} icon={<FlagIcon />}>
            2/6
          </Button>
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Small}
            icon={<PlusIcon />}
          >
            New post
          </Button>
          <Button {...quiet} icon={<MenuIcon />} aria-label="More" />
          <Divider />
          <Arrows />
        </>
      }
      tabs={
        <Button {...quiet} icon={<FilterIcon />}>
          Feed settings
        </Button>
      }
    />
    <Menu>
      <MenuRow icon={<SettingsIcon />} label="Customize widgets" />
      <MenuRow icon={<PlusGlyph />} label="Get Plus" />
      <MenuRow icon={<AchievementGlyph />} label="Achievements" />
      <ShieldRow />
    </Menu>
  </div>
);

const variations: {
  key: string;
  title: string;
  note: string;
  node: ReactElement;
  styles: string;
  buttons: string;
  verdict: string;
}[] = [
  {
    key: 'a',
    title: 'A. One quiet family',
    note: 'One filled button on the page: New post. Everything else is the same quiet button at the same size. Plus keeps its pink only in the icon.',
    node: <QuietFamily />,
    styles: '2 (one filled, one quiet)',
    buttons: '10, nothing moves',
    verdict:
      'The smallest change: only styles and sizes change. The right side of the tabs is still a busy row of four.',
  },
  {
    key: 'b',
    title: 'B. Icons first, one label per row',
    note: 'Same family as A, and the frequent tools become icons with tooltips. Each row keeps one label: New post in the header, Feed settings in the tabs.',
    node: <IconsFirst />,
    styles: '2',
    buttons: '10, about half the width',
    verdict:
      'Calmer and shorter, but Get Plus and the shield count lose their words, so new readers learn them by hovering.',
  },
  {
    key: 'c',
    title: 'C. One toolbar per area',
    note: 'The controls sit inside one outlined group per area, so the eye reads three objects instead of ten buttons.',
    node: <Toolbars />,
    styles: '1 (quiet buttons inside a group)',
    buttons: '10, in three groups',
    verdict: 'Very tidy, but nothing stands out, so New post loses its pull.',
  },
  {
    key: 'd',
    title: 'D. Each control where it belongs (recommended)',
    note: "A's styles, then each control moves to its proper home: the shield into Feed settings, achievements next to Getting started, and the Shortcuts toggle goes because Shortcuts is a widget now.",
    node: <MovedHome />,
    styles: '2',
    buttons: '7 in the header, 1 in the tab row',
    verdict:
      'The tab row is tabs plus Feed settings again, and the header holds the page progress and actions. Needs the shield added to the Feed settings menu.',
  },
  {
    key: 'e',
    title: 'E. Minimal: the rest behind More',
    note: 'New post and Feed settings are the only labeled actions. Customize, Get Plus, achievements and the shield move into a More menu.',
    node: <Minimal />,
    styles: '2',
    buttons: '5',
    verdict:
      'The calmest corner, but Customize and Get Plus move one click deeper, which likely costs Plus clicks and widget discovery.',
  },
];

const rules = [
  'One filled button per screen: New post. Get Plus is quiet, with its pink only in the icon.',
  'Every other control is the same quiet Tertiary Small button (32px), an icon or an icon with a label.',
  'A count is the label of a quiet button (2/6), never a style of its own.',
  'A control lives with what it changes: feed controls in Feed settings, progress in the header, widgets in the gallery.',
];

export const ButtonHarmony: StoryObj = {
  name: 'Button harmony',
  render: () => (
    <Page
      chapter="Proposal"
      question="How do the buttons around the rail read as one set?"
      title="Button harmony around the rail"
      goal="Nimrod: too many button styles in a small corner of the home page. Unify them so the corner reads as one set, with one strong action and quiet controls around it."
      metric="Fewer button styles and controls in the corner, with no drop in New post, Get Plus or Feed settings clicks."
    >
      <Case
        title="Today"
        note="Numbered as in Nimrod's screenshot: a filled pink Get Plus (1), a filled white New post (2), an icon gear (3), a Medium shield with a count (4), a custom achievement avatar (5), a gray filled Feed settings (6) and a text Shortcuts link (7)."
      >
        <Today />
        <Score
          styles="6 (two filled colors, gray fill, text, icon, custom)"
          buttons="10 in the header and tab row"
          verdict="Every control speaks at a different volume, so nothing reads as the main action."
        />
      </Case>
      {variations.map((v) => (
        <Case key={v.key} title={v.title} note={v.note}>
          {v.node}
          <Score styles={v.styles} buttons={v.buttons} verdict={v.verdict} />
        </Case>
      ))}
      <Case
        title="The rules, whichever direction ships"
        note="These hold for A, B, D and E, and they apply on every size."
      >
        <ul className="flex max-w-[60rem] list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Case>
    </Page>
  ),
};

export const SideBySide: StoryObj = {
  name: 'Side by side',
  render: () => (
    <div className="flex min-h-screen flex-col gap-10 bg-background-default p-10">
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-text-primary typo-title3">Today</h2>
        <Today />
      </section>
      {variations.map((v) => (
        <section key={v.key} className="flex flex-col gap-3">
          <h2 className="font-bold text-text-primary typo-title3">{v.title}</h2>
          {v.node}
        </section>
      ))}
    </div>
  ),
};
