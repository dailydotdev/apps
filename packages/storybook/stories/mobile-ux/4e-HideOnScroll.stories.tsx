import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { linkTo } from '@storybook/addon-links';
import {
  Callout,
  CalloutTone,
  Cell,
  ChapterNav,
  ChapterStatus,
  DigIn,
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
import { hideSpec } from './hide';
import { BlockActionLayout, ProfileScroll, SquadScroll, SquadsScroll, HomeScroll, scrollDemos } from './scrollPages';
import { stickVerdicts } from './stickiness';
import { pageScrolls, stickRules } from './stickiness';
import {
  hideBenchmarks,
  hideGuidance,
  hideNumbers,
  hidePitfalls,
  hideSources,
  pinnedInstead,
} from './hideResearch';

const meta: Meta = {
  title: 'Mobile UX/4e. Scroll behaviour',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

export const ScrollBehaviour: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="What sticks, what hides, and when it comes back"
        title="Nothing at the top is permanently sticky. Reading down hides the whole top block, buttons included, as one solid piece; a short scroll up brings it back anywhere. Things start transparent over their cover and turn solid once the hero has passed. The bottom cluster never leaves."
      >
        <p>
          Tsahi&apos;s calls after review: the Activity behaviour is the one
          to keep, the leaf buttons should hide with the rest, and the
          gradient is out; when the block is solid it is the page background,
          as on Activity. This chapter sets the scroll rules once, applies them
          to every page shape with a scrollable phone each, and lists what
          stays pinned and why.
        </p>
        <ChapterNav current="4e" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Revised on Tsahi&apos;s review: one solid top block per page that hides as a unit
        (buttons included) and returns on scroll up; things start transparent over the
        hero; the cluster shrinks; the soft edge and the always-floating buttons are
        withdrawn. Benchmarks, thresholds and guidance are on the page.
      </Status>

      <Goal
        goal="Reading a long page feels like the page is all content; getting the chrome back costs one small gesture; and every page behaves the same way so nobody has to learn it twice."
        metric="Scroll depth per session, time to first segment switch after a reveal, and zero pages that keep a bar while others do not."
      />

      <Section
        title="Every page, scroll it"
        description="Fourteen phones, one rule. Scroll down slowly to see the block scrub out with your finger; flick and it is gone; scroll up a little anywhere and it is back."
      >
        <div className="flex flex-wrap gap-6">
          {scrollDemos.map((demo) => (
            <div key={demo.name} className="flex w-[23.4375rem] flex-col gap-3">
              {demo.render()}
              <div className="flex flex-col gap-1">
                <span className="font-bold typo-callout">{demo.name}</span>
                <span className="text-text-tertiary typo-footnote">{demo.note}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Sticky or not: the decision per page"
        description="The short answer Tsahi asked for. Hides = leaves while reading and returns on a nudge up. Stays = never leaves. Shrinks = stays, smaller. Content = scrolls with the page."
      >
        <Table
          head={['Page', 'Top block', 'Row (segments or chips)', 'Buttons', 'Bottom cluster', 'Search field']}
          rows={stickVerdicts.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            ...row.slice(1).map((cell, index) => (
              <span
                key={`${row[0]}-${index}`}
                className={
                  cell.startsWith('Hides')
                    ? 'whitespace-nowrap rounded-6 bg-overlay-float-cabbage px-1.5 py-0.5 font-bold text-accent-cabbage-default typo-caption2'
                    : cell.startsWith('Stays') || cell.startsWith('Shrinks')
                      ? 'whitespace-nowrap rounded-6 bg-overlay-float-avocado px-1.5 py-0.5 font-bold text-accent-avocado-default typo-caption2'
                      : 'whitespace-nowrap rounded-6 border border-border-subtlest-tertiary px-1.5 py-0.5 font-bold text-text-quaternary typo-caption2'
                }
              >
                {cell}
              </span>
            )),
          ])}
        />
      </Section>

      <Section
        title="The primary action in the returning block"
        description="Tsahi's note, verified against X: when a profile's Follow button has scrolled out of view, X puts a Follow button in the compact bar. On our things the block turns solid once the hero has passed; that is the moment the page's primary action (Join, Follow) should be in it, in place of the share icon. Scroll each to the solid state."
      >
        <PhoneRow>
          <Cell label="Menu, then Join at the right edge" verdict={Verdict.Ship} note="Tsahi's pick: both in the right-hand group, the menu just left of Join, Join owning the edge; nothing sits next to the back button. Applied to squads, profiles, tags and sources. Over the cover nothing changes: text never floats, so Join appears only when the block is solid.">
            <SquadScroll layout={BlockActionLayout.MenuLeft} />
          </Cell>
        </PhoneRow>
        <p className="max-w-[40rem] text-text-tertiary typo-footnote">
          The two layouts set aside (the block keeping only icons, and X&apos;s Join before the menu) are in the Archive: Scroll arms, post page and reading.
        </p>
        <Callout tone={CalloutTone.Good} title="The rule">
          On a thing, the solid block is back, name, then on the right the
          menu and the page&apos;s primary action at the edge (Join on a
          squad, Follow on a profile, tag or source). Share and, on a squad,
          search live in the menu once the block is solid. Over the cover,
          where the block is transparent, only icon buttons show.
        </Callout>
      </Section>

      <Section
        title="The stickiness guideline"
        description="Element by element: what it looks like at rest, what happens while you read down, what happens on a scroll up, and why."
      >
        <Table
          head={['Element', 'At rest', 'Reading down', 'Scroll up', 'Why']}
          rows={stickRules.map((row) => [
            <span key={row.element} className="font-bold text-text-primary">
              {row.element}
            </span>,
            row.atRest,
            row.readingDown,
            row.scrollUp,
            row.why,
          ])}
        />
        <Table
          head={['Page', 'In the block', 'The row', 'Bottom', 'Note']}
          rows={pageScrolls.map((row) => [
            <span key={row.page} className="font-bold text-text-primary">
              {row.page}
            </span>,
            row.block,
            row.row,
            row.bottom,
            row.note,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Why one block and not floating buttons">
            Once everything hides on reading, a button that floats over content
            at rest is a bar in disguise the moment it needs a background. A
            solid block that is there or not there is honest: at rest it is the
            page&apos;s header, while reading it is gone, on a nudge it is back.
            Things keep the floating look only while the cover is under the
            buttons, where there is nothing to hide.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Why direction and not position">
            A position rule (show only at the top) makes a long feed a one-way
            trip. A direction rule gives the block back for one small upward
            movement, wherever you are, which is what X, Instagram, YouTube and
            the browser address bar have trained everyone to expect.
          </Callout>
          <Callout title="Numbers to tune">
            Hide distance {hideSpec.distance}px, dead zone {hideSpec.deadZone}px, hide
            tolerance {hideSpec.hideTolerance}px, reveal tolerance {hideSpec.revealTolerance}px.
            On a page with a hero the dead zone is the hero: the block never hides while
            the hero is on screen.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Do not">
            No pinned row on its own. No bar that stays on one page and hides on
            another. No hiding inside the dead zone, while the keyboard is up,
            or under a sheet. No half states after a gesture. No gradient or
            blur behind the block: it is page background or nothing.
          </Callout>
        </div>
      </Section>

      <Section
        title="What others do, and the numbers"
        description="Verified from Chromium source, Material and Apple docs, NN/g and app reports. Two things stand out: everyone reveals on any upward movement, not at the top; and the apps that hide their home header still keep something pinned on profiles. Our rule goes one step past them on things, and says so."
      >
        <Table
          head={['App or platform', 'Hides on scroll down', 'Stays', 'Reveal', 'Motion']}
          rows={hideBenchmarks.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
            row[2],
            row[3],
            row[4],
          ])}
        />
        <div className="grid gap-4 laptop:grid-cols-2">
          <Table
            head={['Thresholds', 'Numbers']}
            rows={hideNumbers.map((row) => [
              <span key={row[0]} className="font-bold text-text-primary">
                {row[0]}
              </span>,
              row[1],
            ])}
          />
          <Table
            head={['What stays pinned elsewhere', 'Why, and what we do']}
            rows={pinnedInstead.map((row) => [
              <span key={row[0]} className="font-bold text-text-primary">
                {row[0]}
              </span>,
              row[1],
            ])}
          />
        </div>
        <Table
          head={['Guidance', 'Says']}
          rows={hideGuidance.map((row) => [
            <a key={row[0]} href={row[2]} target="_blank" rel="noreferrer" className="font-bold text-text-primary underline">
              {row[0]}
            </a>,
            row[1],
          ])}
        />
        <Callout title="The one place we go past the benchmarks">
          X and Instagram keep the profile name bar and its tabs pinned, and
          Apple asks that a tab bar never hide. We keep the bottom cluster,
          which answers Apple, and we hide the block on things too, which
          neither X nor Instagram does. The reason is one rule for every page;
          the cost is that switching Posts to About on a squad after reading
          needs a nudge up first. If that shows up in testing, pinning the row
          on things is the fallback, and it is one flag in the shared hook.
        </Callout>
        <DigIn title="Pitfalls for a web app in the wrapper, and sources">
          <Table
            head={['Pitfall', 'Handling']}
            rows={hidePitfalls.map((row) => [
              <span key={row[0]} className="font-bold text-text-primary">
                {row[0]}
              </span>,
              row[1],
            ])}
          />
          <ul className="mt-3 flex flex-col gap-1">
            {hideSources.map((url) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer" className="text-text-secondary underline typo-footnote">
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </DigIn>
      </Section>

      <Section
        title="Considered and set aside"
        description="The arms from this round (the soft edge with a title that stays, buttons that stay while the row hides, the cluster hiding too) and the first hide-on-scroll spec are kept in the archive."
      >
        <p className="text-text-tertiary typo-footnote">
          Scroll them in the{' '}
          <button
            type="button"
            onClick={linkTo('Mobile UX/Archive/Scroll arms, post page and reading')}
            className="font-bold text-text-primary underline"
          >
            Archive: Scroll arms, post page and reading
          </button>
          .
        </p>
        <Quote>Read down, it leaves. Nudge up, it is back. Every page, the same.</Quote>
        <DigIn title="Implementation notes">
          <p>
            One useChromeVisibility hook on the scroll container: a passive
            scroll listener with the direction, tolerance and dead-zone logic
            in hideSpec, writing one progress value to a CSS variable on the
            shell so the top block and the bottom cluster read the same
            number. Pages with a hero pass the hero height as the dead zone
            and a pin value that drives the block&apos;s background and the
            title. A scrollend listener snaps to 0 or 1 (a 120ms timeout where
            scrollend is missing). Overscroll is ignored, the keyboard and
            sheets set the value to 0 and pause the listener,
            prefers-reduced-motion swaps the slide for a 150ms fade. The block
            is an overlay, so content keeps a constant top padding and never
            reflows.
          </p>
        </DigIn>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="4e" />
      </Section>
    </Page>
  ),
};

// Single phones for device testing (open the story's iframe URL on a phone
// or the simulator: the 375px phone fits the screen).
export const DeviceSquadPage: Story = { render: () => <SquadScroll /> };
export const DeviceProfile: Story = { render: () => <ProfileScroll /> };
export const DeviceSquadsRoot: Story = { render: () => <SquadsScroll /> };
export const DeviceHome: Story = { render: () => <HomeScroll /> };
