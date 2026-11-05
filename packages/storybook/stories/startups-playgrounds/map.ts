// The map from the review of apps #7238: every state and flow, pointing at the
// stories that show it. "today" is the merged checkout, "proposed" is the new
// design in Startups Onboarding.

const checkout = 'features-squads-daily-dev-for-startups-checkout--';
const account = 'features-squads-daily-dev-for-startups-states-a-account--';
const remaining = 'startups-playgrounds-today-remaining-states--';
const screens = 'startups-onboarding-2-screens--';
const recoveries = 'startups-onboarding-4-states-and-recoveries--';
const manage = 'startups-onboarding-2b-manage-and-upsell--';

export interface PlaygroundState {
  id: string;
  label: string;
  today?: string;
  proposed?: string;
  note?: string;
}

export interface PlaygroundGroup {
  id: string;
  title: string;
  states: PlaygroundState[];
}

export const groups: PlaygroundGroup[] = [
  {
    id: 'A',
    title: 'A. Account',
    states: [
      {
        id: 'A1',
        label: 'Sign-up options',
        today: `${account}sign-up-options`,
        proposed: `${screens}account`,
      },
      {
        id: 'A1d',
        label: 'Came from the Team plan card',
        today: `${checkout}checkout-sign-up`,
        proposed: `${screens}account-team`,
        note: 'The same screen as Starter. The choice carries through to the Plan step.',
      },
      {
        id: 'A1b',
        label: 'Social sign-up in progress',
        today: `${account}social-in-progress`,
        proposed: `${screens}social-busy`,
      },
      {
        id: 'A1c',
        label: 'Social sign-up failed',
        today: `${account}social-failed`,
        proposed: `${screens}social-failed`,
      },
      {
        id: 'A2',
        label: 'Email form',
        today: `${account}email-form`,
        proposed: `${screens}account-email`,
      },
      {
        id: 'A2c',
        label: 'Missing fields',
        today: `${account}email-missing-fields`,
        proposed: `${screens}account-missing`,
      },
      {
        id: 'A2d',
        label: 'Email form, reached from log-in',
        today: `${account}email-form-from-log-in`,
        proposed: `${screens}account-email`,
      },
      {
        id: 'A2b',
        label: 'Email already has an account',
        today: `${account}email-taken`,
        proposed: `${screens}account-email-taken`,
      },
      {
        id: 'A3',
        label: 'Email code',
        today: `${account}email-code`,
        proposed: `${screens}account-code`,
      },
      {
        id: 'A3b',
        label: 'Wrong code',
        today: `${account}email-code-wrong`,
        proposed: `${screens}account-code-wrong`,
      },
      {
        id: 'A3c',
        label: 'Email code, unverified account logging in',
        today: `${account}email-code-from-log-in`,
        proposed: `${screens}account-code`,
      },
      {
        id: 'A4',
        label: 'Log-in options',
        today: `${account}log-in-options`,
        proposed: `${screens}log-in`,
      },
      {
        id: 'A4b',
        label: 'Log in with email',
        today: `${account}log-in-email`,
        proposed: `${screens}log-in-email`,
      },
      {
        id: 'A4c',
        label: 'Wrong password',
        today: `${account}log-in-wrong-password`,
        proposed: `${screens}log-in-wrong`,
      },
      {
        id: 'A5',
        label: 'Reset password',
        today: `${account}reset-password`,
        proposed: `${screens}reset`,
      },
      {
        id: 'A5b',
        label: 'Reset link sent',
        today: `${account}reset-link-sent`,
        proposed: `${screens}reset-sent`,
      },
    ],
  },
  {
    id: 'B',
    title: 'B. Company page',
    states: [
      {
        id: 'B1',
        label: 'No squads, empty name form',
        today: `${checkout}checkout-new-company`,
        proposed: `${screens}company`,
      },
      {
        id: 'B2',
        label: 'Name typed',
        today: `${remaining}company-typed`,
        proposed: `${screens}company`,
      },
      {
        id: 'B2c',
        label: 'Long company name',
        today: `${remaining}company-long-name`,
        proposed: `${screens}company-long`,
      },
      {
        id: 'B2b',
        label: 'Creating the page',
        today: `${remaining}company-busy`,
        proposed: `${recoveries}creating`,
      },
      {
        id: 'B3',
        label: 'Squad list, one selected',
        today: `${checkout}checkout-pick-squad`,
        proposed: `${screens}company-pick`,
      },
      {
        id: 'B3b',
        label: 'Checking the selected squad',
        today: `${remaining}checking-squad`,
        proposed: `${screens}company-checking`,
      },
      {
        id: 'B4',
        label: 'Squad list, Create new selected',
        today: `${remaining}create-new-selected`,
        proposed: `${screens}company-pick-new`,
      },
      {
        id: 'B4b',
        label: 'Several pages, one already on a plan',
        today: `${remaining}already-on-plan`,
        proposed: `${screens}company-mixed`,
      },
      {
        id: 'B5',
        label: 'Selected squad already on a plan',
        today: `${remaining}already-on-plan`,
        proposed: `${recoveries}already-on-plan`,
      },
      {
        id: 'B6',
        label: 'Creating the page failed',
        today: `${remaining}company-failed`,
        proposed: `${recoveries}handle-failed`,
      },
    ],
  },
  {
    id: 'C',
    title: 'C. Plan',
    states: [
      {
        id: 'C1',
        label: 'Team preselected',
        today: `${checkout}checkout-plan`,
        proposed: `${screens}plan-team`,
      },
      {
        id: 'C2',
        label: 'Starter preselected',
        today: `${remaining}plan-starter`,
        proposed: `${screens}plan`,
      },
      {
        id: 'C3',
        label: 'Long company name',
        today: `${remaining}plan-long-name`,
        proposed: `${screens}plan-long`,
      },
    ],
  },
  {
    id: 'D',
    title: 'D. Payment',
    states: [
      {
        id: 'D1',
        label: 'Summary with the payment form',
        today: `${checkout}checkout-payment`,
        proposed: `${screens}plan`,
      },
      {
        id: 'D1c',
        label: 'Payment on Team',
        today: `${remaining}payment-team`,
        proposed: `${screens}plan-team`,
      },
      {
        id: 'D1d',
        label: 'Payment form loading',
        proposed: `${screens}plan-pay-loading`,
        note: 'Paddle loads in a frame of its own, so this is the wait people actually see.',
      },
      {
        id: 'D1b',
        label: 'Payment on its own, phone',
        proposed: `${screens}plan-phone-pay`,
      },
      {
        id: 'D2',
        label: 'Real Paddle form, with card errors and discounts',
        note: 'Live only. Paddle blocks previews, so check it on production with the flag targeted.',
      },
      {
        id: 'D3',
        label: 'Payment form failed to load',
        proposed: `${recoveries}paddle-failed`,
        note: "Today there's no message, only an empty area.",
      },
      {
        id: 'D4',
        label: 'Discount applied',
        proposed: `${screens}plan-discount`,
        note: 'Today Paddle shows it in its own form, and the summary beside it still shows full price.',
      },
    ],
  },
  {
    id: 'E',
    title: 'E. After paying',
    states: [
      {
        id: 'E1',
        label: 'Setting up',
        today: `${checkout}checkout-activating`,
        proposed: `${screens}activating`,
      },
      {
        id: 'E1b',
        label: 'Back after a refresh while setting up',
        today: `${checkout}checkout-pick-squad`,
        proposed: `${screens}activating`,
        note: 'Today this returns to the company step and offers to pay again.',
      },
      {
        id: 'E2',
        label: 'Payment received, taking longer',
        today: `${remaining}slow`,
        proposed: `${recoveries}slow`,
      },
      {
        id: 'E3',
        label: 'Done on Starter',
        today: `${checkout}checkout-done`,
        proposed: `${screens}setup`,
      },
      {
        id: 'E4',
        label: 'Done on Team',
        today: `${checkout}checkout-done-team`,
        proposed: `${screens}setup-team`,
      },
      {
        id: 'E5',
        label: 'Plan active, page still loading',
        today: `${remaining}plan-active-page-loading`,
        proposed: `${screens}setup-loading`,
        note: 'The setup panel is missing until the page loads.',
      },
    ],
  },
  {
    id: 'F',
    title: 'F. Setup panel',
    states: [
      {
        id: 'F1',
        label: 'Agent path',
        today: `${remaining}setup-agent`,
        proposed: `${screens}setup`,
      },
      {
        id: 'F1b',
        label: 'Agent path, Cursor (with install button)',
        today: `${remaining}setup-cursor`,
        proposed: `${screens}setup-cursor`,
      },
      {
        id: 'F1c',
        label: 'Agent path, Codex',
        today: `${remaining}setup-codex`,
        proposed: `${screens}setup-codex`,
      },
      {
        id: 'F1d',
        label: 'Agent path, VS Code',
        today: `${remaining}setup-vs-code`,
        proposed: `${screens}setup-vs-code`,
      },
      {
        id: 'F1e',
        label: 'Agent path, any other client',
        today: `${remaining}setup-other`,
        proposed: `${screens}setup-other`,
      },
      {
        id: 'F1f',
        label: 'Agent path, Starter prompt',
        today: `${remaining}setup-agent-starter`,
        proposed: `${screens}setup`,
      },
      {
        id: 'F2',
        label: 'Checklist on Team, half done',
        today: `${checkout}setup-do-it-yourself`,
        proposed: `${screens}setup-manual-team`,
      },
      {
        id: 'F3',
        label: 'Checklist on Starter',
        today: `${remaining}setup-starter`,
        proposed: `${screens}setup-manual`,
      },
      {
        id: 'F4',
        label: 'Fully done',
        today: `${remaining}setup-done`,
        proposed: `${screens}setup-manual-done`,
      },
      {
        id: 'F7',
        label: 'Do it yourself, editing a row',
        proposed: `${screens}setup-editing`,
        note: "The row's settings page, in the right box or as its own page on a phone. Today this leaves for settings. Back and Save return to the checklist.",
      },
      {
        id: 'F6',
        label: 'Do it yourself, checking what is done',
        proposed: `${screens}setup-checking`,
        note: 'Today every row shows as not done, then flips. The words stay, and only the checks and buttons wait.',
      },
      {
        id: 'F5',
        label: 'Finished, every step checked',
        proposed: `${screens}setup-finished`,
        note: 'Today the setup list stays up forever, with no finished moment.',
      },
    ],
  },
  {
    id: 'G',
    title: 'G. Manage › Subscription',
    states: [
      {
        id: 'G0c',
        label: 'Seats still loading',
        proposed: `${manage}seats-loading`,
      },
      {
        id: 'G0',
        label: 'Plan still loading',
        today: `${remaining}manage-loading`,
        proposed: `${manage}loading`,
        note: 'Blank, with no skeleton.',
      },
      {
        id: 'G0b',
        label: 'Plan lookup failed',
        today: `${remaining}manage-lookup-failed`,
        proposed: `${manage}lookup-failed`,
        note: 'Shows the buy screen, even to a squad that is paying.',
      },
      {
        id: 'G1',
        label: 'No plan, admin',
        today: `${checkout}manage-no-plan`,
        proposed: `${manage}no-plan-admin`,
      },
      {
        id: 'G2',
        label: 'No plan, moderator',
        today: `${checkout}manage-no-plan-moderator`,
        proposed: `${manage}no-plan-moderator`,
      },
      {
        id: 'G3',
        label: 'Starter, owner',
        today: `${checkout}manage-starter`,
        proposed: `${manage}starter-owner`,
      },
      {
        id: 'G3b',
        label: 'Starter, another admin',
        today: `${remaining}manage-starter-other-admin`,
        proposed: `${manage}starter-admin`,
      },
      {
        id: 'G3c',
        label: 'Starter, moderator',
        today: `${remaining}manage-starter-moderator`,
        proposed: `${manage}starter-moderator`,
      },
      {
        id: 'G3d',
        label: 'Just bought, no cashback yet',
        today: `${remaining}manage-zero-wallet`,
        proposed: `${manage}zero-cashback`,
      },
      {
        id: 'G4',
        label: 'Team, owner',
        today: `${checkout}manage-team`,
        proposed: `${manage}team-owner`,
      },
      {
        id: 'G4b',
        label: 'Team, no teammates yet',
        today: `${remaining}manage-team-alone`,
        proposed: `${manage}team-alone`,
      },
      {
        id: 'G4c',
        label: 'Team, page half set up',
        today: `${checkout}manage-team`,
        proposed: `${manage}half-set-up`,
      },
      {
        id: 'G5',
        label: 'Team, another admin',
        today: `${remaining}manage-other-admin`,
        proposed: `${manage}team-admin`,
      },
      {
        id: 'G6',
        label: 'Team, moderator',
        today: `${remaining}manage-moderator`,
        proposed: `${manage}team-moderator`,
      },
      {
        id: 'G7',
        label: 'Team full, Give seat disabled',
        today: `${remaining}manage-full`,
        proposed: `${manage}team-full`,
      },
      {
        id: 'G8',
        label: 'Seat change in progress',
        today: `${remaining}seat-changing`,
        proposed: `${manage}seat-changing`,
      },
      {
        id: 'G8b',
        label: 'Seat change failed',
        today: `${remaining}seat-failed`,
        proposed: `${manage}seat-failed`,
      },
      {
        id: 'G9',
        label: 'Payment failed, owner',
        today: `${checkout}manage-no-plan`,
        proposed: `${manage}past-due`,
        note: 'Today this looks like a page with no plan, with no billing button.',
      },
      {
        id: 'G9b',
        label: 'Payment failed, another admin',
        today: `${checkout}manage-no-plan`,
        proposed: `${manage}past-due-admin`,
      },
      {
        id: 'G10',
        label: 'Plan ending',
        today: `${checkout}manage-team`,
        proposed: `${manage}ending`,
        note: 'Today nothing says it is ending.',
      },
      {
        id: 'G11',
        label: 'Cancelled, cashback frozen',
        today: `${checkout}manage-no-plan`,
        proposed: `${manage}cancelled`,
        note: 'Today the wallet disappears from the page.',
      },
      {
        id: 'G12',
        label: 'Seat held by a former teammate',
        today: `${remaining}manage-full`,
        proposed: `${manage}former-teammate`,
        note: 'Today they are not listed, so nobody can remove the seat.',
      },
      {
        id: 'G13',
        label: 'Page fully set up',
        today: `${remaining}setup-done`,
        proposed: `${manage}setup-complete`,
      },
    ],
  },
  {
    id: 'H',
    title: 'H. Squad page upsell',
    states: [
      {
        id: 'H1b',
        label: 'The entire squad page, with the upsell on it',
        today: `${remaining}upsell-full`,
        proposed: `${manage}upsell-full`,
        note: 'The first card in the right column.',
      },
      {
        id: 'H1',
        label: 'Upsell on the squad page',
        today: `${checkout}squad-page-upsell`,
        proposed: `${manage}upsell`,
        note: 'Only for a flagged admin of an unverified squad with no plan, until dismissed.',
      },
    ],
  },
];

const allStates = groups.flatMap(({ states }) => states);

export const findState = (id: string): PlaygroundState => {
  const state = allStates.find((item) => item.id === id);

  if (!state) {
    throw new Error(`No state ${id}`);
  }

  return state;
};

export interface PlaygroundFlow {
  id: string;
  title: string;
  who: string;
  steps: string[];
}

export const flows: PlaygroundFlow[] = [
  {
    id: 'new-founder',
    title: 'Flow 1. New founder',
    who: 'Signed out, clicks Get started on the landing page, and creates a new company.',
    steps: ['A1', 'A2', 'A3', 'B1', 'C2', 'D1', 'E1', 'E3'],
  },
  {
    id: 'social',
    title: 'Flow 1a. New founder with GitHub or Google',
    who: 'Signed out, and skips the email form and code, because a social sign-up completes its profile on its own.',
    steps: ['A1', 'A1b', 'B1', 'C2', 'D1', 'E1', 'E3'],
  },
  {
    id: 'returning',
    title: 'Flow 1b. Returning user logs in',
    who: 'Already has a daily.dev account, including people who forgot a password or never verified their email.',
    steps: [
      'A1',
      'A4',
      'A4b',
      'A4c',
      'A5',
      'A5b',
      'A3c',
      'B3',
      'C2',
      'D1',
      'E1',
      'E3',
    ],
  },
  {
    id: 'signed-in',
    title: 'Flow 2. Signed-in user with no squad',
    who: 'The same flow without the account step.',
    steps: ['B1', 'B2', 'C2', 'D1', 'E1', 'E3'],
  },
  {
    id: 'admin',
    title: 'Flow 3. Signed-in admin of squads',
    who: 'Picks a squad they run, or creates a new one.',
    steps: ['B3', 'B4', 'C2', 'D1', 'E1', 'E3'],
  },
  {
    id: 'upsell',
    title: 'Flow 4. From the squad page upsell',
    who: 'An admin clicks See plans on their squad page. Today they land on the company step and pick the squad again. The proposal skips it.',
    steps: ['H1b', 'H1', 'C2', 'D1', 'E1', 'E3'],
  },
  {
    id: 'manage',
    title: 'Flow 5. From Manage › Subscription',
    who: 'An admin clicks Choose Team. Today they get asked for the squad and the plan again. The proposal goes straight to payment.',
    steps: ['G1', 'C1', 'D1', 'E1', 'E4'],
  },
  {
    id: 'after-buying',
    title: 'Flow 6. After buying',
    who: 'The page is live. Set it up, then manage seats and billing, by role.',
    steps: [
      'E3',
      'F1',
      'F2',
      'F4',
      'G3',
      'G3b',
      'G3c',
      'G4',
      'G5',
      'G6',
      'G7',
      'G8',
      'G8b',
    ],
  },
  {
    id: 'exits',
    title: 'Exits and failures',
    who: 'Where a flow stops early or something goes wrong.',
    steps: ['B5', 'B6', 'D3', 'E2', 'E5', 'G0b'],
  },
];

export const exitNotes = [
  'Enterprise links go to business.daily.dev, from the Plan step and Manage › Subscription.',
  'A person outside the flag is sent to /squads, and only after signing up, because a signed-out visitor can’t be checked yet.',
  '?d_id= applies a discount on the Paddle form. You can only see it live.',
  'Accounts with an unfinished social sign-up stay on the Account step until the profile is complete.',
];

export const gaps: { title: string; body: string; link?: string }[] = [
  {
    title: 'Paying twice after a refresh',
    body: 'Refreshing during Setting up shows no plan and offers to pay again. The API rejects the second subscription after the money is taken.',
    link: 'startups-onboarding-4-states-and-recoveries--overview',
  },
  {
    title: 'A failed card hides the billing button',
    body: 'The API reports no plan, and the owner sees the buy screen with no Manage billing.',
    link: 'startups-onboarding-2b-manage-and-upsell--past-due',
  },
  {
    title: 'A plan that is ending',
    body: "Nothing says when it ends. After cancelling, the Cores stay frozen and the page doesn't show them.",
    link: 'startups-onboarding-2b-manage-and-upsell--ending',
  },
  {
    title: 'A failed plan lookup in Manage',
    body: 'An API error shows the buy screen to a squad that is already paying.',
    link: 'startups-onboarding-2b-manage-and-upsell--lookup-failed',
  },
  {
    title: 'Activation that never arrives',
    body: 'Polling stops at 60 seconds, and the same message stays up even if activation failed.',
    link: 'startups-onboarding-4-states-and-recoveries--slow',
  },
  {
    title: 'The payment form fails to load',
    body: 'An empty 500px area with no message.',
    link: 'startups-onboarding-4-states-and-recoveries--paddle-failed',
  },
  {
    title: 'The handle check fails',
    body: 'The Create button just resets, with no error.',
    link: 'startups-onboarding-4-states-and-recoveries--handle-failed',
  },
  {
    title: 'Seats held by demoted teammates',
    body: 'They hold a seat but are not listed, so it can say every seat is taken with nobody to remove.',
    link: 'startups-onboarding-2b-manage-and-upsell--former-teammate',
  },
  {
    title: 'Back and refresh',
    body: 'No way back from Plan to Company, and browser back or refresh loses your progress.',
    link: 'startups-onboarding-1-prototype--desktop',
  },
  {
    title: 'iOS',
    body: 'A code comment says not sold on iOS, but no check stops the page, the upsell or Manage › Subscription opening there.',
  },
  {
    title: 'Smaller issues',
    body: '"See plans" opens the Company step. "Logo and description" ticks from the description alone. Moderators see a Give seats row they can\'t act on. Verified squads can still buy in Manage.',
  },
];

/** Everything in the PR that isn't a screen, so nothing is left out of a review. */
export const notScreens: { title: string; items: string[] }[] = [
  {
    title: 'States that draw nothing',
    items: [
      'Page gate: blank while auth, the router and the flag load.',
      'Flag off for a signed-in person: blank, then redirected to /squads.',
      'Upsell hidden: moderators, members, visitors, verified squads, squads with a plan, or dismissed for this squad.',
      'Manage › Subscription hidden: flag off, or no edit permission. A direct link redirects to Manage.',
      'Manage › Subscription is unreachable by members and visitors.',
      'Users with an unfinished social profile stay on Account until it completes.',
    ],
  },
  {
    title: 'Only visible live',
    items: [
      'The real Paddle form: loading, card errors, payment failure, discount codes, tax. Previews are blocked by Paddle.',
      'The real social sign-in popup, and closing it midway.',
      'The Turnstile bot check when it fails or asks for interaction.',
      'Local-currency prices from Paddle. Storybook shows the US list prices.',
      'Polling picking up the webhook, and Setting up changing to Done.',
    ],
  },
  {
    title: 'URL and entry points',
    items: [
      '?plan=starter or team preselects a plan. ?squad=id preselects a squad, and is ignored if you are not its admin. ?d_id= applies a discount.',
      'Landing page: Get started and plan cards when flagged, waitlist otherwise (recruiter-landing #646).',
      'The route has a hyphen so it can never shadow a squad page.',
      'iOS: a code comment says not sold there, but nothing stops the screens opening.',
    ],
  },
  {
    title: 'After purchase, handled by the API',
    items: [
      'Past due or paused: features off, plan reported as none, seats kept.',
      'Cancelled: features off, seats cleared, wallet frozen until resubscribing.',
      'A second subscription for an active squad is rejected after payment. A payer who is no longer an admin is rejected too.',
      'Starter and Team both cap products at one. Team adds the header CTA.',
      'Switching between Starter and Team is not built. It needs an API mutation.',
      'Agent setup steps for logo, my squads and posting depend on daily-api #4543.',
    ],
  },
  {
    title: 'Tracking',
    items: [
      'view startups checkout, select squad plan, activate squad plan, delay squad plan activation.',
      'initiate checkout, select checkout payment, initiate payment, complete checkout, warning checkout, error checkout, error payment.',
      'upgrade subscription, manage subscription, give squad seat, remove squad seat.',
      'impression, dismiss startups upsell, select startups setup path, copy startups setup, click startups setup step.',
    ],
  },
];
