import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Callout,
  CalloutTone,
  Cell,
  Page,
  PageHeader,
  PhoneFrame,
  Section,
  Stage,
} from './shell';
import type { Offer } from './data';
import { milestones, offers } from './data';
import { RewardCardState } from './RewardCard';
import { SplitMoment } from './VariantSplit';
import { DeclineStyle } from './moment';
import { LadderMoment } from './VariantLadder';
import { MobileMoment, MobileStep } from './VariantMobile';
import { CarouselMoment } from './VariantCarousel';
import { SpotlightMoment } from './VariantSpotlight';

const meta: Meta = {
  title: 'Milestone Rewards/2. Popup variants',
  parameters: { layout: 'fullscreen' },
};

export default meta;

type Story = StoryObj;

const CLAIM_DELAY = 1400;
const noop = () => undefined;

// The programme always hands over at least three gifts, so every popup here is
// drawn with a list rather than a single offer.
const giftList: Offer[] = [
  offers.disneyplus,
  offers.hulu,
  offers.notion,
  offers.applemusic,
];

/** Drives idle → claiming → claimed for whichever popup is passed in. */
const useClaim = (): {
  state: RewardCardState;
  claim: () => void;
  reset: () => void;
} => {
  const [state, setState] = useState(RewardCardState.Idle);

  useEffect(() => {
    if (state !== RewardCardState.Claiming) {
      return undefined;
    }

    const timer = setTimeout(
      () => setState(RewardCardState.Claimed),
      CLAIM_DELAY,
    );

    return () => clearTimeout(timer);
  }, [state]);

  return {
    state,
    claim: useCallback(() => setState(RewardCardState.Claiming), []),
    reset: useCallback(() => setState(RewardCardState.Idle), []),
  };
};

const Replay = ({ onClick }: { onClick: () => void }): React.ReactElement => (
  <div className="flex items-center gap-3">
    <Button
      size={ButtonSize.Small}
      variant={ButtonVariant.Secondary}
      onClick={onClick}
    >
      Replay
    </Button>
    <span className="text-text-quaternary typo-caption1">
      Flame artwork, ember burst and the rolling streak count all replay from the
      top.
    </span>
  </div>
);

const SplitPlayground = (): React.ReactElement => {
  const { state, claim, reset } = useClaim();
  const [run, setRun] = useState(0);
  const replay = useCallback(() => {
    reset();
    setRun((current) => current + 1);
  }, [reset]);

  return (
    <div className="flex flex-col gap-4">
      <Stage height={620}>
        <SplitMoment
          key={run}
          milestone={milestones.month}
          offer={offers.disneyplus}
          gifts={giftList}
          state={state}
          onClaim={claim}
          onKeep={replay}
          onClose={replay}
          onOptOut={replay}
        />
      </Stage>
      <Replay onClick={replay} />
    </div>
  );
};

export const Split: Story = {
  name: '1 · Split',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Variant 1"
        title="Split: the streak burns on the left, the gift waits on the right"
      >
        <p>
          832 by roughly 500. The tier artwork gets to be big, the streak count
          rolls in digit by digit, and the gift keeps its own column with a
          single full width button. Nothing stacks, so nothing scrolls.
        </p>
        <p>
          This is the safe default for the sponsored days. The partner never
          touches the left half, which is what stops the celebration reading as
          the wrapper around an ad.
        </p>
      </PageHeader>

      <Section title="In context">
        <SplitPlayground />
      </Section>


      <Section
        title="How the desktop popup should end"
        description="On a phone the decline has to be a real target near the thumb. On desktop the X sits under the cursor already, so a full-width button under the offers says the same thing twice. Three endings, same popup."
      >
        <div className="flex flex-col gap-8">
          <Cell
            label="A · The X is the decline"
            note="Nothing at the bottom. Recommended."
          >
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={giftList}
              decline={DeclineStyle.CloseOnly}
            />
          </Cell>
          <Cell
            label="B · A quiet link that names what closing does"
            note="Turns the decline into a forward action: the gifts go somewhere."
          >
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={giftList}
              decline={DeclineStyle.SaveLink}
            />
          </Cell>
          <Cell
            label="C · The mobile button, on desktop"
            note="What we had. Reads as a second close button."
          >
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={giftList}
              decline={DeclineStyle.Button}
            />
          </Cell>
        </div>
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="A, and it is not a compromise">
            Closing already means no thanks, and the gifts are written to the
            vault the moment the streak day fires, so nothing is lost by closing.
            The screen ends on the offers, which is where the attention should
            be.
          </Callout>
          <Callout title="B if we need the vault to be discoverable">
            The one thing A gives up is telling people the gifts wait somewhere.
            If the vault is new and unfamiliar, this link buys that at the cost of
            one small line.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="C only on the phone">
            A thumb cannot reach a 16px X in the top corner, so mobile keeps the
            full-width button. On desktop it is a duplicate.
          </Callout>
        </div>
      </Section>

      <Section
        title="States"
        description="Claiming sweeps the brand cover, claimed swaps the button for the receipt line and points at the vault."
      >
        <div className="flex flex-col gap-8">
          <Cell label="Claiming" note="hand-off in flight">
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={giftList}
              state={RewardCardState.Claiming}
            />
          </Cell>
          <Cell label="Claimed" note="receipt, no dead end">
            <SplitMoment
              milestone={milestones.month}
              offer={offers.disneyplus}
              gifts={giftList}
              state={RewardCardState.Claimed}
              onKeep={noop}
            />
          </Cell>
        </div>
      </Section>

      <Section
        title="Other sponsored days"
        description="Day 7 is the first gift anyone sees, and day 365 is the rarest. Same frame, different flame."
      >
        <div className="flex flex-col gap-8">
          <Cell label="Day 7 · Flame" note="first sponsored gift">
            <SplitMoment
              milestone={milestones.week}
              offer={offers.duolingo}
              gifts={[offers.duolingo, offers.nordvpn, offers.uber]}
              onOptOut={noop}
            />
          </Cell>
          <Cell label="Day 365 · Legendary" note="rarest day on the ladder">
            <SplitMoment
              milestone={milestones.year}
              offer={offers.applemusic}
              gifts={[offers.applemusic, offers.spotify, offers.notion]}
              onOptOut={noop}
            />
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};

const LadderPlayground = (): React.ReactElement => {
  const { state, claim, reset } = useClaim();
  const [run, setRun] = useState(0);
  const replay = useCallback(() => {
    reset();
    setRun((current) => current + 1);
  }, [reset]);

  return (
    <div className="flex flex-col gap-4">
      <Stage height={620}>
        <LadderMoment
          key={run}
          milestone={milestones.month}
          offer={offers.spotify}
          gifts={giftList.slice(0, 3)}
          state={state}
          onClaim={claim}
          onKeep={replay}
          onClose={replay}
          onOptOut={replay}
        />
      </Stage>
      <Replay onClick={replay} />
    </div>
  );
};

export const Ladder: Story = {
  name: '2 · Flame ladder',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Variant 2"
        title="Flame ladder: the gift you earned, next to the one you are walking toward"
      >
        <p>
          896 by roughly 500. The left rail is the tier ladder: the flames you
          have already burned through, the one you are standing on, and the next
          one with its reward already visible. Claiming today and keeping the
          streak alive become the same motion.
        </p>
        <p>
          The strongest variant for the thing we actually want, which is day 31.
          It is also the only one that makes a sponsored gift feel like part of a
          progression rather than a one-off ad slot.
        </p>
      </PageHeader>

      <Section title="In context">
        <LadderPlayground />
      </Section>

      <Section title="States and other days">
        <div className="flex flex-col gap-8">
          <Cell label="Claimed" note="ladder keeps pointing at the next flame">
            <LadderMoment
              milestone={milestones.month}
              offer={offers.spotify}
              gifts={giftList.slice(0, 3)}
              state={RewardCardState.Claimed}
              onKeep={noop}
            />
          </Cell>
          <Cell label="Day 7 · Flame" note="early on the ladder">
            <LadderMoment
              milestone={milestones.week}
              offer={offers.duolingo}
              gifts={[offers.duolingo, offers.nordvpn, offers.uber]}
              onOptOut={noop}
            />
          </Cell>
        </div>
      </Section>
    </Page>
  ),
};


const REDIRECT_DELAY = 1600;


const CarouselPlayground = (): React.ReactElement => {
  const { state, claim, reset } = useClaim();
  const [picked, setPicked] = useState<Offer>();
  const [run, setRun] = useState(0);
  const replay = useCallback(() => {
    reset();
    setPicked(undefined);
    setRun((current) => current + 1);
  }, [reset]);

  return (
    <div className="flex flex-col gap-4">
      <Stage height={760}>
        <CarouselMoment
          key={run}
          milestone={milestones.month}
          gifts={giftList}
          state={state}
          claimingId={picked?.id}
          onClaim={(offer) => {
            setPicked(offer);
            claim();
          }}
          onKeep={replay}
          onClose={replay}
        />
      </Stage>
      <Replay onClick={replay} />
    </div>
  );
};

export const Carousel: Story = {
  name: '3 · Carousel',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Variant 3"
        title="Carousel: the partner mock-up's shape, on the desktop"
      >
        <p>
          832 wide. The win is centred at the top, then the gifts arrive as full
          cards you page through with arrows, neighbours peeking in at both
          edges so it is obvious there is more than one. Each card carries its
          own photography, which is how the partner presents its inventory.
        </p>
        <p>
          It costs far more room per gift than the list and only one offer is
          properly readable at a time. That is the trade: presence for each gift
          against being able to compare them.
        </p>
      </PageHeader>

      <Section title="In context">
        <CarouselPlayground />
      </Section>

      <Section
        title="States"
        description="Claiming happens on the card, not on a shared button at the bottom, so paging never loses which gift you were looking at."
      >
        <div className="flex flex-col gap-8">
          <Cell label="Claiming" note="the card you tapped sweeps">
            <CarouselMoment
              milestone={milestones.month}
              gifts={giftList}
              claimingId={offers.disneyplus.id}
              state={RewardCardState.Claiming}
            />
          </Cell>
          <Cell label="Day 7 · Flame" note="three gifts, first sponsored day">
            <CarouselMoment
              milestone={milestones.week}
              gifts={[offers.hulu, offers.spotify, offers.duolingo]}
              onKeep={noop}
            />
          </Cell>
        </div>
      </Section>

      <Section title="Carousel against list">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Every gift gets a full card">
            Photography, offer sentence and brand bar at full size. For consumer
            brands that is a real difference: a Hulu card with popcorn on it
            sells better than a row of text.
          </Callout>
          <Callout tone={CalloutTone.Good} title="It matches what the partner ships">
            Their inventory comes with per-offer imagery. This is the layout that
            uses it rather than throwing it away.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="One at a time">
            You cannot compare four gifts without paging back and forth, and the
            fourth one may never be seen at all.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="It is the tallest popup">
            Around 700px with the cards, arrows and fine print. The list version
            fits the same four gifts in half that.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

const MobilePlayground = (): React.ReactElement => {
  const [step, setStep] = useState(MobileStep.Gifts);
  const [picked, setPicked] = useState<Offer>();

  useEffect(() => {
    if (step !== MobileStep.Redirecting) {
      return undefined;
    }

    const timer = setTimeout(() => setStep(MobileStep.Active), REDIRECT_DELAY);

    return () => clearTimeout(timer);
  }, [step]);

  const reset = useCallback(() => {
    setStep(MobileStep.Gifts);
    setPicked(undefined);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <PhoneFrame>
        <MobileMoment
          milestone={milestones.month}
          gifts={giftList}
          step={step}
          activeOffer={picked}
          onClaim={(offer) => {
            setPicked(offer);
            setStep(MobileStep.Redirecting);
          }}
          onKeep={reset}
          onClose={reset}
          onDone={reset}
        />
      </PhoneFrame>
      <Replay onClick={reset} />
    </div>
  );
};

export const Mobile: Story = {
  name: '4 · Mobile',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Variant 4"
        title="Mobile: the win on top, the gifts swipeable underneath"
      >
        <p>
          384 wide, the shape the partner mock-up used. The flame and the streak
          count own the top, then a swipeable row of gifts with one small button
          per card. On a phone this is a bottom drawer, which is what the streak
          modal already does through Modal.isDrawerOnMobile.
        </p>
        <p>
          Three beats, the same three the mock-up showed: pick a gift, watch the
          hand-off, see it confirmed. The difference is that the celebration is
          ours and the disclosure never leaves the screen.
        </p>
      </PageHeader>

      <Section title="Swipe, claim, confirm">
        <MobilePlayground />
      </Section>

      <Section
        title="The three beats"
        description="Claim on any card to start the hand-off. The gift is already in the vault before the redirect happens, so a failed hand-off never loses it."
      >
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="1 · Gifts" note="swipeable, three or more">
            <PhoneFrame>
              <MobileMoment
                milestone={milestones.month}
                gifts={giftList}
                onClaim={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="2 · Redirecting" note="not dismissible, about 1.5s">
            <PhoneFrame>
              <MobileMoment
                milestone={milestones.month}
                gifts={giftList}
                step={MobileStep.Redirecting}
                activeOffer={offers.disneyplus}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="3 · Active" note="receipt, plus the renewal warning">
            <PhoneFrame>
              <MobileMoment
                milestone={milestones.month}
                gifts={giftList}
                step={MobileStep.Active}
                activeOffer={offers.disneyplus}
                onDone={noop}
              />
            </PhoneFrame>
          </Cell>
        </div>
      </Section>

      <Section title="What it borrows and what it refuses">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Borrowed: the swipe">
            A row of gifts you can flick through is the right pattern on a phone,
            and it is how the partner already thinks about inventory.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Borrowed: the confirmation beat">
            Telling someone the gift is live, and that it renews at full price
            later, is the difference between a gift and a surprise charge.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Refused: confetti on a paid moment">
            The mock-up celebrates the subscription. We celebrate the streak. The
            confetti belongs to the day, not to the partner.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Refused: an endless carousel">
            Three to five gifts, then it stops. A rack you can scroll forever is
            a store, and a store is not a reward.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};


const WIDTHS = [
  { label: 'Phone', width: 380, note: 'Below 44rem: one column, decline becomes a button' },
  { label: 'Large phone', width: 480, note: 'Same column, artwork grows with the container' },
  { label: 'Tablet', width: 680, note: 'Still one column, everything scales up' },
  { label: 'Laptop', width: 860, note: 'Two columns, the X is the decline' },
];


const SpotlightPlayground = (): React.ReactElement => {
  const { state, claim, reset } = useClaim();
  const [run, setRun] = useState(0);
  const replay = useCallback(() => {
    reset();
    setRun((current) => current + 1);
  }, [reset]);

  return (
    <div className="flex flex-col gap-4">
      <PhoneFrame>
        <SpotlightMoment
          key={run}
          milestone={milestones.month}
          gifts={giftList}
          state={state}
          onClaim={claim}
          onKeep={replay}
          onClose={replay}
        />
      </PhoneFrame>
      <Replay onClick={replay} />
    </div>
  );
};

export const Spotlight: Story = {
  name: '5 · Spotlight',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Variant 5"
        title="Spotlight: one gift at a time, and it still feels like the list"
      >
        <p>
          A tinted card, the brand&apos;s own icon, the offer in one line, and
          the neighbours dimmed at the edges so it is obvious there are more.
          Dropping the photography is the whole point: without a lifestyle photo
          behind it, a gift reads as a gift rather than as an ad break.
        </p>
        <p>
          One primary button under the carousel, acting on whichever card is
          centred, so there is exactly one thing to press. Tap a neighbour or a
          dot to move.
        </p>
      </PageHeader>

      <Section title="Swipe and claim">
        <SpotlightPlayground />
      </Section>

      <Section
        title="States and other days"
        description="The card in the centre is the one the button claims, so the confirmation names it."
      >
        <div className="flex flex-wrap items-start gap-8">
          <Cell label="Second gift centred" note="tap a neighbour or a dot">
            <PhoneFrame>
              <SpotlightMoment
                milestone={milestones.month}
                gifts={giftList}
                startIndex={1}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Claiming" note="the button carries the state">
            <PhoneFrame>
              <SpotlightMoment
                milestone={milestones.month}
                gifts={giftList}
                state={RewardCardState.Claiming}
              />
            </PhoneFrame>
          </Cell>
          <Cell label="Claimed" note="no dead end, no second modal">
            <PhoneFrame>
              <SpotlightMoment
                milestone={milestones.month}
                gifts={giftList}
                state={RewardCardState.Claimed}
                onKeep={noop}
              />
            </PhoneFrame>
          </Cell>
        </div>
      </Section>

      <Section title="Against the other two carousels">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="It does not look bought">
            No stock photography, no brand takeover of the card. The brand gets
            its icon and its sentence, which is enough to be recognised and not
            enough to feel like a placement.
          </Callout>
          <Callout tone={CalloutTone.Good} title="One primary action">
            The claim lives under the carousel rather than on every card, so the
            screen has a single obvious next step at any moment.
          </Callout>
          <Callout title="Same vibe as the list">
            Logo, brand, offer, one button. It is the list, rearranged for a
            screen where only one row fits comfortably.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Still one at a time">
            Comparing four gifts means four taps. On desktop the list remains the
            better shape for that reason.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

export const Responsive: Story = {
  name: 'Responsive',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="One popup, every width"
        title="The split collapses into the vertical layout on its own"
      >
        <p>
          Below 44rem of available width the popup becomes a single column: the
          flame panel goes full width and centres, the gift list follows it, and
          the decline turns into a real button because the corner X is out of
          thumb reach. Above that it is the two column split again.
        </p>
        <p>
          The measurements are container queries, not viewport ones, so the same
          component behaves correctly inside a modal, a drawer or a narrow panel.
          The flame and the streak count interpolate with the container width
          rather than snapping between sizes.
        </p>
      </PageHeader>

      <Section
        title="Split, at four widths"
        description="Every frame below renders the identical component. Only the space it is given changes."
      >
        <div className="flex flex-col gap-10">
          {WIDTHS.map(({ label, width, note }) => (
            <Cell key={label} label={`${label} · ${width}px`} note={note}>
              <div style={{ width }} className="max-w-full">
                <SplitMoment
                  milestone={milestones.month}
                  offer={offers.disneyplus}
                  gifts={giftList.slice(0, 3)}
                  onClose={noop}
                />
              </div>
            </Cell>
          ))}
        </div>
      </Section>

      <Section
        title="Ladder, at the same widths"
        description="The tier rail stacks above the gifts and scrolls inside itself rather than making the popup taller."
      >
        <div className="flex flex-col gap-10">
          {WIDTHS.map(({ label, width }) => (
            <Cell key={label} label={`${label} · ${width}px`}>
              <div style={{ width }} className="max-w-full">
                <LadderMoment
                  milestone={milestones.month}
                  offer={offers.spotify}
                  gifts={giftList.slice(0, 3)}
                  onClose={noop}
                />
              </div>
            </Cell>
          ))}
        </div>
      </Section>

      <Section title="The rules">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="One component, not two">
            The vertical layout is the same popup under a container query, so a
            copy change or a new state lands in both at once. The dedicated
            mobile variant stays as the spec for the swipeable card treatment.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Sizes interpolate">
            Flame and streak count use clamp against container width, so nothing
            jumps at a breakpoint and the artwork stays proportionate at every
            size.
          </Callout>
          <Callout title="Below 28rem">
            The week strip drops out. It is the least load-bearing element and
            the first thing to go when the frame gets truly small.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="What does not change">
            The list stays a list at every width. Turning it into a carousel on
            desktop and a list on mobile would be two products to maintain.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};

export const Compare: Story = {
  name: 'Side by side',
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Comparison"
        title="The three that survived, same day 30 milestone"
      >
        <p>
          All three at their real size, so the footprint is comparable. The two
          that were cut, a compact ember band and a three-card picker, both put
          more weight on the offer than the streak could carry.
        </p>
      </PageHeader>

      <Section title="1 · Split" description="832 × 500. The safe default.">
        <SplitMoment
          milestone={milestones.month}
          offer={offers.disneyplus}
          gifts={giftList}
          onOptOut={noop}
        />
      </Section>
      <Section
        title="3 · Carousel"
        description="832 wide. Full cards with the partner's own photography, paged with arrows."
      >
        <CarouselMoment
          milestone={milestones.month}
          gifts={giftList}
          onKeep={noop}
        />
      </Section>
      <Section
        title="2 · Flame ladder"
        description="896 × 500. Claim today, and see tomorrow."
      >
        <LadderMoment
          milestone={milestones.month}
          offer={offers.spotify}
          gifts={giftList.slice(0, 3)}
          onOptOut={noop}
        />
      </Section>

      <Section title="Which one to ship">
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Ladder for the sponsored days">
            It is the only variant that sells the next milestone as well as this
            one, and the tier art carries the whole moment without a single line
            of hype copy.
          </Callout>
          <Callout tone={CalloutTone.Good} title="Split as the fallback">
            Same list, same copy, no dependency on the tier ladder shipping
            first. It needs nothing but the day number and one flame.
          </Callout>
          <Callout title="Carousel if the imagery is the selling point">
            It is the only layout that shows the partner photography at full
            size. It is also the tallest, and the fourth gift may never be seen.
          </Callout>
          <Callout title="Mobile is not a variant, it is the phone">
            Whichever desktop shape wins, the phone gets the swipeable version of
            it.
          </Callout>
          <Callout tone={CalloutTone.Bad} title="What none of them do">
            No countdown timers, no confirm-shaming, no gate on closing. The
            streak celebration has to survive a user who taps the X in the first
            second.
          </Callout>
        </div>
      </Section>
    </Page>
  ),
};
