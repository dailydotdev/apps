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
  ActivityScroll,
  ExploreScroll,
  HomeScroll,
  NewSquadLook,
  SquadsScroll,
  TagScroll,
  YouScroll,
  newSquadLookNotes,
} from './scrollPages';

const meta: Meta = {
  title: 'Mobile UX/9c. Avatar on the left',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const rules: [string, string][] = [
  ['Name or logo left, avatar right, on every root', 'The decided row, confirmed after seeing the left-side simulation. Leaves keep back on the left with the name beside it.'],
  ['The streak lives on Home only', 'The number first, then the flame, in front of the avatar. Explore, Squads and Activity carry no streak; the streak page is one tap away on the You page.'],
  ['Between the name and the avatar sits at most one thing', 'Home: the streak. Activity: notification settings. Explore and Squads: nothing; New squad is the first tile of Your squads. Whatever sits there is quiet and the avatar’s size, never a filled button.'],
  ['The avatar opens the You page', 'A leaf pushed on top, with back where the avatar was not: back is on the left, so nothing collides. Not a side drawer.'],
];

export const AvatarLeft: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Tsahi’s question after 9b, and his answer"
        title="X keeps the avatar top left on every tab. Simulated on our four roots, the call is to keep the avatar on the right with the name on the left, show the streak on Home only, and move New squad into the content."
      >
        <p>
          On X the avatar is the one fixed thing across the five tabs: always
          top left, always opening the account drawer. This chapter simulated
          that on our four roots (now in the Archive: Later calls). After seeing it,
          Tsahi kept the decided row: name or logo on the left, avatar on the
          right. Two refinements came out of the comparison: the streak shows
          on Home only, number first, and New squad leaves the brand row for
          the first tile of Your squads, so every root row is name and avatar
          with at most one quiet thing between them. The other four New squad
          looks are archived.
        </p>
        <ChapterNav current="9c" />
      </PageHeader>

      <Status status={ChapterStatus.Decided} round="5">
        Decided by Tsahi: avatar right, name left, streak on Home only with
        the number first, and New squad as the first tile of Your squads
        (look 5), so the Squads brand row is name and avatar like Explore’s.
      </Status>

      <Goal
        goal="One row layout for every root, quiet enough that the avatar and the page name are the only things you notice."
        metric="You-page opens per session and squad creations started from the root; no drop in streak visibility on Home."
      />

      <Section
        title="The decided row on the four roots"
        description="Name or logo left, avatar right. The streak on Home only, number then flame. Squads has name and avatar only, with New as the first tile of Your squads. Scroll any of them: the row hides with the block and returns on scroll up."
      >
        <PhoneRow>
          <Cell label="Home" verdict={Verdict.Ship} note="Logo, then 12 and the flame, then the avatar.">
            <HomeScroll />
          </Cell>
          <Cell label="Explore" verdict={Verdict.Ship} note="Name and avatar, nothing else.">
            <ExploreScroll />
          </Cell>
          <Cell label="Squads" verdict={Verdict.Ship} note="Name and avatar, nothing between them; New squad is the first tile of Your squads.">
            <SquadsScroll />
          </Cell>
          <Cell label="Activity" verdict={Verdict.Ship} note="Name, notification settings, the avatar. No streak here any more.">
            <ActivityScroll />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="New squad: the decided look"
        description="Nothing in the brand row; New is the first tile of Your squads, so the Squads row is name and avatar like Explore’s. The four looks that put a control next to the avatar are in the Archive: Later calls."
      >
        <PhoneRow>
          <Cell label="5 · New as the first tile" verdict={Verdict.Ship} note={newSquadLookNotes[NewSquadLook.InContent]}>
            <SquadsScroll />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="What the avatar opens"
        description="Tapping the avatar pushes the You page as a leaf: back on the left, Help as the one top action, the list as Tsahi ordered it."
      >
        <PhoneRow>
          <Cell label="You, pushed from the avatar" verdict={Verdict.Ship} note="Plus, your lists, your progress (achievements, streak, DevCard, hot takes, game center), wallet, invite, settings; Help on the bar. Back returns to the root you were on.">
            <YouScroll />
          </Cell>
          <Cell label="A leaf beside it" note="The tag page as decided: back left, name beside it, actions right.">
            <TagScroll />
          </Cell>
        </PhoneRow>
      </Section>

      <Section
        title="The rules"
        description="Four lines, all confirming the decided system with the refinements."
      >
        <Table
          head={['Rule', 'Detail']}
          rows={rules.map((row) => [
            <span key={row[0]} className="font-bold text-text-primary">
              {row[0]}
            </span>,
            row[1],
          ])}
        />
        <Quote>Name on the left, you on the right, at most one quiet thing between them.</Quote>
      </Section>

      <Section title="Next chapter">
        <ChapterNav current="9c" />
      </Section>
    </Page>
  ),
};
