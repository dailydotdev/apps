import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import {
  Callout,
  CalloutTone,
  Cell,
  Mono,
  Page,
  PageHeader,
  Section,
  Table,
} from './shell';
import { byId } from './catalog';
import { FrameStyles, FrameThumb } from './frames';
import { sampleData } from './data';
import { describeStanding, StandingForm } from './standing';
import { archetypes } from './archetypes';
import type { FrameData } from './frames';

const meta: Meta = {
  title: 'Replay/15. The two mechanisms',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Self-insight and standing against other developers: the research, the rules, and how each card applies them. Sources in plans/weekly-recap/research.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const Before = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <span className="text-text-quaternary line-through decoration-text-quaternary/50">
    {children}
  </span>
);
const After = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <span className="font-bold text-text-primary">{children}</span>
);

const STANDING_RULES: [string, string, string, string][] = [
  [
    'Narrowest honest group, named',
    'Top 12% of daily.dev readers',
    'Top 4% of Kubernetes readers this week',
    'Frog pond: best of five beats better than 84% of 1,500 (Alicke, Zell & Bloom 2010). "Large share of a small set" is preferred even when totals match.',
  ],
  [
    'Percentile only in the top tenth',
    'You read more than 58% of developers',
    'You passed 340 developers this week',
    'Duolingo: the top 10% produced over half of all shares; below that the percentile demotivates. Switch the card type, not the number.',
  ],
  [
    '"Top X%", never "more than Y%"',
    'You read more than 96% of Rust readers',
    'Top 4% of Rust readers',
    '"More than 96%" makes the reader do the subtraction and feel the 4% above them. "Top 4%" states membership.',
  ],
  [
    'Never zero, never 100',
    'Top 0% of Go readers',
    '#12 of 41,300 Go readers',
    'Spotify shipped "top 0% of an artist". Floor at 1%, and below that say the rank.',
  ],
  [
    'Rank beats percentile under a thousand',
    'Top 2% of Zig readers',
    '#7 of 412 Zig readers this week',
    'A small pool makes a percentile mockable and a rank impressive. Disclose the pool when it is small.',
  ],
  [
    'Gate the denominator on activity',
    'Top 1% of WebAssembly readers (pool of 60)',
    '1 of 60 developers who read WebAssembly this week',
    'Grammarly\'s 71% is inflated by dormant accounts. Chess.com needs 20 games, WakaTime ten hours. Count this week\'s actives only.',
  ],
  [
    'Precise for comparison, round for growth',
    'Around 300 developers passed',
    'You passed 340 developers · Up 2x on last week',
    'Precise numbers push people to compare with others; round ones push them to compare with their own past (PMC 2021). Use each where it belongs.',
  ],
  [
    'Measure choice, not exposure',
    'You spent more time scrolling than 80% of developers',
    'You read 31 posts across 5 topics. More range than 91% of developers',
    'Monzo\'s "top 15% on Just Eat" went to someone with chronic fatigue. Rank on actions the person chose, never on time-on-feed or inferred traits.',
  ],
  [
    'The card is the third party. No "only", "just", "wow"',
    'Wow, you\'re in the top 5%!',
    'Top 5% of TypeScript readers. Week 37.',
    'Praise from an intermediary lands even when the intermediary is biased (Pfeffer, Fong, Cialdini & Portnoy 2006). A flat issued tone is what makes it sincere.',
  ],
  [
    'Six words explain the denominator',
    'Top 4%',
    'Top 4% of Kubernetes readers · out of 18,204 who read k8s this week',
    'The so-what line is what stops a stranger asking "of what?".',
  ],
  [
    'Obscurity is taste, not deficiency',
    'You read sources 91% of developers ignore',
    'More obscure sources than 91% of developers',
    'The one place "more than Y%" is right: the axis is taste and the reader wants to be on the far end of it.',
  ],
  [
    'The middle gets a median, not a percentile',
    'Top 63% of readers',
    '9 topics this week. Most developers read 3.',
    'Steam Replay compares to the median (28 games vs a median of 4). Nobody posts "top 63%"; everybody posts "three times the median".',
  ],
  [
    'Let the best topic pick the card',
    'One global rank',
    'Top 6% of Postgres readers (for a mid-pack generalist)',
    'Everyone is top-something somewhere. Choose the narrowest group where they clear the top tenth.',
  ],
  [
    'Stable metric, stable string',
    'Alternating "top 4%" and "beats 96%"',
    'The same string, every week',
    'LeetCode\'s "beats X%" flips between runs and developers call it noise. Variance is a credibility problem.',
  ],
  [
    'Newcomers get "since you joined"',
    'Top 71% of readers',
    'Day 6. 14 posts. Most developers hit 14 in week 3.',
    'Duolingo needs 7 days and 20 lessons before a percentile exists. Before that, the comparison is to a typical first week.',
  ],
  [
    'The "everyone posts it" check',
    '"Top 0.5%" for a third of users',
    'If more than ~10% of weekly actives qualify for a headline tier, tighten it or split the denominator',
    'Spotify\'s "top 0.5%" became a meme the moment the timeline filled with it.',
  ],
];

const INSIGHT_RULES: [string, string, string, string][] = [
  [
    'Noun, never adjective',
    'You were very curious this week',
    'Curiosity Engine',
    '"Be a voter" beat "vote" by 11 points (PNAS 2011). Every label that spread (Vampire, Night Owl, Flow Master) is a noun.',
  ],
  [
    'Modifier + domain + role, two to four words',
    'Person who reads infra content late at night',
    'Night Owl Infra Digger',
    'Spotify daylist\'s mood + genre + weekday + time formula. The label has to be sayable.',
  ],
  [
    'Every label ships with the number that earned it',
    'Kubernetes Devotee',
    'Kubernetes Devotee. 63% of your week.',
    'YouTube Recap 2025 was called hollow because the label had no number behind it. Wrapped 2024\'s "Pink Pilates Princess Strut Pop" failed because nobody could reverse-engineer it.',
  ],
  [
    'Share over count',
    'You read 19 Rust posts',
    'Rust was 41% of your week. Up from 6%.',
    'A share carries its own comparison; a count is a receipt.',
  ],
  [
    'Time-stamp when the time is the story',
    'You read a lot at night',
    '1am. Four nights running.',
    'Time-stamping is what made daylist feel personal: 196,000 posts in three hours.',
  ],
  [
    'Name the thing',
    'You went deep on a new topic',
    'First time you have ever opened a WebAssembly post',
    'Specificity is what separates data from Barnum. A statement the person can verify beats one they can only agree with.',
  ],
  [
    'Own baseline before other people',
    'You read more than most people',
    'Your busiest reading week since March',
    'Oura and Strava both weight deviation from your own baseline. Self-verification: the card must first confirm a self the person already holds, then add one surprise.',
  ],
  [
    '"Some say / we call" for the borderline',
    'You skimmed 80% of posts',
    'Some call it skimming. We call it triage. 80% in under 30 seconds.',
    'Spotify\'s Shapeshifter: "Some say it\'s erratic. We call it eclectic." The template for reframing a behaviour that could read as a flaw.',
  ],
  [
    'Low volume is precision',
    'You only read 4 posts',
    'Four posts, all Postgres. You knew what you came for.',
    'The low-data week is the default at weekly cadence. Duolingo\'s Budding Learner and Sniper-type framings exist so nobody gets a weak card.',
  ],
  [
    'Late nights are dedication',
    'You read at 1am, which is unhealthy',
    'Still reading at 1am. The cluster was not going to debug itself.',
    'Reddit\'s "200 hours on r/AmITheAsshole" backfired because it exposed compulsion. Admire, never observe.',
  ],
  [
    'Lapses are comebacks',
    'You skipped three days',
    'Back after three days off. First stop: Terraform.',
    'Duolingo\'s Fiery Phoenix is a lapsed user reframed as a return.',
  ],
  [
    'Mirror verbs, not surveillance verbs',
    'We noticed you read at 1am',
    'You read at 1am',
    'Personalization turns creepy the moment the mechanism shows (Kellogg). "We noticed", "we saw", "based on your activity" are banned.',
  ],
  [
    'Never state the mechanism',
    'Because you clicked 12 Go posts, you are a Go Explorer',
    'Go Explorer. 12 posts in, zero before this week.',
    'The evidence goes next to the label, not as a justification of it.',
  ],
  [
    'Rarity is a stat',
    'You are a Philosopher',
    'Philosopher. 0.1% of readers this week.',
    'Burlington went viral because 0.6% got it. Rarity is the cheapest remarkability there is.',
  ],
  [
    'Concrete over abstract nouns',
    'Knowledge Seeker',
    'Postmortem Collector',
    'Monzo\'s "Baked Bean-filled Hash Brown Era" beats "Grocery Shopper" because it is a picture.',
  ],
  [
    'Present for the label, past for the evidence',
    'You are reading Bun posts early',
    'Early Adopter. You opened the Bun 2.0 post 14 minutes after it landed.',
    'The week is a closed era ("this week you were"), so next week can contradict it without friction.',
  ],
  [
    'Write the shared image for the onlooker',
    'You read at 1am (as the whole card)',
    'Night Owl Infra Digger · 81% after 11pm',
    'A stranger reads the card in a feed. "You read at 1am" accuses the viewer; the noun describes the poster.',
  ],
  [
    'Two signals, one persona',
    'Top tag: Rust. Peak time: 6am.',
    'Dawn Patrol Rustacean. Rust, before 7am, three mornings.',
    'Monzo\'s "moods" combine data points into a starter pack. Isolated stats read as a dashboard.',
  ],
  [
    'Under 25 words a card',
    'A paragraph',
    'Label 4 words or fewer · one figure · subline 14 words or fewer',
    'Cursor\'s card is about twelve tokens of text. YouTube\'s description is one sentence.',
  ],
  [
    'Banned words',
    'only, just, should, try to, unhealthy, addicted, average, below, we noticed',
    'Say the number and stop',
    'Each of these turns praise into a grade.',
  ],
];



const base = sampleData['persona.week'];
const PERSONAS: { id: string; note: string; data: FrameData }[] = [
  { id: 'Night Owl Infra Digger', note: 'Two signals, one persona: hour of day and topic cluster.', data: base },
  {
    id: 'Dawn Patrol Rustacean',
    note: 'Same layout, morning data. Modifier + domain + role.',
    data: {
      ...base,
      headline: 'The Dawn Patrol Rustacean',
      note: 'Three mornings before 7am, and every one of them was Rust.',
      context: [
        { value: '6:20am', label: 'median read' },
        { value: '3', label: 'mornings before 7' },
      ],
      standing: { figure: '4%', label: 'Rarest trait', scope: '4% of developers read before 7am three days running', pin: 4 },
    },
  },
  {
    id: 'Sniper',
    note: 'The low-volume rescue. Two opens, both Postgres, no counts on the card.',
    data: {
      ...base,
      headline: 'The Postgres Sniper',
      note: 'Two reads all week. Both Postgres. You knew what you came for.',
      context: [
        { value: '2 / 2', label: 'on one topic' },
        { value: '0', label: 'wasted opens' },
      ],
      standing: { figure: '9%', label: 'Rarest trait', scope: '9% of developers spend a whole week on one topic', pin: 9 },
    },
  },
  {
    id: 'Comeback Kid',
    note: 'Duolingo\'s Fiery Phoenix. A gap reframed as a return, with a first stop.',
    data: {
      ...base,
      headline: 'The Comeback Kid',
      note: 'Back after eleven days off. First stop: Terraform, then nine more.',
      context: [
        { value: '11 d', label: 'away' },
        { value: '10', label: 'reads since' },
      ],
      standing: { figure: '1 in 5', label: 'Come back at all', scope: 'Most developers who stop for ten days do not return', pin: 80 },
    },
  },
];

const STANDING_SAMPLES = [
  { rank: 412, pool: 18204, group: 'Kubernetes readers' },
  { rank: 7, pool: 412, group: 'Zig readers' },
  { rank: 3, pool: 41300, group: 'Go readers' },
  { rank: 1, pool: 60, group: 'developers who read WebAssembly' },
  { rank: 9800, pool: 18204, group: 'developers', value: 9, unit: 'topics', median: 3 },
  { rank: 9800, pool: 18204, group: 'developers', value: 14, unit: 'posts', median: 16, lastWeek: 6 },
  { rank: 9800, pool: 18204, group: 'developers', value: 3, unit: 'posts', median: 16, lastWeek: 5 },
  { rank: 2, pool: 12, group: 'Gleam readers' },
];

const FORM_LABEL: Record<StandingForm, string> = {
  [StandingForm.Percentile]: 'percentile',
  [StandingForm.Rank]: 'rank',
  [StandingForm.Median]: 'median',
  [StandingForm.Growth]: 'growth vs self',
  [StandingForm.None]: 'no card',
};

const RuleTable = ({ rules }: { rules: [string, string, string, string][] }): React.ReactElement => (
  <Table
    head={['Rule', 'Before', 'After', 'Why']}
    minWidth={72}
    rows={rules.map(([rule, before, after, why]) => [
      <span className="font-bold text-text-primary">{rule}</span>,
      <Before>{before}</Before>,
      <After>{after}</After>,
      <span className="text-text-tertiary">{why}</span>,
    ])}
  />
);

export const TwoMechanisms: Story = {
  name: 'Self-insight and standing',
  render: () => (
    <Page>
      <FrameStyles />
      <PageHeader
        eyebrow="Replay · the playbook"
        title="Two mechanisms. Everything else is somebody else's job."
      >
        <p>
          A Replay card says one of two things: something true about you that
          you did not know, or where you stand among other developers. Content
          nudges are out. What follows is the research behind those two
          mechanisms, distilled into rules, and how each card applies them.
          Full briefings with sources live in{' '}
          <Mono>plans/weekly-recap/research</Mono>.
        </p>
      </PageHeader>

      <Section
        title="Why exactly these two"
        description="Three findings, one from our own Log and two from the products that do this best."
      >
        <div className="grid gap-4 tablet:grid-cols-3">
          <Callout tone={CalloutTone.Good} title="The identity label travelled">
            <p>
              In our annual Log, 26,530 people opened, 8.0% shared, and the
              shares fired only from the card after the archetype. Four stat
              cards retained 97 to 98% of viewers and produced zero shares.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Good} title="Relative rank was Duolingo's most shared stat">
            <p>
              Learners in the top 10% produced more than half of all shares.
              Duolingo added archetypes so everyone else had something to post,
              and share rates rose again. Standing for the top, identity for
              the rest.
            </p>
          </Callout>
          <Callout tone={CalloutTone.Bad} title="Numbers without identity fail">
            <p>
              Wrapped 2024 removed the personality cards and shipped templated
              stats; users called it "obvious". YouTube Recap 2025 shipped
              labels with no numbers behind them and was called hollow. The
              label needs the number, and the number needs the label.
            </p>
          </Callout>
        </div>
      </Section>

      <Section
        title="Mechanism A · standing against other developers"
        description="The strongest single driver, and the one that needs gates. Sixteen rules, each with the line it replaces."
      >
        <RuleTable rules={STANDING_RULES} />
      </Section>

      <Section
        title="The standing engine"
        description="describeStanding() in standing.ts turns a rank and a pool into the one line a card may say, or nothing. Same input, same string, every week."
      >
        <Table
          head={['rank / pool', 'group', 'form', 'figure', 'label', 'scope']}
          minWidth={68}
          rows={STANDING_SAMPLES.map((sample) => {
            const copy = describeStanding(sample);
            return [
              <Mono>{`${sample.rank} / ${sample.pool.toLocaleString('en-US')}`}</Mono>,
              sample.group,
              <span
                className={
                  copy.form === StandingForm.None
                    ? 'text-accent-ketchup-default'
                    : 'font-bold text-text-primary'
                }
              >
                {FORM_LABEL[copy.form]}
              </span>,
              <span className="font-bold text-text-primary">{copy.figure}</span>,
              copy.label,
              <span className="text-text-tertiary">{copy.scope}</span>,
            ];
          })}
        />
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="Gates" note="in order">
            <ul className="flex flex-col gap-1.5 text-text-tertiary typo-footnote">
              <li>Pool under 20 active developers: no claim at all.</li>
              <li>Top ten of any pool: absolute rank, "#3 of 41,300".</li>
              <li>Pool under 1,000: absolute rank, never a percentile.</li>
              <li>Top tenth of a pool of 1,000 or more: "Top N%", N never below 1.</li>
              <li>Everyone else: median comparison if above the median, growth against last week if not, otherwise no comparison card. The archetype card carries them.</li>
            </ul>
          </Cell>
          <Cell label="What this replaces" note="spec v3 G1 to G5">
            <p className="text-text-tertiary typo-footnote">
              The spec's gates (1,000 in the set, above p75, 109 tags qualify)
              stay as the data floor. These rules sit above them and decide
              the sentence. The pool is always this week's actives in the
              group, never all-time members.
            </p>
          </Cell>
        </div>
      </Section>

      <Section
        title="Mechanism B · self-insight"
        description="Something true they did not know. Twenty rules, each with the line it replaces."
      >
        <RuleTable rules={INSIGHT_RULES} />
      </Section>

      <Section
        title="The archetype system"
        description="Twenty-five labels, each with the data rule that earns it. Assign like Monzo: when several match, give the one the fewest developers qualified for this week, and print that rarity on the card."
      >
        <Table
          head={['Label', 'Earns it when', 'Where it lives']}
          minWidth={60}
          rows={archetypes.map(({ label, rule, where }) => [
            <span className="font-bold text-text-primary">{label}</span>,
            rule,
            <span className="text-text-tertiary">{where}</span>,
          ])}
        />
        <div className="grid gap-4 tablet:grid-cols-3">
          <Cell label="Formula">
            <p className="text-text-tertiary typo-footnote">
              [time or intensity modifier] + [domain] + [role noun]. Modifiers:
              Night Owl, Dawn Patrol, Weekend, Deep-Dive, Early, Marathon,
              Sniper. Domains: Infra, Frontend, Rust, AI, Data, Security,
              Postgres. Roles: Digger, Collector, Scout, Devotee, Archivist,
              Triager, Cartographer, Completionist.
            </p>
          </Cell>
          <Cell label="Voice">
            <p className="text-text-tertiary typo-footnote">
              A sharp friend who has been reading over your shoulder and is
              impressed. Second person on the card. Label in the present,
              evidence in the past, the week as a closed era. Monzo's "kindly
              relative" guardrail by default; a savage mode only ever as an
              opt-in.
            </p>
          </Cell>
          <Cell label="The low-data week">
            <p className="text-text-tertiary typo-footnote">
              Below five reads, drop counts and shares and lead with one
              specific: the first-ever tag, the exact title, the time of the one
              late read. "Quiet week. One read, and it was the Postgres 18
              release notes at 11:40pm. Priorities."
            </p>
          </Cell>
        </div>
      </Section>

      <Section
        title="The same card, four different weeks"
        description="One layout, one system. The label changes with the data, the number that earned it sits next to it, and the rarity is printed. The Sniper is what a two-open week gets instead of an apology."
      >
        <div className="flex flex-wrap gap-6">
          {PERSONAS.map(({ id, note, data }) => (
            <figure key={id} className="flex w-[13.5rem] flex-col gap-2.5">
              <FrameThumb width={216} candidate={byId('persona.week')} data={data} />
              <figcaption className="flex flex-col gap-1">
                <span className="font-bold text-text-primary typo-footnote">{id}</span>
                <span className="text-text-tertiary typo-footnote">{note}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <Section
        title="Card anatomy"
        description="What the case studies agree on for a 9:16 unit that gets screenshotted, and the hierarchy every Replay layout follows."
      >
        <div className="grid gap-4 tablet:grid-cols-2">
          <Cell label="Visual weight, descending">
            <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-text-tertiary typo-footnote">
              <li>Hero: one number, one name, or one avatar cluster. Never two.</li>
              <li>The generative or illustrative field behind it.</li>
              <li>Label: what the hero is, two to six words.</li>
              <li>Context: the comparison or the one-sentence insight.</li>
              <li>Identity strip: avatar and handle, top-left.</li>
              <li>Brand lockup: mark plus wordmark, always the same place.</li>
            </ol>
          </Cell>
          <Cell label="Crops and sizes">
            <ul className="flex flex-col gap-1.5 text-text-tertiary typo-footnote">
              <li>Hero readable at a third of its size: 220 to 320px numerals on a 1080 canvas, nothing under 27px.</li>
              <li>Hero and mark inside the centre 1080 by 1330 block (Stories), hero alone inside the centre 1080 by 540 band (X crops 9:16 to 2:1).</li>
              <li>Developers post to X and LinkedIn more than Stories: export 9:16 and an automatic 4:5 crop of the same composition.</li>
              <li>The exported frame is a screenshot: no chrome, no buttons, no indicators inside it.</li>
            </ul>
          </Cell>
        </div>
        <Table
          head={['Anti-pattern', 'Seen at', 'What we do instead']}
          minWidth={56}
          rows={[
            ['Needs a caption to be understood', 'Every templated recap', 'The scope line names the denominator on the card'],
            ['Three equal boxes of stats', 'Dashboards disguised as cards', 'Two quiet chips under the hero, never a row of three'],
            ['Templated, "obvious" visuals', 'Wrapped 2024', 'One element per card derived from the person\'s own data: grid, skyline, tier art'],
            ['Inflated percentiles', 'Wrapped "top 0.5%"', 'Top tenth only, floor at 1%, the everyone-posts-it check'],
            ['Metrics that invite disputes', 'Wrapped 2024 wrong top five', 'Stable strings, choice-based metrics, this week\'s actives as the pool'],
            ['Too much brand', 'Advertisement-looking cards', 'Mark plus wordmark at 5 to 8% width, same corner, nothing else'],
            ['Too little brand', 'Screenshots with no mark', 'The lockup sits inside the exported frame'],
          ]}
        />
      </Section>

      <Section
        title="Applied to our cards"
        description="The four cards that carry a normal week, and how the rules show up on each."
      >
        <div className="flex flex-wrap gap-6">
          {[
            ['persona.week', 'Noun label, two-signal persona, rarity printed as a stat, no "only".'],
            ['rank.topicReader', 'Narrowest honest group, "Top X%", the scope line names the pool.'],
            ['source.obscurity', 'Obscurity as taste: the one place "more than Y%" is right.'],
            ['reading.grid', 'The generative element: no two grids match, and the insight line replaces a legend.'],
          ].map(([id, note]) => {
            const candidate = byId(id);
            return (
              <figure key={id} className="flex w-[13.5rem] flex-col gap-2.5">
                <FrameThumb width={216} candidate={candidate} data={sampleData[id]} />
                <figcaption className="flex flex-col gap-1">
                  <Mono>{id}</Mono>
                  <span className="text-text-tertiary typo-footnote">{note}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
        <Table
          head={['Change', 'Where', 'Rule']}
          minWidth={56}
          rows={[
            ['"Only 6% of developers read this late" lost its "only"', <Mono>persona.week</Mono>, 'Banned words: "only" turns a rarity into a grade'],
            ['"Only 4% of anyone\'s weeks" became "Four in a hundred weeks look like this"', <Mono>rhythm.perfectWeek</Mono>, 'Same rule; the rewrite is also more concrete'],
            ['Three stat boxes became two quiet chips', 'every card', 'Anti-pattern: three equal boxes; one hero per card'],
            ['Seven content cards cut, impressions-only tier removed', 'catalog, ranking', 'Scope: the card is about the person or it is not a Replay card'],
            ['Standing copy generated by one function, wired into the frame renderer', <Mono>standing.ts</Mono>, 'Stable strings, gated percentiles, rank under a thousand. rank.topicReader and crown.topReader render from rank and pool'],
            ['"Kubernetes, almost all of it" became "Kubernetes took 63% of your week." with a 2x-the-typical-developer standing', <Mono>tags.dominant</Mono>, 'Share over count, one sentence like every other headline; the Devotee label lives in the archetype card'],
            ['"You read at 1am. Four nights running." became "1am. Four nights running."', <Mono>rhythm.peak</Mono>, 'Write for the onlooker: the noun describes the poster, "you" accuses the viewer'],
            ['"More ruthless than 88% of developers" (Top 12%) became "1,412 came past. You opened 47." with a median standing', <Mono>selectivity</Mono>, 'Percentile only in the top tenth; the middle gets a median'],
            ['Every frame exports at 4:5 as well as 9:16', <Mono>07. Sharing</Mono>, 'X and LinkedIn crop 9:16 hard; one layout, two exports'],
            ['The archetype system is data, with four persona variants rendered', <Mono>archetypes.ts</Mono>, 'Noun labels, rarity assignment, the Sniper for the two-open week'],
            ['Content on a card is evidence, not a suggestion: four cut cards came back reframed', <Mono>trend.early · trend.ahead · creator.alsoRead · creator.unreadThread</Mono>, '"Early to two of the three biggest stories", "you were already there", "your readers are 3x more likely to read Rust", "23 comments, 96% of posts get none"'],
            ['Three coverage cards added', <Mono>topic.coverage · feed.verdicts · reading.time</Mono>, 'Share of a topic you read, share of opens you rated, hours read: all against the median'],
            ['Receipts became comparisons or archetypes', <Mono>xp.earned · reading.volume · reading.source · bookmarks.backlog</Mono>, 'Top 9% of XP earners (Duolingo\'s most shared stat), 8x the median, Source Loyalist, Silent Archivist'],
            ['Squad and circle cards re-filed as needs-API, not cut', <Mono>community.squad · community.circle · annual.devCircle</Mono>, 'Squads exist; authors-you-read comes from read history, not the follow graph'],
            ['Losses became standings; the handoff points at next Monday and the share sheet, not the briefing', <Mono>away.streakLost · streak.saved · creator.firstReader · handoff</Mono>, 'Lapses are comebacks; the closer must not be a read-more nudge'],
          ]}
        />
      </Section>
    </Page>
  ),
};
