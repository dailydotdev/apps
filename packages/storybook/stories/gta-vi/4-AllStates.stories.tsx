import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Case, Page } from '../hero-cover/parts';
import { GiveAwardFlow } from './production/GiveAward';
import { CommentWithAward, ProfileAwards } from './production/AwardPreviews';
import { AchievementDetail } from './production/AchievementShelfCard';
import { Shelf } from './production/Shelf';
import { SettingsPopover, ThemedHome, ThemeRow } from './theme';
import { DeviceRow, State, StateGrid } from './parts';
import {
  GTA_VI_RELEASE_AT,
  productionAwards,
  readOnGtaDayAchievement,
  viceCityAchievement,
} from './data';

/*
 * Every state of the three GTA VI pieces, for a careful review: each case is
 * tagged Production (unchanged behavior), GTA VI (the change) or Proposed
 * (a gap production doesn't cover yet). Devices rows load the Devices stories
 * in real iframes at each width.
 */

const meta: Meta = {
  title: 'GTA VI/4. All states',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

const longName = 'Maximiliano Fernández-Castellanos de la Vega y Montoya';
const maxNote =
  `${'Patch notes, changelogs and a 4GB day-one download. '.repeat(8)}`.slice(
    0,
    400,
  );

/* -------------------------------------------------------------- award */

export const Award: StoryObj = {
  name: '1. Award',
  render: () => (
    <div id="__next">
      <Page
        chapter="GTA VI · All states"
        question="Every state of the Vice City award"
        title="Award: all states"
        goal="Check each screen of Give an Award with the Vice City award, every edge case, and where a received award shows, at every device width."
        metric="Nothing missing a builder would need to decide."
      >
        <Case
          title="Picker"
          note="GiveAwardModal's first screen. Click an award to move on; a paid award the balance can't cover stays here and offers Cores, as production does."
        >
          <StateGrid>
            <State title="Launch week" tag="GTA VI">
              <GiveAwardFlow />
            </State>
            <State
              title="After launch week"
              tag="Production"
              note="From Nov 26 the award leaves the grid."
            >
              <GiveAwardFlow isEventLive={false} />
            </State>
            <State
              title="Loading"
              tag="Proposed"
              note="Production paints an empty grid until the products query answers. Proposed: ElementPlaceholder tiles at the tile's size, so nothing jumps."
            >
              <GiveAwardFlow isLoading />
            </State>
            <State
              title="No Cores"
              tag="GTA VI"
              note="Balance 0. Vice City still goes through: it's free. Click any paid award to see production's Buy Cores footer."
            >
              <GiveAwardFlow balance={0} />
            </State>
            <State
              title="Awards already given"
              tag="Production"
              note="The header switches to the count and Show all, as production does."
            >
              <GiveAwardFlow numAwards={1284} />
            </State>
            <State
              title="Long receiver name"
              tag="Production"
              note="Wraps inside the sentence; nothing truncates."
            >
              <GiveAwardFlow receiverName={longName} />
            </State>
            <State
              title="No display name"
              tag="Production"
              note="Falls back to @username."
            >
              <GiveAwardFlow receiverName="" receiverUsername="nerdalytics" />
            </State>
            <State title="Phone sheet" tag="Production">
              <GiveAwardFlow isPhone />
            </State>
          </StateGrid>
        </Case>

        <Case
          title="Note and send"
          note="The second screen, then the third. The free footer replaces AwardFeesNote for the Vice City award only."
        >
          <StateGrid>
            <State title="Empty note" tag="GTA VI">
              <GiveAwardFlow initialStep="COMMENT" />
            </State>
            <State
              title="Note at the limit"
              tag="Production"
              note="maxNoteLength (400) stops typing; the textarea scrolls."
            >
              <GiveAwardFlow initialStep="COMMENT" note={maxNote} />
            </State>
            <State
              title="Sending"
              tag="Production"
              note="The button's loading state while the mutation runs."
            >
              <GiveAwardFlow initialStep="COMMENT" sendState="sending" />
            </State>
            <State
              title="Send failed"
              tag="Production"
              note="useTransactionError's toast: the backend's message, or labels.error.generic."
            >
              <GiveAwardFlow initialStep="COMMENT" sendState="error" />
            </State>
            <State
              title="Free window closed mid-flow"
              tag="Proposed"
              note="Opened on Nov 25, sent after midnight. The backend refuses; the button disables and the note says why."
            >
              <GiveAwardFlow initialStep="COMMENT" sendState="expired" />
            </State>
            <State title="A paid award" tag="Production">
              <GiveAwardFlow
                initialStep="COMMENT"
                initialProduct={productionAwards[3]}
              />
            </State>
            <State title="Sent" tag="GTA VI">
              <GiveAwardFlow initialStep="SUCCESS" />
            </State>
            <State title="Sent, long name" tag="Production">
              <GiveAwardFlow initialStep="SUCCESS" receiverName={longName} />
            </State>
          </StateGrid>
        </Case>

        <Case
          title="Received: on a comment"
          note="CommentAwardActions: the featured award at size-6 and the count through largeNumberFormat. Below tablet the word Awards hides; the Devices row shows it."
        >
          <StateGrid>
            <State title="One award" tag="Production">
              <CommentWithAward numAwards={1} />
            </State>
            <State title="Three awards" tag="GTA VI">
              <CommentWithAward />
            </State>
            <State title="1,284 awards" tag="Production">
              <CommentWithAward numAwards={1284} />
            </State>
            <State
              title="Another award featured"
              tag="Production"
              note="When the comment's featured award isn't Vice City, nothing changes."
            >
              <CommentWithAward featured={productionAwards[10]} />
            </State>
            <State title="Long comment" tag="Production">
              <CommentWithAward
                text={`${'GTA VI launch notes '.repeat(
                  20,
                )}https://example.com/a-very-long-link-without-any-breaks-at-all-to-check-overflow`}
              />
            </State>
          </StateGrid>
        </Case>

        <Case
          title="Received: on the profile"
          note="Badges & Awards (features/profile/components/ProfileWidgets). Award renders x{count} raw, as production does."
        >
          <StateGrid>
            <State title="Loading" tag="Production">
              <div className="w-[22rem]">
                <ProfileAwards state="loading" />
              </div>
            </State>
            <State
              title="No awards"
              tag="Production"
              note="The grid doesn't render."
            >
              <div className="w-[22rem]">
                <ProfileAwards state="empty" />
              </div>
            </State>
            <State title="Only Vice City" tag="GTA VI">
              <div className="w-[22rem]">
                <ProfileAwards state="single" />
              </div>
            </State>
            <State title="Some awards" tag="GTA VI">
              <div className="w-[22rem]">
                <ProfileAwards state="some" />
              </div>
            </State>
            <State
              title="Every award, big counts"
              tag="Production"
              note="Rows wrap; x1284 fits under a size-8 icon."
            >
              <div className="w-[22rem]">
                <ProfileAwards state="many" />
              </div>
            </State>
          </StateGrid>
        </Case>

        <Case
          title="Devices: picker"
          note="Real iframes at each width: the bottom sheet under 656px, the centered modal from tablet up. Frames load one at a time."
        >
          <DeviceRow storyId="gta-vi-devices--award-picker" title="Picker" />
        </Case>
        <Case title="Devices: note">
          <DeviceRow storyId="gta-vi-devices--award-note" title="Note" />
        </Case>
        <Case title="Devices: received">
          <DeviceRow
            storyId="gta-vi-devices--award-received"
            title="Received"
          />
        </Case>
      </Page>
    </div>
  ),
};

/* ------------------------------------------------------- achievements */

const unlocked = (
  achievement: typeof viceCityAchievement,
): Parameters<typeof AchievementDetail>[0]['userAchievement'] => ({
  achievement,
  progress: 1,
  unlockedAt: GTA_VI_RELEASE_AT,
  createdAt: null,
  updatedAt: null,
});

const DetailFrame = ({
  achievement,
  isLocked = false,
}: {
  achievement: typeof viceCityAchievement;
  isLocked?: boolean;
}) => (
  <div className="w-[26.25rem] overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default shadow-2">
    <AchievementDetail
      userAchievement={
        isLocked
          ? { ...unlocked(achievement), progress: 0, unlockedAt: null }
          : unlocked(achievement)
      }
    />
  </div>
);

export const Achievements: StoryObj = {
  name: '2. Achievements',
  render: () => (
    <div id="__next">
      <Page
        chapter="GTA VI · All states"
        question="Every state of the event achievements"
        title="Achievements: all states"
        goal="Check the shelf and the detail through release day, plus loading, empty, long copy and failed images, at every device width."
        metric="Nothing missing a builder would need to decide."
      >
        <Case
          title="Detail"
          note="What a card opens (Modal, ModalSize.XSmall). Click any card on the shelves below for the real modal."
        >
          <StateGrid>
            <State title="Made It to Vice City" tag="GTA VI">
              <DetailFrame achievement={viceCityAchievement} />
            </State>
            <State title="Still Read on GTA VI Day" tag="GTA VI">
              <DetailFrame achievement={readOnGtaDayAchievement} />
            </State>
            <State
              title="Still Read, not yet"
              tag="GTA VI"
              note="Nov 19 before a read: grayed like any locked achievement, with what to do instead of 0 / 1."
            >
              <DetailFrame achievement={readOnGtaDayAchievement} isLocked />
            </State>
          </StateGrid>
        </Case>

        {(
          [
            ['releaseRead', 'Nov 19, after a read', 'GTA VI'],
            ['releaseNotRead', 'Nov 19, no read yet', 'GTA VI'],
            ['afterRead', 'Nov 20 on, read that day', 'GTA VI'],
            ['afterMissed', 'Nov 20 on, the day missed', 'GTA VI'],
            ['before', 'Before Nov 19', 'Production'],
            ['loading', 'Loading', 'Production'],
            ['empty', 'No achievements', 'Production'],
            ['longText', 'Long names and descriptions', 'GTA VI'],
            ['brokenImage', 'Images fail to load', 'Production'],
          ] as const
        ).map(([state, title, tag]) => (
          <Case key={state} title={`Shelf: ${title}`}>
            <State
              title={title}
              tag={tag}
              note={
                {
                  releaseRead:
                    'Both event cards lead the shelf with their chips.',
                  releaseNotRead:
                    'Vice City unlocked on opening; Still Read waits and says what to do.',
                  afterRead: 'Same as release day, for good.',
                  afterMissed:
                    "Still Read can't be earned any more, so it leaves.",
                  before: 'Nothing: the achievements surprise on the day.',
                  loading: "The game-center page's ElementPlaceholder grid.",
                  empty: "The game-center page's EmptyStateCard.",
                  longText:
                    "Names and descriptions wrap: production's line-clamp-1 on the description is overridden by tablet:block, so long copy grows upward over the art. The real event copy fits in two lines.",
                  brokenImage:
                    'LazyImage falls back to daily.dev/default-achievement.png, which returns 404 today, so the art goes blank. The chip, name and date still read.',
                }[state]
              }
            >
              <div className="w-[min(86rem,calc(100vw-5rem))]">
                <Shelf state={state} />
              </div>
            </State>
          </Case>
        ))}

        <Case
          title="Devices: shelf"
          note="Three columns and 10.5rem cards on phones, five columns and 17rem cards from laptop; descriptions show from tablet."
        >
          <DeviceRow
            storyId="gta-vi-devices--achievement-shelf"
            title="Shelf"
          />
        </Case>
        <Case title="Devices: detail open">
          <DeviceRow
            storyId="gta-vi-devices--achievement-detail"
            title="Detail"
          />
        </Case>
      </Page>
    </div>
  ),
};

/* -------------------------------------------------------------- theme */

export const Theme: StoryObj = {
  name: '3. Theme',
  render: () => (
    <Page
      chapter="GTA VI · All states"
      question="Every state of the Vice City theme"
      title="Theme: all states"
      goal="Check the Theme row's four choices, the themed home and its failure cases, at every device width."
      metric="Nothing missing a builder would need to decide."
    >
      <Case
        title="The Theme row"
        note="ThemeSection's ButtonGroup with VI added last. Tab moves through the four buttons; Enter or Space picks; aria-pressed marks the choice."
      >
        <StateGrid>
          {(['dark', 'light', 'auto', 'viceCity'] as const).map((theme) => (
            <State
              key={theme}
              title={`${
                { dark: 'Dark', light: 'Light', auto: 'Auto', viceCity: 'VI' }[
                  theme
                ]
              } picked`}
              tag={theme === 'viceCity' ? 'GTA VI' : 'Production'}
            >
              <SettingsPopover theme={theme} onTheme={() => undefined} />
            </State>
          ))}
          <State
            title="Settings › Appearance"
            tag="GTA VI"
            note="Phones have no rail popover; they pick from Appearance, which draws the same ThemeSection."
          >
            <div className="w-[23.4375rem] rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
              <span className="mb-4 block font-bold text-text-primary typo-title3">
                Appearance
              </span>
              <ThemeRow theme="viceCity" onTheme={() => undefined} />
            </div>
          </State>
        </StateGrid>
      </Case>

      <Case
        title="Home"
        note="ThemedHome scaled to fit; the Devices rows below show true sizes."
      >
        <StateGrid>
          <State title="Themed" tag="GTA VI">
            <ThemedHome initialTheme="viceCity" width={1440} height={620} />
          </State>
          <State
            title="Not themed (default)"
            tag="Production"
            note="Nothing applies the theme; this is everyone's home until they pick VI."
          >
            <ThemedHome width={1440} height={620} />
          </State>
          <State
            title="Cover fails to load"
            tag="Proposed"
            note="The image errors, the art drops out and the home looks default; the theme stays picked."
          >
            <ThemedHome
              initialTheme="viceCity"
              coverSrc="/missing/cover.webp"
              width={1440}
              height={620}
            />
          </State>
          <State
            title="Long name"
            tag="Production"
            note="The greeting truncates on one line."
          >
            <ThemedHome
              initialTheme="viceCity"
              userName={longName}
              width={1440}
              height={620}
            />
          </State>
          <State
            title="No shortcuts"
            tag="GTA VI"
            note="The art still sits behind the empty top row; the greeting doesn't move."
          >
            <ThemedHome
              initialTheme="viceCity"
              shortcutCount={0}
              width={1440}
              height={620}
            />
          </State>
          <State title="Phone, long name" tag="Production">
            <ThemedHome
              isPhone
              width={375}
              height={620}
              columns={1}
              initialTheme="viceCity"
              userName={longName}
            />
          </State>
        </StateGrid>
      </Case>

      <Case title="Devices: themed">
        <DeviceRow storyId="gta-vi-devices--theme-on" title="Themed" />
      </Case>
      <Case
        title="Devices: picking"
        note="The rail's gear has opened the settings popover. Phones have no rail; see Appearance above."
      >
        <DeviceRow storyId="gta-vi-devices--theme-picking" title="Picking" />
      </Case>
      <Case title="Devices: not themed">
        <DeviceRow storyId="gta-vi-devices--theme-off" title="Not themed" />
      </Case>
    </Page>
  ),
};
