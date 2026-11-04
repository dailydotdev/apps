import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { introQuests, totalRewards } from './data';

const meta: Meta = {
  title: 'Intro Quests/0. Read me first',
  parameters: { layout: 'fullscreen' },
};

export default meta;

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

const Card = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-col gap-1.5 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4">
    <p className="font-bold text-text-primary typo-callout">{title}</p>
    <div className="text-text-secondary typo-footnote">{children}</div>
  </div>
);

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

const problems: { title: string; body: string }[] = [
  {
    title: 'The only action is an unlabeled arrow',
    body: 'Each card has one way in: a 32px tertiary icon next to the title, with its label hidden in a hover tooltip. On touch there is no tooltip at all.',
  },
  {
    title: 'Every action leaves the popup',
    body: 'Notifications go to /settings/notifications, where the toggles do not even count. The card has to carry a hint saying so. Brief goes to a paywall page, profile and API to settings.',
  },
  {
    title: 'Five layers for a yes/no task',
    body: '"STEP 01", title, description, a 0/1 progress bar, "In progress" and two reward chips. A progress bar on a one-shot task only ever reads empty or full.',
  },
  {
    title: 'Done and to-do weigh the same',
    body: 'Claimed cards gray out with a stamp but keep their full height, so the list never gets shorter as you work through it.',
  },
  {
    title: 'No sense of the whole',
    body: `No overall progress and no total. ${totalRewards.xp} XP and ${totalRewards.cores} Cores are on the table and the popup never says so.`,
  },
  {
    title: 'Builder quests sit with everyone else',
    body: 'The two API quests are for a subset of users but look as mandatory as notifications. "Hello, API" cannot start before the key exists, and nothing says that.',
  },
];

const principles: { title: string; body: ReactNode }[] = [
  {
    title: 'Do it here',
    body: (
      <>
        Every item should lead straight to the action, and the best version
        embeds the action in the item itself. (
        <Link href="https://www.appcues.com/blog/user-onboarding-guide">
          Appcues
        </Link>
        ,{' '}
        <Link href="https://www.userflow.com/blog/the-ultimate-product-onboarding-checklist">
          Userflow
        </Link>
        )
      </>
    ),
  },
  {
    title: 'Label the verb',
    body: 'The button says what happens: "Add to Chrome", "Turn on", "Create key". One solid button in view at a time, on the next step. Everything else is secondary.',
  },
  {
    title: 'Never start at zero',
    body: (
      <>
        People given a head start finish more often and faster (Nunes and Drèze,{' '}
        <Link href="https://ideas.repec.org/a/oup/jconrs/v32y2006i4p504-512.html">
          the endowed progress effect
        </Link>
        ). Variation D pre-checks "Joined daily.dev". It has to be credible, so
        one step, not three.
      </>
    ),
  },
  {
    title: 'Ask for push in context',
    body: (
      <>
        The click on "Turn on" is the intent; the native prompt follows it
        immediately. A denial cannot be re-prompted, so the blocked state needs
        recovery steps, not a dead button. (
        <Link href="https://www.braze.com/resources/articles/whats-a-push-primer">
          Braze
        </Link>
        ,{' '}
        <Link href="https://www.dolfy.ai/blog/permission-prompt-problem-push-notification-opt-in-timing">
          Dolfy
        </Link>
        )
      </>
    ),
  },
  {
    title: 'Short, ordered, optional ones labeled',
    body: 'Advice converges on 3 to 7 items, easy and essential first. Six is fine if the two API steps read as optional instead of required.',
  },
  {
    title: 'Calm until it is over',
    body: 'Nothing loops, nothing shakes. Claims get a small check pop; the one real celebration is finishing the set.',
  },
];

const inline: {
  quest: string;
  today: string;
  proposed: string;
  builtOn: string;
}[] = [
  {
    quest: 'Install the extension',
    today: 'Arrow to the store',
    proposed:
      '"Add to Chrome" with the Chrome logo (Edge on Edge). Opens the store in a new tab, the row waits and flips by itself once the install lands.',
    builtOn:
      'getExtensionIntroDestination already picks the store. The backend derives the quest from lastExtensionUse; the popup needs a refetch on window focus.',
  },
  {
    quest: 'Turn on notifications',
    today: 'Arrow to /settings/notifications',
    proposed:
      '"Turn on" raises the browser prompt in place. Blocked shows the three steps to unblock.',
    builtOn:
      'usePushNotificationMutation().onEnablePush, already used by ReadingReminder and StreakReminderSwitch.',
  },
  {
    quest: 'Generate your first brief',
    today: 'Arrow to the /briefing/generate paywall',
    proposed:
      '"Generate for free" runs the generation inline, then offers "Read your brief".',
    builtOn:
      'useGenerateBrief. The first brief is free for everyone (isFirstBrief in BriefPayForGenerateCard), and the quest only shows before it.',
  },
  {
    quest: 'Complete your profile',
    today: 'Arrow to /settings/profile, plus a hint line',
    proposed:
      'The button names the next missing field ("Add headline"). Chips show all five with checks.',
    builtOn:
      'getCompletionItems already has a deep link per field (?field=bio, ?field=experienceLevel).',
  },
  {
    quest: 'Grab your API key',
    today: 'Arrow to /settings/api',
    proposed: '"Create key" creates it inline and shows it once with Copy.',
    builtOn: 'createPersonalAccessToken in graphql/personalAccessTokens.ts.',
  },
  {
    quest: 'Hello, API',
    today: 'Arrow to /settings/api',
    proposed:
      'A copyable curl with the new key in it. "Listening for your first call" until it lands. Locked until the key exists.',
    builtOn:
      'The questUpdate subscription (QuestUpdatesListener) already pushes progress.',
  },
];

const variations: {
  letter: string;
  name: string;
  container: string;
  bet: string;
  risk: string;
}[] = [
  {
    letter: 'A',
    name: 'Action list',
    container: 'Modal, 36rem',
    bet: 'Labeled verbs and folding done rows fix most of it without a new layout.',
    risk: 'Still six rows of equal weight.',
  },
  {
    letter: 'B',
    name: 'Action cards',
    container: 'Wide modal, 46rem',
    bet: 'The giveback board. Payout as the hero makes the trade obvious.',
    risk: 'Largest footprint. Payout first can feel transactional.',
  },
  {
    letter: 'C',
    name: 'One step at a time',
    container: 'Narrow modal, 30rem',
    bet: 'One decision per screen and auto-advance. Highest completion per visit.',
    risk: 'Hides the whole picture. Needs a good skip.',
  },
  {
    letter: 'D',
    name: 'Journey trail',
    container: 'Modal, 32rem',
    bet: 'A path with your face on it, starting one step in. Progress as a story.',
    risk: 'Tall. Leans on the avatar being set.',
  },
  {
    letter: 'E',
    name: 'Header popover, grouped',
    container: 'Popover under the header button',
    bet: 'Setup without a modal. Grouped, accordion, optional API pair.',
    risk: 'Least room for rich inline actions.',
  },
];

export const ReadMeFirst: StoryObj = {
  name: 'Read me first',
  render: () => (
    <div className="min-h-screen bg-background-default px-6 pb-24 pt-10 text-text-primary tablet:px-10">
      <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-14">
        <header className="flex flex-col gap-3">
          <p className="font-bold text-text-tertiary typo-footnote">
            Intro quests · popup redesign
          </p>
          <h1 className="max-w-[48rem] font-bold typo-title1">
            Six quests stand between a new user and a daily.dev that works.
            Today the popup sends them somewhere else to do every one of them.
          </h1>
          <p className="max-w-[44rem] text-text-secondary typo-body">
            Goal: more new users finish the intro quests, and they finish them
            inside the popup. The metric is the share of new users who complete
            the four core quests within 7 days, with push opt-in rate and time
            to first claim alongside it. The five variations below all do the
            actions in place; they differ in how much room they take and how
            they pace you.
          </p>
        </header>

        <Section
          eyebrow="What is wrong today"
          title="Six problems with the current popup"
        >
          <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
            {problems.map((problem, index) => (
              <Card
                key={problem.title}
                title={`${index + 1}. ${problem.title}`}
              >
                {problem.body}
              </Card>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="What the research says"
          title="Six rules every variation follows"
        >
          <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
            {principles.map((principle) => (
              <Card key={principle.title} title={principle.title}>
                {principle.body}
              </Card>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Do it here"
          title="What each quest does inside the popup, and what it is built on"
        >
          <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
            <table className="w-full min-w-[48rem] text-left typo-footnote">
              <thead className="bg-background-subtle text-text-tertiary">
                <tr>
                  <th className="p-3 font-bold">Quest</th>
                  <th className="p-3 font-bold">Today</th>
                  <th className="p-3 font-bold">In the popup</th>
                  <th className="p-3 font-bold">Already exists</th>
                </tr>
              </thead>
              <tbody>
                {inline.map((row) => (
                  <tr
                    key={row.quest}
                    className="border-t border-border-subtlest-tertiary align-top"
                  >
                    <td className="p-3 font-bold text-text-primary">
                      {row.quest}
                    </td>
                    <td className="p-3 text-text-tertiary">{row.today}</td>
                    <td className="p-3 text-text-primary">{row.proposed}</td>
                    <td className="p-3 text-text-secondary">{row.builtOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-text-tertiary typo-footnote">
            Names, descriptions and rewards are the production values from
            daily-api ({introQuests.length} quests, {totalRewards.xp} XP and{' '}
            {totalRewards.cores} Cores in total). The one-line pitches and
            button labels are new copy.
          </p>
        </Section>

        <Section
          eyebrow="The five variations"
          title="Same actions, different pacing"
        >
          <div className="grid gap-3 tablet:grid-cols-2 laptop:grid-cols-3">
            {variations.map((variation) => (
              <Card
                key={variation.letter}
                title={`${variation.letter} · ${variation.name}`}
              >
                <p className="text-text-tertiary">{variation.container}</p>
                <p className="mt-2">{variation.bet}</p>
                <p className="mt-2 text-text-tertiary">
                  Risk: {variation.risk}
                </p>
              </Card>
            ))}
          </div>
          <p className="text-text-tertiary typo-footnote">
            Every variation is clickable. Use the Scenario control to jump to a
            state (blocked notifications, one left, all done) and Reset to start
            over. The browser permission prompt is simulated.
          </p>
        </Section>

        <Section
          eyebrow="Decisions for you"
          title="Three questions before we build"
        >
          <div className="grid gap-3 tablet:grid-cols-3">
            <Card title="Keep the Claim tap?">
              The API needs a claim per quest. We can keep the tap (a small
              moment per step, plus Claim all) or claim automatically on
              completion and celebrate once at the end.
            </Card>
            <Card title="API quests in onboarding?">
              Keep them as an optional group, or move them out to a separate
              builder track so day one is four steps.
            </Card>
            <Card title="The header button">
              Today it expands "Get the most out of daily.dev" and then shakes
              every 5 seconds until clicked. Variation E shows a calmer progress
              ring. Worth deciding with the popup.
            </Card>
          </div>
        </Section>
      </div>
    </div>
  ),
};
