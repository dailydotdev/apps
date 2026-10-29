import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Intro Quests/4. Round two research',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Link = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}): ReactElement => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="text-text-link hover:underline"
  >
    {children}
  </a>
);

const Section = ({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <p className="font-bold text-text-tertiary typo-footnote">{eyebrow}</p>
      <h2 className="font-bold text-text-primary typo-title3">{title}</h2>
    </div>
    {children}
  </section>
);

const Stat = ({
  value,
  label,
  source,
}: {
  value: string;
  label: string;
  source: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <p className="font-bold text-text-primary typo-title1">{value}</p>
    <p className="text-text-secondary typo-footnote">{label}</p>
    <p className="mt-auto pt-2 text-text-quaternary typo-caption1">{source}</p>
  </div>
);

const insights: {
  title: string;
  body: string;
  source: ReactNode;
  concepts: string;
}[] = [
  {
    title: 'Head starts work, if they are honest',
    body: 'A card with two free stamps out of twelve fills faster than an empty card of ten. Count the steps people really did at signup.',
    source: (
      <>
        <Link href="https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal">
          Kivetz et al. 2006
        </Link>
        ,{' '}
        <Link href="https://ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html">
          Nunes and Drèze 2006
        </Link>
      </>
    ),
    concepts: '1, 2, 7',
  },
  {
    title: 'People speed up near the finish',
    body: 'Effort scales with the share of the distance left. Say "2 stamps to go", not "4 of 6 done".',
    source: (
      <Link href="https://business.columbia.edu/sites/default/files-efs/pubfiles/1200/goalgradient.pdf">
        The goal-gradient hypothesis
      </Link>
    ),
    concepts: '1, 3',
  },
  {
    title: 'Short lists, chained',
    body: 'Splitting one long list into short lists that unlock each other took completion from 2% to 25% in one Appcues case. Completion drops past five items.',
    source: (
      <Link href="https://goodux.appcues.com/behind-the-experience/appcues-bite-sized-checklists">
        Appcues, bite-sized checklists
      </Link>
    ),
    concepts: '3, 6',
  },
  {
    title: 'One next action, the list behind it',
    body: 'Decision time grows with the number of choices. Lead with one prominent step and keep the full list as secondary progress.',
    source: <Link href="https://lawsofux.com/hicks-law/">Hick’s law</Link>,
    concepts: '2, 8, 9',
  },
  {
    title: 'Show the result before the work',
    body: 'Shopify’s setup guide gives every step an illustration. Empty states that show what it looks like with data pull harder than a description.',
    source: (
      <Link href="https://shopify.dev/docs/api/app-home/patterns/compositions/setup-guide">
        Shopify setup guide pattern
      </Link>
    ),
    concepts: '4, 9, 10',
  },
  {
    title: 'Detect, do not ask',
    body: 'Good setup guides mark steps done on their own. Nobody should come back to a popup to tick a box for something they already did.',
    source: (
      <Link href="https://shopify.dev/docs/apps/design/user-experience/onboarding">
        Shopify app onboarding guidelines
      </Link>
    ),
    concepts: 'All',
  },
  {
    title: 'Learn by doing, in conversation',
    body: 'Slackbot teaches messaging by having you send a message. The action belongs inside the conversation, not behind a link.',
    source: (
      <Link href="https://www.appcues.com/blog/user-onboarding-examples">
        Appcues onboarding examples
      </Link>
    ),
    concepts: '5, 7',
  },
  {
    title: 'Defer, never dead end, never nag',
    body: 'Apple keeps skipped setup steps at the top of Settings with "Set up later". Users accept it until it feels aggressive. Make later easy and quiet.',
    source: (
      <Link href="https://www.idownloadblog.com/2018/02/05/how-to-remove-ios-finish-setting-up-prompt/">
        iOS "Finish setting up"
      </Link>
    ),
    concepts: '5, 8, 9',
  },
  {
    title: 'Speak the user’s language',
    body: 'Developer onboarding is judged by time to the first working call. PR checks and install scripts are progress UI every developer already reads fluently.',
    source: (
      <Link href="https://userpilot.com/blog/onboarding-ux-patterns">
        Userpilot onboarding patterns
      </Link>
    ),
    concepts: '6, 7',
  },
  {
    title: 'Progress you can see is progress you finish',
    body: 'Visual checklists and progress indicators show up again and again in activation case studies. The numbers are vendor reported, but the direction is consistent.',
    source: (
      <Link href="https://userpilot.com/blog/user-onboarding-gamification/">
        Userpilot gamification cases
      </Link>
    ),
    concepts: '1, 2, 10',
  },
];

const rejected: { name: string; why: string }[] = [
  {
    name: 'Trophy case',
    why: 'Achievement studies are correlational, and Game Center already does badges. Collecting fits month three, not day one.',
  },
  {
    name: 'Activity rings',
    why: 'Three rings for six yes/no tasks is decoration. A ring is for something you repeat daily.',
  },
  {
    name: 'Command palette',
    why: 'New users do not know ⌘K yet. Teaching a shortcut on day one adds a step in front of every step.',
  },
  {
    name: 'One quest a day',
    why: 'A drip would slow activation to a week. Worth an experiment later, not a default.',
  },
];

const concepts: {
  name: string;
  lever: string;
  container: string;
  risk: string;
}[] = [
  {
    name: '1 · Stamp card',
    lever: 'Honest head start + goal gradient',
    container: 'Modal',
    risk: 'Slots are small; needs the detail panel to work',
  },
  {
    name: '2 · Setup strength',
    lever: 'A level instead of a list',
    container: 'Modal',
    risk: 'Percentages are invented weights',
  },
  {
    name: '3 · Two chapters',
    lever: 'Short, chained lists',
    container: 'Modal',
    risk: 'API quests get less exposure',
  },
  {
    name: '4 · Show, then do',
    lever: 'See the result first',
    container: 'Wide modal',
    risk: 'Most build work (previews)',
  },
  {
    name: '5 · Patchy chat',
    lever: 'Learn by doing, warm voice',
    container: 'Tall modal',
    risk: 'Slower for people who want to scan',
  },
  {
    name: '6 · Merge your setup',
    lever: 'Developer-native progress',
    container: 'Modal',
    risk: 'In-joke may miss non-engineers',
  },
  {
    name: '7 · npx daily init',
    lever: 'One question at a time, dev voice',
    container: 'Terminal modal',
    risk: 'Monospace walls for long copy',
  },
  {
    name: '8 · Floating dock',
    lever: 'Never blocks the feed',
    container: 'Corner launcher',
    risk: 'Easy to ignore',
  },
  {
    name: '9 · The deck',
    lever: 'One decision on top',
    container: 'Modal / phone sheet',
    risk: 'Hides how many steps there are',
  },
  {
    name: '10 · Assembled',
    lever: 'Progress is the product',
    container: 'Wide modal',
    risk: 'Needs a crisp mini app to land',
  },
];

export const RoundTwoResearch: StoryObj = {
  name: 'Round two research',
  render: () => (
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-14">
        <header className="flex flex-col gap-3">
          <p className="font-bold text-text-tertiary typo-footnote">
            Intro quests · round two
          </p>
          <h1 className="max-w-[50rem] font-bold typo-title1">
            The average onboarding checklist is finished by one user in five.
            Ten concepts built on what the ones that beat it do.
          </h1>
          <p className="max-w-[44rem] text-text-secondary typo-body">
            Every concept in chapter 5 keeps the round one rule: the action
            happens inside the popup. What changes is the mechanism that gets
            people to the end. Each one is tied to a finding below.
          </p>
        </header>

        <Section eyebrow="The baseline" title="Checklists usually lose">
          <div className="grid gap-3 tablet:grid-cols-3">
            <Stat
              value="19%"
              label="Average checklist completion across 188 products. The median is 10%."
              source={
                <Link href="https://userpilot.com/blog/?p=197841">
                  Userpilot 2024 benchmark (vendor data)
                </Link>
              }
            />
            <Stat
              value="2% → 25%"
              label="Completion after splitting one long list into short chained ones."
              source={
                <Link href="https://goodux.appcues.com/behind-the-experience/appcues-bite-sized-checklists">
                  Appcues, single case
                </Link>
              }
            />
            <Stat
              value="3 to 5"
              label="Items before completion drops sharply. We have six."
              source={
                <Link href="https://docs.appcues.com/checklists/checklist-best-practices">
                  Appcues checklist best practices
                </Link>
              }
            />
          </div>
        </Section>

        <Section
          eyebrow="What works"
          title="Ten findings, and where each one went"
        >
          <div className="grid gap-3 tablet:grid-cols-2">
            {insights.map((insight, index) => (
              <div
                key={insight.title}
                className="flex flex-col gap-1.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-bold text-text-primary typo-callout">
                    {index + 1}. {insight.title}
                  </p>
                  <span className="shrink-0 text-text-quaternary typo-caption1">
                    Concepts {insight.concepts}
                  </span>
                </div>
                <p className="text-text-secondary typo-footnote">
                  {insight.body}
                </p>
                <p className="text-text-tertiary typo-caption1">
                  {insight.source}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="The ten concepts" title="One lever each">
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full min-w-[44rem] text-left typo-footnote">
              <thead className="bg-background-subtle text-text-tertiary">
                <tr>
                  <th className="p-3 font-bold">Concept</th>
                  <th className="p-3 font-bold">Lever</th>
                  <th className="p-3 font-bold">Container</th>
                  <th className="p-3 font-bold">Risk</th>
                </tr>
              </thead>
              <tbody>
                {concepts.map((row) => (
                  <tr
                    key={row.name}
                    className="border-t border-border-subtlest-tertiary"
                  >
                    <td className="p-3 font-bold text-text-primary">
                      {row.name}
                    </td>
                    <td className="p-3 text-text-secondary">{row.lever}</td>
                    <td className="p-3 text-text-tertiary">{row.container}</td>
                    <td className="p-3 text-text-tertiary">{row.risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          eyebrow="Considered and dropped"
          title="Four ideas that did not earn a slot"
        >
          <div className="grid gap-3 tablet:grid-cols-2">
            {rejected.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-1 rounded-16 border border-dashed border-border-subtlest-secondary p-4"
              >
                <p className="font-bold text-text-secondary typo-callout">
                  {item.name}
                </p>
                <p className="text-text-tertiary typo-footnote">{item.why}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="If I had to ship one" title="My recommendation">
          <div className="flex flex-col gap-3 rounded-16 border border-border-subtlest-secondary bg-surface-float p-5 text-text-secondary typo-callout">
            <p>
              <span className="font-bold text-text-primary">
                Build concept 3’s structure with concept 4’s pictures.
              </span>{' '}
              Four essentials first, the API pair as an unlockable chapter, and
              a live preview next to the open step. It stacks the two findings
              with the strongest evidence (short chained lists, show the result)
              and it fixes the "are the API quests homework" problem.
            </p>
            <p>
              <span className="font-bold text-text-primary">
                Use concept 8 as its minimized state,
              </span>{' '}
              so closing the popup turns it into a progress pill instead of a
              dead end.
            </p>
            <p>
              <span className="font-bold text-text-primary">
                A/B test concept 6 against it.
              </span>{' '}
              Merge your setup is the boldest developer-native bet and the
              cheapest to build from what already exists.
            </p>
          </div>
        </Section>
      </div>
    </div>
  ),
};
