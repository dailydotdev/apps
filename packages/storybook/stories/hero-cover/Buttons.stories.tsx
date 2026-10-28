import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { ChecklistBIcon } from '@dailydotdev/shared/src/components/icons/ChecklistB';
import { FilterIcon } from '@dailydotdev/shared/src/components/icons/Filter';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons/Plus';
import { SettingsIcon } from '@dailydotdev/shared/src/components/icons/Settings';
import { ShieldIcon } from '@dailydotdev/shared/src/components/icons/Shield';
import { ShieldCheckIcon } from '@dailydotdev/shared/src/components/icons/ShieldCheck';
import { ShieldPlusIcon } from '@dailydotdev/shared/src/components/icons/ShieldPlus';
import { ShieldWarningIcon } from '@dailydotdev/shared/src/components/icons/ShieldWarning';
import { Case, Page } from './parts';
import {
  AchievementGlyph,
  Arrows,
  AttentionDot,
  Divider,
  Frame,
  PlusGlyph,
  quiet,
  Tabs,
} from './buttonHarmony';

const meta: Meta = {
  title: 'Hero Cover/Final/6. Buttons',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const achievementImage =
  'https://media.daily.dev/image/upload/s--yaK6lPac--/c_fill,h_512,q_auto,w_512/v1770800203/achievements/upvote_economy.png';

/* ------------------------------------------------------------------ */
/* Controls, all in option A's two styles                               */
/* ------------------------------------------------------------------ */

const IntroQuest = ({
  isNew,
  label = '2/6',
}: {
  isNew?: boolean;
  label?: string;
}): ReactElement => {
  const button = (
    <Button {...quiet} icon={<ChecklistBIcon secondary />}>
      {label}
    </Button>
  );
  return isNew ? <AttentionDot>{button}</AttentionDot> : button;
};

const GetPlus = ({ iconOnly }: { iconOnly?: boolean }): ReactElement =>
  iconOnly ? (
    <Button {...quiet} icon={<PlusGlyph />} aria-label="Get Plus" />
  ) : (
    <Button {...quiet} icon={<PlusGlyph />}>
      Get Plus
    </Button>
  );

const NewPost = ({ iconOnly }: { iconOnly?: boolean }): ReactElement =>
  iconOnly ? (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<PlusIcon />}
      aria-label="New post"
    />
  ) : (
    <Button
      variant={ButtonVariant.Primary}
      size={ButtonSize.Small}
      icon={<PlusIcon />}
    >
      New post
    </Button>
  );

const Customize = (): ReactElement => (
  <Button {...quiet} icon={<SettingsIcon />} aria-label="Customize widgets" />
);

type ShieldState = 'tries' | 'empty' | 'plusOn' | 'plusOff';

const Shield = ({ state }: { state: ShieldState }): ReactElement => {
  if (state === 'tries') {
    return (
      <Button {...quiet} icon={<ShieldPlusIcon />}>
        1/5
      </Button>
    );
  }
  if (state === 'empty') {
    return (
      <Button
        {...quiet}
        icon={<ShieldWarningIcon className="text-accent-ketchup-default" />}
      >
        0/5
      </Button>
    );
  }
  if (state === 'plusOn') {
    return (
      <Button
        {...quiet}
        icon={<ShieldCheckIcon className="text-status-success" />}
        aria-label="Clickbait shield on"
      />
    );
  }
  return (
    <Button
      {...quiet}
      icon={<ShieldIcon />}
      aria-label="Clickbait shield off"
    />
  );
};

const AchievementImage = (): ReactElement => (
  <img
    src={achievementImage}
    alt=""
    className="size-5 rounded-6 object-cover"
  />
);

const Achievements = ({ isTracking }: { isTracking?: boolean }) =>
  isTracking ? (
    <Button {...quiet} icon={<AchievementImage />}>
      3/10
    </Button>
  ) : (
    <Button
      {...quiet}
      icon={<AchievementGlyph />}
      aria-label="Track an achievement"
    />
  );

const Shortcuts = (): ReactElement => (
  <Button {...quiet} icon={<PlusIcon />}>
    Shortcuts
  </Button>
);

const FeedSettings = ({ iconOnly }: { iconOnly?: boolean }): ReactElement =>
  iconOnly ? (
    <Button {...quiet} icon={<FilterIcon />} aria-label="Feed settings" />
  ) : (
    <Button {...quiet} icon={<FilterIcon />}>
      Feed settings
    </Button>
  );

const pageActions = ({
  isNew = true,
  hasQuests = true,
  isPlus = false,
}: {
  isNew?: boolean;
  hasQuests?: boolean;
  isPlus?: boolean;
} = {}): ReactElement => (
  <>
    {hasQuests && <IntroQuest isNew={isNew} />}
    {!isPlus && <GetPlus />}
    <NewPost />
    <Divider />
    <Customize />
    <Arrows />
  </>
);

/* ------------------------------------------------------------------ */
/* Layout helpers for the page                                          */
/* ------------------------------------------------------------------ */

const Labeled = ({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex flex-col gap-2">
    <figcaption className="text-text-tertiary typo-footnote">
      {caption}
    </figcaption>
    {children}
  </figure>
);

const Stack = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex flex-col gap-8">{children}</div>
);

const Strip = ({ children }: { children: ReactNode }): ReactElement => (
  <div className="flex w-fit items-center gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-default px-4 py-3">
    {children}
  </div>
);

const rules = [
  'One filled button per screen: New post, or Done while editing.',
  'Every other control is the same Tertiary Small button (32px): an icon, or an icon with a short label.',
  'Color lives only in icons that carry meaning: Plus pink, shield green when on, red when out of tries.',
  'Counts are the label of their button: 2/6, 1/5, 3/10. The full sentence goes in the tooltip.',
  'One attention dot for every control: a small purple dot on the top right.',
  'Getting started uses the checklist icon everywhere: the header button, the widget and the gallery.',
  'All icons are outlined.',
];

export const Buttons: StoryObj = {
  name: '6. Buttons',
  render: () => (
    <Page
      chapter="Final · 6"
      question="How do the controls around the rail read as one set?"
      title="Buttons around the rail"
      goal="Option A from the button harmony proposals, applied to every control, state and screen size: one filled action, every other control the same quiet button."
      metric="Fewer button styles in the corner (six today, two here), with no drop in New post, Get Plus or Feed settings clicks."
    >
      <Case title="The rules">
        <ul className="flex max-w-[60rem] list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </Case>

      <Case
        title="The rail header"
        note="The page's actions sit with the rail: Getting started, Get Plus, New post, then Customize and the arrows."
      >
        <Stack>
          <Labeled caption="New reader, quests left, something new to see">
            <Frame
              header={pageActions()}
              tabs={
                <>
                  <Shield state="tries" />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
          <Labeled caption="Quests done: Getting started leaves the header">
            <Frame
              header={pageActions({ hasQuests: false })}
              tabs={
                <>
                  <Shield state="tries" />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
          <Labeled caption="Plus member: no Get Plus">
            <Frame
              header={pageActions({ hasQuests: false, isPlus: true })}
              tabs={
                <>
                  <Shield state="plusOn" />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
          <Labeled caption="Editing the rail: the page's actions step aside, Done is the one filled button">
            <Frame
              subtitle="Drag to move, or drag a corner to resize"
              header={
                <>
                  <Button {...quiet}>Hide widgets</Button>
                  <Button {...quiet} icon={<PlusIcon />}>
                    New widget
                  </Button>
                  <Button
                    variant={ButtonVariant.Primary}
                    size={ButtonSize.Small}
                  >
                    Done
                  </Button>
                  <Divider />
                  <Arrows />
                </>
              }
              tabs={
                <>
                  <Shield state="tries" />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
        </Stack>
      </Case>

      <Case
        title="The tab row"
        note="Every state each control can be in, at the size it ships. Shown on the right of the tab row, before Feed settings."
      >
        <div className="grid max-w-[60rem] grid-cols-1 gap-6 tablet:grid-cols-2">
          <Labeled caption="Clickbait shield, free tries left">
            <Strip>
              <Shield state="tries" />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="Clickbait shield, out of free tries">
            <Strip>
              <Shield state="empty" />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="Plus member, shield on">
            <Strip>
              <Shield state="plusOn" />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="Plus member, shield off">
            <Strip>
              <Shield state="plusOff" />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="Achievements experiment, nothing tracked yet">
            <Strip>
              <Shield state="tries" />
              <Achievements />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="Achievements experiment, tracking (Upvote economy, 3 of 10)">
            <Strip>
              <Shield state="tries" />
              <Achievements isTracking />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="Extension, shortcuts row hidden">
            <Strip>
              <Shield state="tries" />
              <Shortcuts />
              <FeedSettings />
            </Strip>
          </Labeled>
          <Labeled caption="The busiest case: everything at once">
            <Strip>
              <Shield state="tries" />
              <Achievements isTracking />
              <Shortcuts />
              <FeedSettings />
            </Strip>
          </Labeled>
        </div>
      </Case>

      <Case
        title="Attention dots"
        note="Today Getting started shows a purple badge with an exclamation mark and achievements a red dot. Both become the same small purple dot."
      >
        <div className="flex flex-wrap gap-6">
          <Labeled caption="Getting started, something new">
            <Strip>
              <IntroQuest isNew />
            </Strip>
          </Labeled>
          <Labeled caption="Achievements, nothing tracked">
            <Strip>
              <AttentionDot>
                <Button
                  {...quiet}
                  icon={<AchievementGlyph hasDot={false} />}
                  aria-label="Track an achievement"
                />
              </AttentionDot>
            </Strip>
          </Labeled>
          <Labeled caption="Getting started, from laptop XL up">
            <Strip>
              <IntroQuest isNew label="Getting started · 2/6" />
            </Strip>
          </Labeled>
        </div>
      </Case>

      <Case
        title="Every screen size"
        note="The same two styles everywhere. Labels drop to icons where space runs out, never the other way around."
      >
        <Stack>
          <Labeled caption="Desktop and laptop XL (1668 and up): Getting started shows its name">
            <Frame
              width="max-w-[72rem]"
              columns={4}
              header={
                <>
                  <IntroQuest isNew label="Getting started · 2/6" />
                  <GetPlus />
                  <NewPost />
                  <Divider />
                  <Customize />
                  <Arrows />
                </>
              }
              tabsStart={<Tabs feeds={['Frontend', 'AI', 'DevOps']} />}
              tabs={
                <>
                  <Shield state="tries" />
                  <Achievements isTracking />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
          <Labeled caption="Laptop (1020 to 1667)">
            <Frame
              header={pageActions()}
              tabs={
                <>
                  <Shield state="tries" />
                  <Achievements isTracking />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
          <Labeled caption="Tablet (656 to 1019): Get Plus and New post become icons, Feed settings keeps its label">
            <Frame
              width="max-w-[48rem]"
              columns={2}
              header={
                <>
                  <IntroQuest isNew />
                  <GetPlus iconOnly />
                  <NewPost iconOnly />
                  <Divider />
                  <Customize />
                  <Arrows />
                </>
              }
              tabs={
                <>
                  <Shield state="tries" />
                  <FeedSettings />
                </>
              }
            />
          </Labeled>
          <Labeled caption="Phone (under 656): the greeting and Customize only; Sort and Feed settings live in the For you sheet">
            <Frame
              width="max-w-[24rem]"
              columns={1}
              isCompact
              header={<Customize />}
              tabsStart={<Tabs feeds={['Happening now']} />}
            />
          </Labeled>
        </Stack>
      </Case>

      <Case
        title="Getting started icon, everywhere it appears"
        note="The checklist icon replaces Tour on the header button and the flag on the widget and in the gallery."
      >
        <div className="flex flex-wrap items-start gap-6">
          <Labeled caption="Header button">
            <Strip>
              <IntroQuest isNew />
            </Strip>
          </Labeled>
          <Labeled caption="Widget title">
            <Strip>
              <span className="flex items-center gap-2 text-text-primary typo-footnote">
                <ChecklistBIcon secondary size={IconSize.Size16} />
                <strong>Getting started</strong>
              </span>
            </Strip>
          </Labeled>
          <Labeled caption="Widget gallery row">
            <Strip>
              <span className="flex items-center gap-3 text-text-primary typo-callout">
                <span className="flex size-8 items-center justify-center rounded-10 bg-accent-cheese-flat text-accent-cheese-default">
                  <ChecklistBIcon secondary />
                </span>
                Getting started
              </span>
            </Strip>
          </Labeled>
        </div>
      </Case>
    </Page>
  ),
};
