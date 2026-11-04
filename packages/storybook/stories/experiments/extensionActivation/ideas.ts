export type Effort = 'Small' | 'Medium' | 'Large';

export interface Idea {
  id: number;
  title: string;
  what: string;
  why: string;
  metric: string;
  effort: Effort;
  risk: string;
  /** Story export name, when the idea has something to look at. */
  story?: string;
  isPick?: boolean;
}

export interface IdeaStage {
  title: string;
  note: string;
  ideas: Idea[];
}

// Numbers come from Smith (BigQuery analytics.events), September 2026 store
// installers unless a line says otherwise. They are associations, not causes.
export const stages: IdeaStage[] = [
  {
    title: 'Before Chrome asks (/activate)',
    note: 'Everyone who lands on the page sees this. 70% of new store installers leave it without clicking.',
    ideas: [
      {
        id: 1,
        title: 'Clear stakes',
        what: 'Say what Chrome will ask, which button to press, and what each button does. A static picture of the real prompt replaces the video.',
        why: 'Today nothing explains the choice, and the demo shows "Change it back" as the strong button. In Chromium that button turns the whole extension off.',
        metric: 'Kept rate (2 days), then week-2 and week-5 use',
        effort: 'Small',
        risk: 'Naming the prompt could make some people more cautious.',
        story: 'clear-stakes',
        isPick: true,
      },
      {
        id: 2,
        title: 'Value and coach, side by side',
        what: 'Three reasons to keep it on the left, the coached prompt on the right, with the button above the fold.',
        why: 'People are asked to keep something they have not seen yet. This gives them a reason without a long page.',
        metric: 'Kept rate, primer click rate',
        effort: 'Small',
        risk: 'More to read before the button.',
        story: 'value-and-coach',
      },
      {
        id: 3,
        title: 'Carousel before the choice',
        what: 'The onboarding carousel moves in front of the prompt, with copy for someone who already installed.',
        why: 'The same idea as the dropped test, at the moment it can still change the decision. It reaches everyone instead of about 18% of store installers.',
        metric: 'Kept rate, primer click rate',
        effort: 'Medium',
        risk: 'The heaviest option. It delays the click, and the click is already low.',
        story: 'carousel-first',
      },
      {
        id: 4,
        title: 'Fold fix and a clearer button',
        what: "Today's page with a smaller video so the button always fits, and a label that says what happens next.",
        why: 'At 1280×720 the button sits at 659–715px with its note cut off, and a real browser toolbar pushes it lower. It is a cheap fix even if nothing else ships.',
        metric: 'Primer click rate',
        effort: 'Small',
        risk: 'Very low.',
        story: 'fold-fix',
      },
      {
        id: 5,
        title: 'Right words for each person',
        what: 'Returning members get "Welcome back", people mid-signup get "One last step", and Edge and Opera stop hearing about Chrome.',
        why: 'Everyone gets "Welcome!" today. Reinstalling members are about 19% of viewers, and Edge and Opera about 7%.',
        metric: 'Click rate by group',
        effort: 'Small',
        risk: 'Low, but the upside is small: these groups already click 50–80%.',
        story: 'words-by-audience',
      },
    ],
  },
  {
    title: 'While Chrome asks',
    note: 'The one moment that reaches clickers and non-clickers alike.',
    ideas: [
      {
        id: 6,
        title: 'Coach behind the prompt',
        what: "On the first new tab only, the page behind Chrome's prompt shows the feed and one line: press Keep it and this is on every new tab.",
        why: 'Most non-clickers open a new tab soon after anyway and meet the prompt with no help. This is the only idea that reaches them at the decision itself.',
        metric: 'Kept rate for non-clickers and clickers',
        effort: 'Medium',
        risk: 'Not tested yet: we must confirm in real Chrome that the page is visible behind the prompt.',
        story: 'behind-the-prompt',
        isPick: true,
      },
    ],
  },
  {
    title: 'Right after the choice',
    note: 'Signed-out clickers: about 91% get two onboarding pages within two minutes.',
    ideas: [
      {
        id: 7,
        title: 'Show the feed, not a signup page',
        what: 'The new tab stays on the feed with the sign-up strip. Only one tab goes to onboarding.',
        why: 'People press Keep it and the tab they kept turns into a signup page. Signed-out clickers uninstall far more within an hour (15.9% vs 3.8%), and non-signers still reach 33% in week 2.',
        metric: '1-hour uninstalls, kept rate, week-2 use. Guardrail: signups',
        effort: 'Medium',
        risk: 'Fewer signups: 41% of signed-out clickers sign up today, helped by that redirect.',
        story: 'after-the-click',
        isPick: true,
      },
      {
        id: 8,
        title: 'Say welcome on the second new tab',
        what: 'A small one-time note on the second new tab: your feed is here, and you can pause it anytime.',
        why: 'A second new tab is the best sign someone kept it. It celebrates without adding a screen before they have chosen.',
        metric: 'Week-1 sessions, week-2 use',
        effort: 'Small',
        risk: 'Added first-run steps have lost before (post_signup_activation), so keep it tiny.',
      },
    ],
  },
  {
    title: 'People who never open a new tab',
    note: '21% of store installers open none in the first 48 hours.',
    ideas: [
      {
        id: 9,
        title: 'One reminder at the next browser start',
        what: 'If no new tab was seen, reopen /activate once on the next browser start.',
        why: 'These people are invisible today. Chromium also shows a dismissed prompt again on the next run, so this is a natural second chance.',
        metric: 'Share with zero new tabs, kept rate',
        effort: 'Medium',
        risk: 'An unexpected tab can feel pushy and trigger uninstalls.',
      },
      {
        id: 10,
        title: 'Open the new tab automatically',
        what: 'Open the tab for people who do not click within about 10 seconds. Smith proposed this one.',
        why: 'It guarantees that people reach the prompt.',
        metric: 'Kept rate, 1-hour uninstalls',
        effort: 'Small',
        risk: 'The prompt appears with no warning. I would try idea 6 first.',
      },
    ],
  },
  {
    title: 'Signing up',
    note: '22% of new store installers sign up within 7 days. Those who do match onboarding installers on retention.',
    ideas: [
      {
        id: 11,
        title: 'Ask after they have used it',
        what: 'Hold back the sign-up strip for the first few new tabs.',
        why: 'People see value before the ask. Non-signers already keep using the extension, so the habit does not depend on an account.',
        metric: 'Week-2 use. Guardrail: signups in 7 and 30 days',
        effort: 'Small',
        risk: 'Later signup may mean fewer signups overall.',
      },
      {
        id: 12,
        title: 'Strip copy for new people',
        what: 'New installers get a sign-up message and button instead of "Log in to pick up where you left off".',
        why: 'The big signed-out strip offers only "Log in to continue", yet most people seeing it are brand new.',
        metric: 'Strip click rate, signups',
        effort: 'Small',
        risk: 'Low. The last strip test added only 3.8% to logins and signups (hijacking_variants4), and that was not conclusive.',
        story: 'after-the-click',
      },
      {
        id: 13,
        title: 'Pick topics without an account',
        what: 'Let signed-out people choose a few topics on the new tab, then ask them to save with an account.',
        why: 'A better feed gives a reason to sign up. I have not checked whether signed-out feeds can support it.',
        metric: 'Posts read in week 1, signups',
        effort: 'Large',
        risk: 'Needs feed work, and the size of the win is unknown.',
      },
    ],
  },
  {
    title: 'Kept it, then faded',
    note: '39% of store installers with 10+ new tabs have stopped by week 2.',
    ideas: [
      {
        id: 14,
        title: 'Find the first-week action that predicts staying',
        what: 'Ask which first-week actions separate the 61% who stay from the 39% who fade, then design around the strongest one.',
        why: 'We know store installers read less (61% vs 74% read a post in week 1), but not whether reading is what keeps them.',
        metric: 'A ranked list of actions',
        effort: 'Small',
        risk: 'Only a correlation, so it needs a test afterwards.',
      },
      {
        id: 15,
        title: 'A second reason to stay: the companion',
        what: 'Rework how people meet the companion in their first week.',
        why: '37.6% of primer viewers see the permission prompt and only 0.74% open it. Grants are not tracked, so we cannot size this yet.',
        metric: 'Permission grants, week-5 use',
        effort: 'Medium',
        risk: 'The permission asks for access to all sites.',
      },
    ],
  },
  {
    title: 'Winning people back',
    note: '"Change it back" turns the extension off, and today we never find out.',
    ideas: [
      {
        id: 16,
        title: 'Banner when the extension is off',
        what: 'If a signed-in member once used the extension and it is not detected on the web app, show how to turn it back on.',
        why: 'The web app can already detect the extension, so this is the one way to reach someone who pressed "Change it back".',
        metric: 'Reactivations, week-5 use',
        effort: 'Medium',
        risk: 'Only reaches people with an account who return. It also fires for someone on a different browser.',
        story: 'win-back',
      },
      {
        id: 17,
        title: 'Email when the extension goes quiet',
        what: 'Email signed-up users whose extension stops reporting.',
        why: 'Reaches people who never come back to the web app. It needs idea 20 first.',
        metric: 'Reactivations',
        effort: 'Medium',
        risk: 'Digest emails are sensitive, so the frequency needs care.',
      },
      {
        id: 18,
        title: 'Read the uninstall reasons',
        what: 'The uninstall page already has a Typeform asking why people leave. Read the answers before designing anything else.',
        why: 'It is the only direct voice from people who left, and I have not seen it yet.',
        metric: 'Top reasons, by install path',
        effort: 'Small',
        risk: 'None.',
      },
      {
        id: 19,
        title: 'Set expectations in the Web Store',
        what: 'Say plainly in the listing that daily.dev replaces the new tab and that Chrome will ask to confirm.',
        why: 'Some people may install without knowing the new tab changes. Those who wanted something else leave within minutes.',
        metric: 'Before and after: kept rate, 1-hour uninstalls',
        effort: 'Small',
        risk: 'No clean A/B test, and installs could drop. That is acceptable if the people lost would have left anyway.',
      },
    ],
  },
  {
    title: 'Measuring it properly',
    note: 'Without these, every result above stays a best guess.',
    ideas: [
      {
        id: 20,
        title: 'A daily "still enabled" signal',
        what: 'The extension reports once a day that it is on, so "Change it back" shows up as the signal stopping.',
        why: 'No event records the choice, and the 10+ new tabs stand-in misses 27% of store users still active in week 2.',
        metric: 'A real kept rate',
        effort: 'Small',
        risk: 'I have not checked how to build it, and it needs an extension release.',
        isPick: true,
      },
      {
        id: 21,
        title: 'Fix the spam filter',
        what: 'Stop classing /activate as a profile page, and stop flagging normal new-tab readers.',
        why: 'It flags 43% of new store installers, and they retain best. Any metric using it understates this group.',
        metric: 'Trustworthy store numbers',
        effort: 'Small',
        risk: 'Other reports will shift when the filter changes.',
      },
      {
        id: 22,
        title: 'Log the install itself',
        what: 'Add an install event with its source, plus events for the permission prompt and grants.',
        why: 'There is no install event, no store attribution, and about 40% of installs log no primer view with no way to say why.',
        metric: 'Clean cohorts',
        effort: 'Small',
        risk: 'Very low.',
      },
    ],
  },
];

export const notWorthIt: { title: string; why: string }[] = [
  {
    title: 'Carousel at the end of onboarding',
    why: 'It reaches about 18% of store installers, most of them already see it, and it comes after the choice.',
  },
  {
    title: 'More shortcut features',
    why: 'onboarding_most_visited raised shortcut clicks 382% with flat retention, and shortcuts_hub was flat too.',
  },
  {
    title: 'More first-run screens after signup',
    why: 'post_signup_activation and extension_newtab_customizer both lost.',
  },
  {
    title: 'Hiding or disguising "Change it back"',
    why: 'We cannot change Chrome\'s prompt, and misleading people would come back as uninstalls and bad reviews. Every idea here tells the truth about both buttons.',
  },
];
