import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  CategoryChip,
  Cell,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import {
  Category,
  categoryNote,
  Mechanic,
  mechanicEffect,
  mechanicNote,
} from './catalog';

const meta: Meta = {
  title: 'Replay/00. Strategy',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Why the weekly recap is shaped the way it is. Read this before the catalog.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const effectClass = {
  Reach: 'text-accent-water-default',
  Loop: 'text-accent-cabbage-default',
  Both: 'text-accent-avocado-default',
};

export const Strategy: Story = {
  render: () => (
    <Page>
      <PageHeader
        eyebrow="Replay"
        title="A recap people post, not a report people read"
      >
        <p>
          Every Monday a developer who opened posts gets four to six cards about
          their week, hero first, handoff last. Each card is authored as an
          image that stands on its own, because the point of the initiative is
          not the recap. It is what leaves the app afterwards, and what they do
          next.
        </p>
        <p>
          Working name: <Mono>Replay</Mono>. <Mono>Highlight</Mono> and{' '}
          <Mono>Spotlight</Mono> are both taken already — post highlights and the
          command palette — so neither can name this.
        </p>
      </PageHeader>

      <Section
        title="Two findings that point in opposite directions"
        description="Both are worth taking seriously, because a weekly recap sits exactly where they collide."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout title="Wrapped works because it is annual">
            <p>
              Scarcity in time is the mechanism. Spotify drew over 200 million
              engaged users in the first 24 hours of Wrapped 2025 and 500 million
              shares, because everyone posts on the same day and it reads as an
              event.
            </p>
            <p>Run the same thing weekly and you get a report.</p>
          </Callout>
          <Callout title="Wrapped buys reach. Circles buys a loop.">
            <p>
              From our own viral-artifact research. A solo artifact is a
              monologue: one person posts, N people look, it ends. An artifact
              with other named people in it is a roll call, and everyone inside
              becomes the next creator.
            </p>
            <p>That is the difference between impressions and a coefficient.</p>
          </Callout>
        </div>
        <Callout tone={CalloutTone.Bad} title="So a weekly solo recap has neither advantage">
          No time scarcity, and nobody else in the picture. Not a reason to drop
          it. A reason to give the two cadences different jobs, and to put other
          developers back into the frames.
        </Callout>
      </Section>

      <Section
        title="One engine, two cadences"
        description="The weekly recap is not a small Wrapped. It reinforces the habit and trains people to expect the artifact; its share rate will be low single digits, which is fine, because it fires fifty-two times instead of once. The annual spends the scarcity and does the reach."
      >
        <Table
          head={['', 'Weekly', 'Annual']}
          minWidth={44}
          rows={[
            ['Window', 'ISO week, Mon to Sun, user timezone', 'Calendar year'],
            ['Generated', 'Monday of the following week', 'First week of December'],
            ['Delivered', 'First session of that week, whichever day', 'On open, all December'],
            ['Cap', '5 highlights, plus the two bookends', '10 highlights, plus the two bookends'],
            ['Job', 'Habit reinforcement, low ceremony', 'The event, high ceremony'],
            ['Share rate', 'Low single digits, times 52', 'High, times 1'],
          ]}
        />
      </Section>

      <Section
        title="Every recap spans four categories"
        description="Families stop the recap repeating itself. Categories decide what it feels like. Five stat cards is a report; five crowns is a participation trophy. The selector reserves one seat each for Crown, Surprise and Community before score decides the rest."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          {Object.values(Category).map((category) => (
            <Cell
              key={category}
              label=""
              className="rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4"
            >
              <div className="flex flex-col gap-2">
                <CategoryChip category={category} />
                <p className="text-text-tertiary typo-footnote">
                  {categoryNote[category]}
                </p>
              </div>
            </Cell>
          ))}
        </div>
        <Callout tone={CalloutTone.Good} title="Why Crown, Surprise and Community anchor, and Stat does not">
          <p>
            Berger&apos;s work on why things get shared puts social currency
            first: 68% of people say they share specifically to show others who
            they are. Crown and Community carry that. Surprise carries the
            emotional arousal that converts a look into a screenshot. Stat-tier
            candidates are not cards at all: a bare total is the least shared
            thing in the set, and the Log's four stat cards produced zero
            shares.
          </p>
          <p>
            Accomplishment is also the strongest documented driver in
            gamification — leaderboard standing produced a 92% participation lift
            in one study. daily.dev already hands out Top Reader badges,
            achievements, quest rotations and leaderboard positions that almost
            nobody sees. The recap is where they finally get a stage.
          </p>
        </Callout>
      </Section>

      <Section
        title="What our own users did with the annual Log"
        description="Spec v3 grounded everything in a card-level funnel of the Log, 17 December to 10 February. Four findings each changed a decision on this page."
      >
        <Table
          head={['Measure', 'Value']}
          minWidth={40}
          rows={[
            ['Opened the recap', '26,530'],
            [
              <strong className="text-text-primary">
                Never swiped past the welcome card
              </strong>,
              <strong className="text-accent-ketchup-default">8,656 — 32.7%</strong>,
            ],
            ['Reached the final card', '14,843 (55.9% of openers)'],
            ['Shared', '2,134'],
            [
              <strong className="text-text-primary">Share rate, of openers</strong>,
              <strong className="text-text-primary">8.0%</strong>,
            ],
            ['Share rate, of those who reached the share card', '14.4%'],
            ['Median time from open to share', '107 seconds'],
            [
              'Log openers who also shared a post',
              '4.4%, against a 0.66% baseline. 7x more share-prone.',
            ],
            [
              <strong className="text-text-primary">
                Sharers with no other share event of any kind
              </strong>,
              <strong className="text-accent-avocado-default">86%</strong>,
            ],
          ]}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="A. The opener was the leak">
            <p>
              A third of the audience left on the welcome card. After that,
              attrition was flat at 2 to 4 points per card and 83% of card
              viewers reached the end. Deck length was never the problem.
            </p>
            <p>
              The opener this page used to recommend — totals as tiles, the
              information gap — is structurally the card that lost 33%. It is
              cut. Card one is a payload card with a real claim.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="B. Only the identity label travelled">
            <p>
              The share payload was the archetype, and shares fired only from the
              card that followed it. The four stat cards each retained 97 to 98%
              of viewers and produced no shares. They had no share button, so
              that is not proof they are unshareable, but there is no evidence
              they are.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="C. Half the share loss was positional">
            <p>
              44% of openers never reached the only share button. Per-card share
              buttons are worth roughly as much as any content change in this
              document, and the strongest card now sits early rather than last.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="D. We cannot tell which label was most shareable">
            <p>
              The view event logged the card name but not the label. 89% of
              shares were STREAK_WARRIOR or SCHOLAR, with no base rate to compare
              against. Replay logs the label and the standing value on the view
              event, so we learn within a month.
            </p>
          </Callout>
        </div>
        <Callout tone={CalloutTone.Good} title="The single best argument for building this at all">
          <p>
            86% of the Log&apos;s 2,134 sharers had no other share event of any
            kind in the window. It converted non-sharers. Replay is a net-new
            sharing surface, not cannibalised post-sharing.
          </p>
        </Callout>
      </Section>

      <Section
        title="The shareability rubric"
        description="Ranked by evidence strength, strongest first. Every card in the catalog is now tiered S to Cut against this."
      >
        <Table
          head={['#', 'Driver', 'Evidence']}
          minWidth={52}
          rows={[
            ['1', <strong className="text-text-primary">Identity label</strong>, 'The only content that travelled in the Log. Duolingo’s personas lifted share rate.'],
            ['2', <strong className="text-text-primary">Standing against others</strong>, 'Strava’s percentile card is the most shared in the category. Untested for us; this is the bet.'],
            ['3', <strong className="text-text-primary">Rarity</strong>, 'Scarcity makes a screenshot worth posting. Achievement.rarity already exists across all 76 achievements, range 0.004% to 29.7%.'],
            ['4', <strong className="text-text-primary">Consent to brag</strong>, 'A number you claim is a boast; one the product hands you is a fact.'],
            ['5', <strong className="text-text-primary">Another person in it</strong>, 'Turns reach into a loop. Needs the connection graph. Deferred.'],
            ['6', <strong className="text-text-primary">Generative distinctiveness</strong>, 'The artifact looks good even when the number is ordinary.'],
          ]}
        />
        <Callout tone={CalloutTone.Bad} title="Anti-signals">
          <p>
            A bare total with no comparison. Any framing that implies laziness or
            failure: a bookmark backlog is a confession, not a flex. A denominator
            small enough to be mocked in public. Anything a competitor could print
            next month.
          </p>
        </Callout>
      </Section>

      <Section
        title="Comparison types and honesty gates"
        description="Standing is the bet, and every standing line needs a denominator nobody can mock."
      >
        <Table
          head={['Type', 'Reads as', 'Denominator', 'Availability']}
          minWidth={60}
          rows={[
            [<Mono>C1 self vs past</Mono>, '"Double last week."', 'Their own prior windows', '80% of actives were active last week'],
            [<Mono>C2 self vs all</Mono>, '"More than 88% of developers."', '83,853 weekly actives', 'Always'],
            [<Mono>C3 self vs peers</Mono>, '"Top 4% of Kubernetes readers."', 'Tag readers or cohort', 'Strongest; needs gates'],
            [<Mono>C4 self vs named</Mono>, '"Third in your squad."', 'Squad, follow graph', 'Does not exist. Deferred.'],
          ]}
        />
        <Table
          head={['Gate', 'Rule']}
          minWidth={48}
          rows={[
            [<Mono>G1</Mono>, 'C3 needs at least 1,000 in the comparison set.'],
            [<Mono>G2</Mono>, 'Only claim "top X%" above p75. "Top 46%" is an insult.'],
            [<Mono>G3</Mono>, 'No percentiles where the set’s median is 1: upvotes, bookmarks, comments, shares, follows, awards, posts created.'],
            [<Mono>G4</Mono>, 'Tag cards need at least 1,000 weekly click readers. 109 tags qualify. Never impression readers; that ranks people by scroll depth.'],
            [<Mono>G5</Mono>, 'Registered only, dedupe aliases, exclude vordr, cap at p99.'],
          ]}
        />
      </Section>

      <Section
        title="Deck composition, from the data"
        description="Four to six cards. Attrition is flat, so length is cheap; variety is what runs out."
      >
        <Table
          head={['Rule', 'Why']}
          minWidth={52}
          rows={[
            [<strong className="text-text-primary">Card one is a Tier S payload card</strong>, 'No welcome, no totals. The welcome card was the measured 33% leak.'],
            [<strong className="text-text-primary">Hero early, not last</strong>, 'Attrition after card one is 2 to 4 points per card, so position two costs ~10 points of reach and gains the 44% who never finished.'],
            [<strong className="text-text-primary">At least two staple slots</strong>, 'So a deck never depends on a rare card firing.'],
            [<strong className="text-text-primary">Family cap of one</strong>, 'Variety is what runs out. Novelty decay of 0.15 for a variant shown last week.'],
            [<strong className="text-text-primary">Rare cards promote into the Tier S slot</strong>, 'A perfect week fires for 0.9%. When it does, it leads.'],
            [<strong className="text-text-primary">At least six live variants per staple family</strong>, 'Or week four is week one with new numbers.'],
            [<strong className="text-text-primary">Handoff closes</strong>, 'The one card that asks for something.'],
          ]}
        />
        <Table
          head={['Eligibility', 'Share of weekly actives', 'Deck']}
          minWidth={48}
          rows={[
            [<Mono>≥5 opens</Mono>, '22.9%', 'Full deck, up to five'],
            [<Mono>1–4 opens</Mono>, '~24%', 'Reduced deck, up to three'],
            [<Mono>impressions only</Mono>, '~43%', <strong className="text-accent-ketchup-default">No Replay. Nothing about them to say.</strong>],
            [<Mono>no activity</Mono>, '—', <strong className="text-accent-ketchup-default">No Replay at all</strong>],
          ]}
        />
        <Callout tone={CalloutTone.Bad} title="This reverses two earlier calls on purpose">
          <p>
            &quot;Always render&quot; is gone: an empty recap is worse than none,
            and the addressable audience is the 47% who open a post, not the
            83,853. And the peak-end ordering is gone: with a share button on
            every card, the strongest card sits where people will see it.
          </p>
        </Callout>
      </Section>

      <Section
        title="What you missed is out of scope"
        description="These three were the strongest re-engagement frames in the catalog, and they are cut anyway: they point at content, not at the person. The digest, the feed and the briefing own that job. Kept here so nobody re-proposes them."
      >
        <Table
          head={['Frame', 'What it says', 'Why it works']}
          minWidth={58}
          rows={[
            [
              <Mono>missed.comment</Mono>,
              'The best comment on a post you read, posted four hours after you left. It outscored the post.',
              'An information gap about something that already happened to them. It is also the only frame that sends someone back to a specific thread rather than to a feed.',
            ],
            [
              <Mono>missed.story</Mono>,
              '94% of Kubernetes readers opened this. You are in the 6% who did not.',
              'Loss framing plus a comparison, which is a stronger motivator than the equivalent gain. It doubles as a genuine recommendation.',
            ],
            [
              <Mono>missed.reply</Mono>,
              'Two people you follow replied to your post. You never came back.',
              'The Zeigarnik effect: unfinished things sit in the mind in a way completed ones do not. An unanswered reply is a loop the person will want to close.',
            ],
          ]}
        />
        <Callout title="These need the API, and they are worth it">
          <p>
            All three depend on data daily-api does not expose yet. They are the
            strongest argument in the whole spec for doing that work, because
            they are the only frames that are useful rather than flattering, and
            usefulness is what survives week four.
          </p>
        </Callout>
      </Section>

      <Section
        title="Not what we can show. What only we can show."
        description="The sharpest question anyone has asked about this catalog, and it reframes what should get built first."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Bad} title="Commodity">
            <p>
              A streak is a commodity: every app has one. Views are a commodity:
              every platform counts them. Levels, XP, quests, achievements,
              posts read — all of it could be cloned by a competitor in a
              fortnight, and none of it would make a stranger curious about
              daily.dev specifically.
            </p>
            <p>
              They still earn seats. They are the cards people are proud of. But
              a recap made only of them differentiates nothing.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Ours">
            <p>
              Company-level readership. Who reads whom. What your readers went
              on to read. The comment layer sitting on top of everyone
              else&apos;s posts. Where you rank inside a topic across every
              source at once.
            </p>
            <p>
              All of it needs a graph that spans every source and every
              developer, and that graph <em>is</em> the product. Nobody else can
              hand a developer these.
            </p>
          </Callout>
        </div>
        <Callout title="Where that leaves us">
          <p>
            The card gallery splits the whole catalog on this axis. The read is
            uncomfortable: almost everything shippable today is commodity, and
            most of the differentiated half is blocked on API work.
          </p>
          <p>
            That is the strongest argument in this document for doing the API
            work, and it is a better one than any individual frame.
          </p>
        </Callout>
      </Section>

      <Section
        title="Anatomy of a frame"
        description="Six parts, every time. A frame with only a headline on it is a tweet someone could have typed themselves, and nobody posts one of those."
      >
        <Table
          head={['Part', 'What it does', 'Rule']}
          minWidth={54}
          rows={[
            [
              <span className="font-bold text-text-primary">Eyebrow</span>,
              'Names what kind of moment this is before they read anything else.',
              'Two or three words. Never the feature name.',
            ],
            [
              <span className="font-bold text-text-primary">Hero</span>,
              'The number, the badge, the podium, the skyline. Whatever carries the claim at a glance.',
              'Large enough to survive as a thumbnail with the text unreadable.',
            ],
            [
              <span className="font-bold text-text-primary">The claim</span>,
              'One sentence in their language.',
              'Specific. "63% of your week was Kubernetes", never "great reading week".',
            ],
            [
              <span className="font-bold text-text-primary">Support</span>,
              'Two or three facts that back the claim up and give the eye somewhere to go.',
              'Never more than three. Four is a dashboard.',
            ],
            [
              <span className="font-bold text-accent-cheese-default">Standing</span>,
              'Where this puts them against everybody else. "Top 2% of Kubernetes readers this week."',
              'The part they cannot work out for themselves, and the reason the frame teaches them something.',
            ],
            [
              <span className="font-bold text-text-primary">A face</span>,
              'Theirs in the footer; other people in the frame wherever the data has them.',
              'A stat card is a chart. A stat card with faces on it is a post about people.',
            ],
          ]}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Callout tone={CalloutTone.Good} title="Standing is the whole insight">
            <p>
              Reading your own numbers back to you is a receipt. Being told you
              out-read 98% of everyone on your topic is something you did not
              know and could never find out, and it is the sentence people
              screenshot.
            </p>
            <p>
              Strava and Duolingo both report the percentile card as their
              most-shared. It earns a slot on almost every frame that can carry
              one.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Use the real artwork">
            <p>
              When a frame celebrates a streak, an achievement or a Top Reader
              badge, it shows the actual object from the product: the flame, the
              gold badge plate, the achievement art.
            </p>
            <p>
              A generic glyph next to the word &quot;streak&quot; reads as a
              mock-up. The thing they already earned reads as a trophy.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="Seven mechanics, at least two per frame"
        description="A frame that runs none of these is a statistic, and nobody posts a statistic. A frame that runs more than three is a dashboard."
      >
        <Table
          head={['Mechanic', 'Buys', 'What it does']}
          minWidth={48}
          rows={Object.values(Mechanic).map((mechanic) => [
            <span className="font-bold text-text-primary">{mechanic}</span>,
            <span className={effectClass[mechanicEffect[mechanic]]}>
              {mechanicEffect[mechanic]}
            </span>,
            mechanicNote[mechanic],
          ])}
        />
        <Callout title="Weekly cannot lean on milestone scarcity">
          Time scarcity is the annual recap&apos;s asset. Spending it every week
          is exactly what turns a recap into a report. Weekly leans on surprising
          truth, archetype naming and consent to brag, and it borrows
          accomplishment from rewards the product already gives out.
        </Callout>
      </Section>

      <Section
        title="The loop"
        description="Five steps, once a week, forever."
      >
        <ol className="flex flex-col gap-px overflow-hidden rounded-16 border border-border-subtlest-tertiary">
          {[
            [
              'Monday, in their timezone',
              'The week closes and the recap generates. Generation is push; delivery is pull.',
            ],
            [
              'The feed card',
              'Frame one rendered as a card, after the third post. Its face is a real fact about them, so the card sells itself instead of advertising a feature.',
            ],
            [
              'The story',
              'Full screen, tap through, three to eight frames plus a closer. Resumable if they drop out halfway.',
            ],
            [
              'Per-frame share',
              'Every frame has its own button. A share step at the end only catches people who finished, and asks them to pick a favourite from memory.',
            ],
            [
              'The return, and the reward',
              'The posted frame carries the mark, the week and a per-user short link. Sharing unlocks an achievement, so the loop pays the sharer as well as us.',
            ],
          ].map(([title, body], index) => (
            <li
              key={title}
              className="flex gap-4 bg-surface-float px-5 py-4"
            >
              <span className="font-mono text-accent-cabbage-default typo-footnote">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-bold text-text-primary typo-callout">
                  {title}
                </span>
                <span className="text-text-tertiary typo-footnote">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        title="Benchmarks"
        description="What the category actually does, and the one number that argues with us."
      >
        <Table
          head={['Who', 'Number', 'What it tells us']}
          minWidth={52}
          rows={[
            [
              'Spotify Wrapped 2025',
              <span className="font-bold text-text-primary">500M shares</span>,
              'From 200M engaged users in the first 24 hours. Pure time scarcity.',
            ],
            [
              'Duolingo',
              <span className="font-bold text-text-primary">8 personas</span>,
              'Learner personalities from behaviour were a second share opportunity and significantly lifted share rate. Sharing was rewarded with a themed badge.',
            ],
            [
              'Strava',
              <span className="font-bold text-text-primary">94th percentile</span>,
              'Their most-posted card is a comparison card. Comparison is the strongest single share driver in the category.',
            ],
            [
              'RiseUp',
              <span className="font-bold text-text-primary">WhatsApp</span>,
              'Delivers the personalised snapshot into the channel people already live in, rather than an app tab. Worth copying at P3.',
            ],
            [
              'GitHub Wrapped',
              <span className="font-bold text-text-primary">Third party</span>,
              'Developers build and share their own year-in-code every December. The appetite in our exact audience is proven by people doing it without us.',
            ],
          ]}
        />
      </Section>
    </Page>
  ),
};
