import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import { Callout, CalloutTone, Cell, Page, PageHeader, Section, Table } from '../shell';
import { ProductShell } from './product';
import { ReplayPopup } from './entry';
import {
  BookmarkRibbon,
  CharmDelivery,
  CountdownChip,
  DeskCard,
  Entry2Styles,
  GridAvatar,
  LanyardBadge,
  LiveMiniDeck,
  OdometerChip,
  PeekingCard,
  ReceiptTicket,
  SkyStrip,
  SocialPill,
  TypedTicker,
} from './entry2';

const meta: Meta = {
  title: 'Replay delivery/00d. Doors, second round',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Thirteen more entry points that are not a card, a strip, a banner or a pill: objects sitting on the feed, the person\'s own data as the handle, and moments the feed performs once. All open the pop-up.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Door = ({
  number,
  title,
  idea,
  children,
  why,
  risk,
}: {
  number: number;
  title: string;
  idea: string;
  children: ReactNode;
  why: string;
  risk: string;
}): ReactElement => (
  <Section title={`${number} · ${title}`} description={idea}>
    {children}
    <div className="grid gap-4 tablet:grid-cols-2">
      <Callout tone={CalloutTone.Good} title="Why it might be the one">
        <p>{why}</p>
      </Callout>
      <Callout tone={CalloutTone.Bad} title="What would kill it">
        <p>{risk}</p>
      </Callout>
    </div>
  </Section>
);

export const SecondRound: Story = {
  name: 'Thirteen doors',
  render: () => {
    const [open, setOpen] = useState(false);
    const go = () => setOpen(true);
    return (
      <>
        <ReplayPopup open={open} onClose={() => setOpen(false)} />
        <Page>
          <Entry2Styles />
          <PageHeader eyebrow="Replay delivery · entry points, round two" title="Not a card, not a strip, not a banner">
            <p>
              Round one put a labelled thing in the feed and asked for a click.
              This round tries three other ideas. An object that is physically
              on the feed and behaves like one: a card tucked behind the edge, a
              badge on a lanyard, a receipt that prints, a ribbon. The
              person&apos;s own data as the handle: their grid where their
              avatar was, their standing counting up, their week&apos;s colours.
              And a moment the feed performs once: a line typing itself, a
              countdown that seals, a dog bringing the pack. Every one opens the
              same pop-up; several of them move, so give each a second.
            </p>
          </PageHeader>

          <Door
            number={1}
            title="The card tucked behind the edge"
            idea="The hero card is physically slid in behind the right edge of the viewport, a third showing, tilted, breathing. Hover pulls it out; click opens the deck."
            why="It is the only door that shows the actual card, as an object, without spending any feed. A card sticking out of the side of a screen is a thing you pull, not a thing you read."
            risk="Right-edge real estate collides with scrollbars and browser UI on some setups. Needs a safe inset and a way to tuck it fully away for the week."
          >
            <ProductShell count={6} overlay={<PeekingCard onOpen={go} />} />
          </Door>

          <Door
            number={2}
            title="The card on the desk"
            idea="One card lies face down at the bottom left, at an angle, as if it were dealt onto the desk. First tap flips it in place and shows the claim. Second tap opens all five."
            why="Two steps of curiosity for one click of effort. The flip is a reveal the person controls, and after it the claim itself is the invitation to see the rest."
            risk="Two taps is one more than every other door. If the flipped card does not make the rest irresistible, it is just a slower door."
          >
            <ProductShell count={6} overlay={<DeskCard onOpen={go} />} />
          </Door>

          <Door
            number={3}
            title="The deck that shuffles itself"
            idea="The floating one, made honest: a tiny three-card deck at the bottom right that keeps dealing its top card to the back, the exact gesture the pop-up uses. Tap to deal them for real."
            why="The entry demonstrates the interaction it leads to. People know what they will get before they click, and the motion is the product's own gesture, not a marketing animation."
            risk="Perpetual motion in the corner of a reading surface. It needs to stop after a few cycles and rest as a still stack."
          >
            <ProductShell count={6} overlay={<LiveMiniDeck onOpen={go} />} />
          </Door>

          <Door
            number={4}
            title="The lanyard badge"
            idea="A conference badge hangs from the top of the feed on a striped lanyard, swinging slightly: their face, their name, and this week's archetype printed on it. Tap for the rest."
            why="Every developer has worn one, and the badge is already an identity object people photograph. Putting the archetype on it turns the identity card into something that hangs in the room."
            risk="Covers the top of the first column while it hangs. Best as a Monday-only object that is taken off after the first open."
          >
            <ProductShell count={6} overlay={<LanyardBadge onOpen={go} />} />
          </Door>

          <Door
            number={5}
            title="The receipt"
            idea="A thermal receipt prints out from under the header on Monday: the week's totals in monospace, a perforated edge, TEAR HERE TO OPEN. Tearing it opens the deck."
            why="Developers love a receipt as a joke and as a format. It is dense, honest, and it is the one door that shows several numbers without being a dashboard, because it is styled as paper."
            risk="Receipts are what we said cards must not be. It works only because it is the door, not a card; if it ever gets a share button, the joke becomes the product."
          >
            <ProductShell count={6} overlay={<ReceiptTicket onOpen={go} />} />
          </Door>

          <Door
            number={6}
            title="The ribbon"
            idea="A bookmark ribbon hangs down from the top edge of the feed with the mark and the week on it. The smallest physical object here. Pull it, or tap it."
            why="Quiet, tactile, and it costs nothing. A ribbon in a book marks the place you are meant to come back to, which is exactly what a week's Replay is."
            risk="Too quiet on its own. It is the shape the badge or the receipt should shrink to after Monday, not the Monday door."
          >
            <ProductShell count={6} overlay={<BookmarkRibbon onOpen={go} />} />
          </Door>

          <Door
            number={7}
            title="The odometer"
            idea="On Monday's first load, a chip in the header counts up from Top 100% to Top 2% over a second and a half, then rests, lit. The number is the door."
            why="The claim performs itself. A number counting toward you is the oldest trick in scoreboards and it works on developers as well as anyone; the rest chip then stays all week as the live standing."
            risk="Runs once, so it has to be seen once. If the first session of the week starts on a post page the moment is spent on nobody."
          >
            <ProductShell count={6} headerRight={<OdometerChip onOpen={go} />} />
          </Door>

          <Door
            number={8}
            title="Your grid where your avatar was"
            idea="For the week, the avatar in the header is replaced by the person's own reading grid, the GitHub-graph shape of their week, with a small pulse. Tap it and the deck opens."
            why="The single most screenshotted identity object developers have is a grid of their activity. Making it the avatar for a week is strange in the right way, and it is generated from their data, so no two are alike."
            risk="Replacing the avatar can confuse for a second. It should only happen on the feed page, never in menus or comments, and the avatar returns the moment the deck is opened."
          >
            <ProductShell count={6} headerRight={<GridAvatar onOpen={go} />} />
          </Door>

          <Door
            number={9}
            title="The line that types itself"
            idea="Under the tabs, one monospace line types itself out once: week 37 · top 2% of kubernetes readers · 5 cards. Then it sits there with a blinking caret."
            why="Text as an object. It reads as the terminal, which is home for the audience, and the typing makes a static line into a moment without a single graphic."
            risk="Monospace on the feed can read as a system message. The caret and the dot have to say 'yours', not 'status'."
          >
            <ProductShell count={6} above={<TypedTicker onOpen={go} />} />
          </Door>

          <Door
            number={10}
            title="The sky"
            idea="A thin band above the feed takes the colours of the week's topics, slowly drifting. The person's week has a palette before it has a claim."
            why="Ambient and generative: nobody else's week looks like this band. It turns the feed's top edge into weather, and weather is something people glance at every day."
            risk="Pretty, and possibly meaningless. Without the topic names in the band it is decoration, and even with them it is the least direct door on this page."
          >
            <ProductShell count={6} above={<SkyStrip onOpen={go} />} />
          </Door>

          <Door
            number={11}
            title="The countdown that seals"
            idea="Sunday evening a chip in the corner counts down to the seal, showing the live standing. Monday morning the same chip reads sealed, with the pack in it. One object, two days."
            why="Anticipation is the door. The week is a story with a Sunday deadline, and Monday's open is finding out how it ended. The floating one you liked, with a reason to exist before Monday."
            risk="Needs the aggregate job running daily, not weekly. Without the live number on Sunday it is only the Monday chip."
          >
            <div className="flex flex-col gap-3">
              <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">Sunday, 21:46</span>
              <ProductShell count={3} overlay={<CountdownChip onOpen={go} />} />
              <span className="font-mono uppercase tracking-[0.12em] text-text-quaternary typo-caption2">Monday, 08:02</span>
              <ProductShell count={3} overlay={<CountdownChip onOpen={go} sealed />} />
            </div>
          </Door>

          <Door
            number={12}
            title="Three people you follow opened theirs"
            idea="A pill at the bottom with the avatars of people you follow who already opened this week's Replay. Your week is in too."
            why="Social proof is the strongest reason people open Wrapped: everyone else already has. This is the only door that says the week is happening to other people as well."
            risk="Needs the connection graph, which does not exist yet, and it must never show who has not opened theirs."
          >
            <ProductShell count={6} overlay={<SocialPill onOpen={go} />} />
          </Door>

          <Door
            number={13}
            title="Charm brings it"
            idea="The dog walks in from the right, sets the pack down at the bottom of the feed, and stays beside it. The pack is the door; the dog is the delivery."
            why="A delivery is a story in one second, and Charm already carries the product's emotional moments. It answers 'where did this come from' before anyone asks."
            risk="A mascot animation on every Monday wears thin. Once for the first Replay, then the pack simply appears."
          >
            <ProductShell count={6} overlay={<CharmDelivery onOpen={go} />} />
          </Door>

          <Section title="Side by side">
            <Table
              head={['Door', 'What it is', 'Costs the feed', 'Moves', 'Carries the claim', 'Best day']}
              minWidth={68}
              rows={[
                ['1 · Card behind the edge', 'Object', 'Nothing', 'Breathes', 'Yes, on the card', 'Monday to Wednesday'],
                ['2 · Card on the desk', 'Object', 'A corner', 'Flips on tap', 'After the flip', 'Monday'],
                ['3 · Shuffling deck', 'Object', 'A corner', 'Deals itself, then rests', 'No', 'All week'],
                ['4 · Lanyard badge', 'Object', 'Top of one column', 'Swings', 'The archetype', 'Monday'],
                ['5 · Receipt', 'Object', 'Top center, briefly', 'Prints once', 'Yes, as totals', 'Monday'],
                ['6 · Ribbon', 'Object', 'Nothing', 'Barely', 'No', 'Tuesday onward'],
                ['7 · Odometer', 'Data', 'Header chip', 'Counts once', 'It is the claim', 'Monday, then rests'],
                ['8 · Grid avatar', 'Data', 'Nothing', 'Pulses', 'No, shows the week', 'All week'],
                ['9 · Typed line', 'Moment', 'One row', 'Types once', 'Yes', 'Monday'],
                ['10 · Sky', 'Data', 'One row', 'Drifts', 'No', 'All week'],
                ['11 · Countdown, then sealed', 'Moment', 'A corner', 'Counts', 'Yes', 'Sunday and Monday'],
                ['12 · Social pill', 'Social', 'A corner', 'No', 'No', 'Monday to Wednesday'],
                ['13 · Charm delivers', 'Moment', 'A corner', 'Once', 'No', 'First ever'],
              ]}
            />
          </Section>

          <Section title="What I would put in front of people first">
            <div className="grid gap-4 tablet:grid-cols-3">
              <Cell label="The object" note="1 · the card behind the edge">
                <p className="text-text-tertiary typo-footnote">It shows the real card, it takes no feed, and pulling it out is the same motion as the deck. If one door has to carry Monday, this one.</p>
              </Cell>
              <Cell label="The data" note="7 · the odometer, resting as 11">
                <p className="text-text-tertiary typo-footnote">The claim performs itself once, then stays in the header as the live standing all week and counts down on Sunday. One chip, the whole week.</p>
              </Cell>
              <Cell label="The identity" note="8 · the grid avatar">
                <p className="text-text-tertiary typo-footnote">The strangest one here, and the one I think gets screenshotted. A week where your avatar is your week.</p>
              </Cell>
            </div>
            <Callout tone={CalloutTone.Good} title="What changed from round one">
              <p>
                Round one labelled things: Replay, week 37, open. This round
                lets the object or the number do the talking. A card sticking
                out of the screen does not need the word Replay on it.
              </p>
            </Callout>
          </Section>
        </Page>
      </>
    );
  },
};
