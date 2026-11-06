import type { ReactElement } from 'react';
import React from 'react';
import type { Step } from './board';
import { Frame, Lane, Metric, Sticky, frameIcons } from './board';

// Every "today" step is production as of main f9d90efa3 (2026-11-03).
// Numbers are from Agent Smith (90 days, team excluded) and the post boost
// audit of 2026-11-01 (docs/boost/post-boost-audit-2026-11-01.md).

export const frames = [
  { id: 'start', title: 'Read me' },
  { id: 'research', title: 'Research' },
  { id: 'first-cores', title: 'First Cores' },
  { id: 'give-award', title: 'Give an award' },
  { id: 'receive-award', title: 'Receive an award' },
  { id: 'wallet', title: 'Wallet and buying' },
  { id: 'first-boost', title: 'First boost' },
  { id: 'after-boost', title: 'After the boost' },
  { id: 'plan', title: 'Fix plan' },
];

const Legend = (): ReactElement => (
  <div className="flex flex-col gap-3">
    <span className="font-bold typo-title3">How to read the board</span>
    <div className="grid grid-cols-2 gap-3">
      <Sticky tone="pain">What breaks or leaks today.</Sticky>
      <Sticky tone="fix" index={1}>
        What we change, pinned to the step it changes.
      </Sticky>
      <Sticky tone="data" index={2}>
        Production numbers behind the step.
      </Sticky>
      <Sticky tone="voice" index={3}>
        In-app feedback, paraphrased.
      </Sticky>
      <Sticky tone="backend" index={4}>
        Can't ship from apps alone: needs daily-api or Njord.
      </Sticky>
    </div>
    <div className="flex flex-wrap gap-2 typo-footnote">
      <span className="rounded-8 border border-accent-cabbage-default px-2 py-1">
        Changed step
      </span>
      <span className="rounded-8 border border-accent-avocado-default px-2 py-1">
        New step
      </span>
      <span className="rounded-8 border border-accent-ketchup-default px-2 py-1">
        Broken
      </span>
      <span className="rounded-8 border border-dashed border-accent-ketchup-default px-2 py-1">
        Dead end
      </span>
    </div>
  </div>
);

const ReadMe = (): ReactElement => (
  <Frame
    id="start"
    number="1"
    title="Cores, wallet and boost: today vs fixed"
    icon={frameIcons.core}
    className="w-[60rem]"
    summary={
      <>
        <p>
          Every journey a user takes with Cores, as it works in production today
          (red lane), and the flow we propose (green lane). The goal is that no
          journey ends somewhere the user didn't mean to go, and that free Cores
          lead to a first spend.
        </p>
        <p className="mt-3">
          Three problems run through all of it: free Cores have no next step,
          buying Cores interrupts the task the user was doing, and boost has no
          home after launch.
        </p>
      </>
    }
  >
    <Legend />
  </Frame>
);

const Research = (): ReactElement => (
  <Frame
    id="research"
    number="2"
    title="What the data and users say"
    icon={frameIcons.sparkle}
    className="w-[90rem]"
    summary="Agent Smith, last 90 days, team excluded, plus the post boost audit of Nov 1, 2026 and about 35 in-app feedback items from May to Nov."
  >
    <div className="grid grid-cols-3 gap-6">
      <div className="flex flex-col gap-3">
        <span className="font-bold typo-title3">Earning and spending</span>
        <div className="grid grid-cols-2 gap-3">
          <Metric
            value="94%"
            label="of new holders got first Cores from a quest"
          />
          <Metric value="7%" label="of them ever spent a Core" />
          <Metric value="68%" label="of buyers spent (25 of 37)" />
          <Metric
            value="20%"
            label="of award recipients opened the wallet in 7 days"
          />
        </div>
        <Sticky tone="data">
          5,172 users got their first Cores in 90 days: 4,842 quest rewards, 140
          awards, 37 purchases, 22 Plus giveback.
        </Sticky>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-bold typo-title3">Buying Cores</span>
        <div className="grid grid-cols-2 gap-3">
          <Metric value="1,122" label="started buying (all origins)" />
          <Metric value="388" label="started checkout" />
          <Metric value="115" label="completed (30%)" />
          <Metric value="23" label="boost buyers hit checkout errors" />
        </div>
        <Sticky tone="data" index={1}>
          Start buying by origin: wallet package 492, award 378, wallet CTA 252.
          Checkout events carry the origin only since apps#7194, so per-origin
          conversion starts now.
        </Sticky>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-bold typo-title3">Boost</span>
        <div className="grid grid-cols-2 gap-3">
          <Metric
            value="0.5%"
            label="of eligible posters boosted (32 of 6,287)"
          />
          <Metric value="25%" label="of boosters boost again" />
          <Metric value="~$4.5k" label="boost revenue, 90 days" />
          <Metric value="53%" label="of spend from the top 10 boosters" />
        </div>
        <Sticky tone="data" index={2}>
          New boosters fell from about 23 a month to 3–11 after the minimum went
          from 1k to 5k Cores a day (Nov 6, 2025).
        </Sticky>
      </div>
    </div>
    <div className="flex flex-col gap-3">
      <span className="font-bold typo-title3">Complaint themes</span>
      <div className="grid grid-cols-4 gap-4">
        <Sticky tone="voice">
          <b>Cash out or more uses (8).</b> &quot;Let me pay for Plus with
          Cores&quot;, &quot;creators should be able to withdraw&quot;.
        </Sticky>
        <Sticky tone="voice" index={1}>
          <b>Awards (6).</b> The notification doesn&apos;t say what it was for,
          the message sometimes never arrives, no way to thank for gifted Cores.
        </Sticky>
        <Sticky tone="voice" index={2}>
          <b>Boost drains fast (5).</b> Jun 26–30 cluster: &quot;5k gone in 10
          minutes&quot;. A delivery incident.
        </Sticky>
        <Sticky tone="voice" index={3}>
          <b>Boost price and minimum (4).</b> One user bought 100 Cores for €1
          thinking it was enough to boost, then asked for a refund.
        </Sticky>
        <Sticky tone="voice" index={4}>
          <b>Paid, no Cores (4).</b> $13.20 through PayPal, nothing arrived.
          Deleting a post mid-boost lost about 5k unspent Cores.
        </Sticky>
        <Sticky tone="voice">
          <b>Wallet numbers (4).</b> Balance isn&apos;t received minus spent;
          streak restores are missing from Spent; +35 vs a 50 award.
        </Sticky>
        <Sticky tone="pain" index={1}>
          Two payment tickets (the $13.20 one and a €1 refund) are marked
          resolved with no reply. Someone should check them now.
        </Sticky>
        <Sticky tone="pain" index={2}>
          Feedback only covers in-app tickets. App store reviews, Discord and
          the support inbox weren&apos;t reachable.
        </Sticky>
      </div>
    </div>
  </Frame>
);

const firstCoresToday: Step[] = [
  {
    surface: 'Widget',
    title: 'Quest reward',
    ui: ['# Read 3 posts', '~', '[Claim +20 Cores]'],
    where: 'QuestCard.tsx · GettingStartedWidget.tsx',
    notes: [
      {
        tone: 'data',
        text: '94% of new Cores holders got their first Cores here.',
      },
      {
        tone: 'pain',
        text: 'Quest cards show Cores amounts without checking Cores access.',
      },
    ],
  },
  {
    surface: 'System',
    title: 'Header balance animates',
    via: 'claim',
    ui: ['(Core 20)', 'Tooltip: Wallet · 20 Cores'],
    where: 'ProfileButton.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'Nothing says what Cores are or what to do with them.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Wallet',
    via: 'click the pill',
    ui: [
      '# Core wallet',
      'Balance 20 · Received 20',
      'Quest reward +20',
      '[Buy Cores]',
    ],
    where: '/wallet',
    status: 'deadend',
    notes: [
      {
        tone: 'pain',
        text: 'The only action is Buy Cores. No path to award, boost or restore a streak.',
      },
      {
        tone: 'data',
        text: 'Only 7% of quest earners ever spend. 164 posters hold 1,000+ Cores and never boosted (304k Cores idle).',
      },
    ],
  },
];

const firstCoresNoAccess: Step[] = [
  {
    surface: 'Menu',
    title: 'Sidebar stats and Cores shortcut',
    ui: ['Cores wallet · 0'],
    where: 'SidebarProfileStats.tsx · SidebarShortcutsDock.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'Shown with no access check, to users whose coresRole is None.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Redirected home',
    via: 'click',
    ui: ['/wallet → /'],
    status: 'deadend',
  },
];

const firstCoresFixed: Step[] = [
  {
    surface: 'Widget',
    title: 'Quest reward',
    status: 'changed',
    ui: ['# Read 3 posts', '~', '[Claim +20 Cores]'],
    notes: [
      {
        tone: 'fix',
        text: 'Cores rewards and wallet links only render with useHasAccessToCores, sidebar stats and dock shortcut included.',
      },
    ],
  },
  {
    surface: 'Sheet',
    title: 'Your first Cores',
    via: 'first claim only',
    status: 'new',
    ui: [
      '# You earned your first Cores',
      'Give an award to a creator',
      'Boost your post',
      'Restore a lost streak',
      '[Show me] (Later)',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Shown once (ActionType). The primary option depends on the user: a poster sees Boost first, a reader sees Award first.',
      },
      {
        tone: 'fix',
        text: 'Ship behind an experiment flag that defaults to control.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Wallet with "Use your Cores"',
    via: 'Show me',
    status: 'changed',
    ui: [
      '# Core wallet',
      'Balance 20',
      '# Use your Cores',
      'Award · from 10 Cores',
      'Boost a post · from 5,000',
      'Streak restore',
      '(Buy Cores)',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Each row says whether the balance covers it, and opens the real flow (the latest post for Boost, the feed for Award).',
      },
    ],
  },
  {
    surface: 'Widget',
    title: 'Nudge on own post',
    via: 'later, on a post',
    status: 'new',
    ui: ['You have 1,200 Cores', 'Enough to boost this post', '[Boost]'],
    notes: [
      {
        tone: 'fix',
        text: 'Only when the balance covers the smallest boost, so it never leads to a purchase wall.',
      },
    ],
  },
];

const FirstCores = (): ReactElement => (
  <Frame
    id="first-cores"
    number="3"
    title="First Cores: earning to a first spend"
    icon={frameIcons.core}
    summary="Most users meet Cores through a quest reward. Today that reward ends in a wallet that only sells more Cores."
  >
    <Lane label="Today" steps={firstCoresToday} />
    <Lane
      label="Today · users without Cores access"
      tone="branch"
      steps={firstCoresNoAccess}
    />
    <Lane label="Fixed" tone="fixed" steps={firstCoresFixed} />
  </Frame>
);

const giveAwardToday: Step[] = [
  {
    surface: 'Page',
    title: 'Post, comment or profile',
    ui: ['~', '~', '(Award)'],
    where: 'AwardButton.tsx',
  },
  {
    surface: 'Modal',
    title: 'Pick an award',
    via: 'click Award',
    ui: [
      '# Give an Award (Core 20 +)',
      'Coffee 50 · Cake 100 · …',
      '[Buy Cores 50]',
    ],
    where: 'GiveAwardModal.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'Awards you can’t afford look the same as the ones you can, until you pick one.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Buy Cores',
    via: 'not enough Cores',
    ui: ['You need 30 more Cores', '100 · 300 · 600 · …', '[Buy]'],
    where: 'BuyCoresModal.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'Copy is right for awards, but the "+" in this header does nothing.',
      },
    ],
  },
  {
    surface: 'Checkout',
    title: 'Paddle checkout',
    via: 'pick a pack',
    ui: ['Card · PayPal · Apple Pay', '[Pay]'],
    where: 'usePaddlePayment.ts',
    notes: [
      {
        tone: 'data',
        text: 'Across all origins, 388 started checkout and 115 completed (30%).',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Processing',
    via: 'paid',
    ui: ['Processing your payment…', '~'],
    where: 'BuyCoresProcessing',
    notes: [
      {
        tone: 'pain',
        text: 'Gives up after 60s and sends the user to the wallet. The award is lost.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'You got your Cores!',
    via: 'webhook lands',
    ui: ['# You got your Cores!', '[Got it]'],
  },
  {
    surface: 'Modal',
    title: 'Back to the picker',
    via: 'Got it',
    status: 'broken',
    ui: ['# Give an Award', 'Coffee · Cake · …', 'Nothing selected'],
    notes: [
      {
        tone: 'pain',
        text: 'The picked award is gone. Pick again, write the note, then Send.',
      },
    ],
  },
];

const giveAwardExtension: Step[] = [
  {
    surface: 'Page',
    title: 'Webapp /cores',
    ui: ['/cores?origin=award&next=…', '[Buy]'],
    where: 'GiveAwardModalContext.tsx:176',
  },
  {
    surface: 'Page',
    title: 'Homepage',
    via: 'Got it',
    status: 'deadend',
    ui: ['/'],
    notes: [
      {
        tone: 'pain',
        text: 'Only post awards set next. Comment, user, Squad and plugin awards end on the homepage.',
      },
    ],
  },
];

const giveAwardIos: Step[] = [
  {
    surface: 'Modal',
    title: 'Insufficient Cores',
    status: 'deadend',
    ui: ['(Insufficient Cores)'],
    notes: [
      {
        tone: 'pain',
        text: 'iOS builds without in-app purchase get a disabled button with no reason or next step.',
      },
    ],
  },
];

const giveAwardFixed: Step[] = [
  {
    surface: 'Page',
    title: 'Post, comment or profile',
    ui: ['~', '~', '(Award)'],
  },
  {
    surface: 'Modal',
    title: 'Pick an award',
    via: 'click Award',
    status: 'changed',
    ui: [
      '# Give an Award (Core 20)',
      'Coffee 50 · +30 needed',
      '[Get 30 Cores and send]',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Each award shows what’s missing, and the CTA names the next step.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Buy Cores, pack preselected',
    via: 'CTA',
    status: 'changed',
    ui: ['Covers your award', '100 ✓ · 300 · 600', '[Buy 100 Cores]'],
    notes: [
      {
        tone: 'fix',
        text: 'Preselect the smallest pack that covers the shortfall. The "+" stops being a no-op.',
      },
    ],
  },
  {
    surface: 'Checkout',
    title: 'Paddle checkout',
    via: 'Buy',
    ui: ['Card · PayPal · Apple Pay', '[Pay]'],
  },
  {
    surface: 'Modal',
    title: 'Processing',
    via: 'paid',
    status: 'changed',
    ui: ['Still processing…', '(Check again)'],
    notes: [
      {
        tone: 'fix',
        text: 'On timeout, stay in the modal with Check again, and keep the award draft.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Note and send',
    via: 'Cores land',
    status: 'changed',
    ui: ['Coffee · 50 Cores', 'Add a note…', '[Send award]'],
    notes: [
      {
        tone: 'fix',
        text: 'Skip the picker: land on the note step with the award still selected.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Award sent',
    via: 'Send',
    ui: ['# Congrats!', 'Animated award'],
  },
];

const giveAwardFixedOther: Step[] = [
  {
    surface: 'Page',
    title: 'Back where you were',
    status: 'changed',
    ui: ['next = asPath', 'Award modal reopens'],
    notes: [
      {
        tone: 'fix',
        text: 'Extension: every award type passes next (router.asPath) and reopens the award with the same pick.',
      },
      {
        tone: 'fix',
        text: 'iOS without IAP: "Update the app to buy Cores", linked to the App Store.',
      },
    ],
  },
];

const GiveAward = (): ReactElement => (
  <Frame
    id="give-award"
    number="4"
    title="Give an award with a low balance"
    icon={frameIcons.award}
    summary="The award flow sells Cores well (378 purchase starts in 90 days), then loses the award the user was trying to give."
  >
    <Lane label="Today · web" steps={giveAwardToday} />
    <Lane
      label="Today · extension"
      tone="branch"
      from={2}
      steps={giveAwardExtension}
    />
    <Lane
      label="Today · old iOS builds"
      tone="branch"
      from={2}
      steps={giveAwardIos}
    />
    <Lane label="Fixed" tone="fixed" steps={giveAwardFixed} />
    <Lane
      label="Fixed · extension and iOS"
      tone="branch"
      from={2}
      steps={giveAwardFixedOther}
    />
  </Frame>
);

const receiveToday: Step[] = [
  {
    surface: 'System',
    title: 'Someone sends an award',
    ui: ['Coffee · 50 Cores', 'Fee taken: 15'],
    where: 'award mutation · api.user-received-award',
  },
  {
    surface: 'Notification',
    title: 'Award received',
    via: 'push and bell',
    ui: ['Ido gave you an Award', '(Say thanks)'],
    where: 'user_received_award',
    notes: [
      {
        tone: 'voice',
        text: '"The notification doesn’t say what it was for." The note sometimes never arrives.',
      },
      {
        tone: 'voice',
        text: '"It said +35 Cores but the award was 50." The fee isn’t explained anywhere.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Post or profile',
    via: 'click',
    ui: ['targetUrl from the server', '~'],
    status: 'deadend',
    notes: [
      {
        tone: 'pain',
        text: 'No link to the wallet. The header balance stays stale until the next boot refetch.',
      },
      {
        tone: 'data',
        text: '110 of 544 recipients (20%) opened the wallet within 7 days.',
      },
    ],
  },
];

const receiveFixed: Step[] = [
  {
    surface: 'System',
    title: 'Someone sends an award',
    ui: ['Coffee · 50 Cores'],
  },
  {
    surface: 'Notification',
    title: 'Award received, with context',
    via: 'push and bell',
    status: 'changed',
    ui: [
      'Ido gave you Coffee (+35 Cores)',
      'for “Why we moved to Bun”',
      '“Great write-up!”',
      '(Say thanks) (View in wallet)',
    ],
    notes: [
      {
        tone: 'backend',
        text: 'Notification copy needs the award name, net Cores, the post title and the note.',
      },
    ],
  },
  {
    surface: 'System',
    title: 'Balance refreshes',
    via: 'on arrival',
    status: 'new',
    ui: ['(Core 55)', 'Pill animates like a quest claim'],
    notes: [
      {
        tone: 'fix',
        text: 'Refresh user.balance when a Cores notification arrives instead of waiting for boot.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Wallet, row highlighted',
    via: 'View in wallet',
    status: 'changed',
    ui: [
      'Ido · Coffee · +35',
      '50 award, 15 creator fee',
      '“Great write-up!” (Say thanks)',
      '# Use your Cores',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Explain the fee on the row, allow thanks from the wallet, and show "Use your Cores" next.',
      },
      {
        tone: 'data',
        text: 'Success metric: share of recipients who open the wallet in 7 days (20% today).',
      },
    ],
  },
];

const ReceiveAward = (): ReactElement => (
  <Frame
    id="receive-award"
    number="5"
    title="Receive an award"
    icon={frameIcons.bell}
    summary="Getting an award is the best moment to introduce the wallet, and today nothing connects the two."
  >
    <Lane label="Today" steps={receiveToday} />
    <Lane label="Fixed" tone="fixed" steps={receiveFixed} />
  </Frame>
);

const walletToday: Step[] = [
  {
    surface: 'Menu',
    title: 'Ways in',
    ui: [
      'Header pill · profile menu',
      'Sidebar · settings · You page',
      'Award modal pill (new tab)',
    ],
    where: 'walletUrl, 14 links',
  },
  {
    surface: 'Page',
    title: 'Wallet',
    via: 'click',
    ui: [
      'Balance · Purchased · Received · Spent',
      'Transaction history',
      '[Buy Cores]',
    ],
    where: 'pages/wallet.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'Received is after fees and Spent before fees, and Spent leaves out streak restores, so the totals never add up.',
      },
      {
        tone: 'pain',
        text: 'Balance is client state from boot and isn’t refetched on the page.',
      },
    ],
  },
  {
    surface: 'Page',
    title: '/cores',
    via: 'Buy Cores',
    ui: ['/cores?origin=wallet page cta', 'Packs + inline checkout'],
    where: 'pages/cores/index.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'No next. The nav drawer, profile and settings "+" buttons don’t set one either.',
      },
    ],
  },
  {
    surface: 'Checkout',
    title: 'Checkout',
    via: 'pick a pack',
    ui: ['Mobile: /cores/payment?pid', '[Pay]'],
  },
  {
    surface: 'Modal',
    title: 'You got your Cores!',
    via: 'paid',
    ui: ['[Got it]'],
    notes: [
      {
        tone: 'voice',
        text: '"Paid $13.20, no Cores arrived." Webhook errors stay Pending and Paddle doesn’t retry.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Homepage',
    via: 'Got it',
    status: 'deadend',
    ui: ['/'],
    notes: [
      {
        tone: 'pain',
        text: 'Bought from the wallet, landed on the feed.',
      },
    ],
  },
];

const walletFixed: Step[] = [
  {
    surface: 'Menu',
    title: 'Ways in',
    status: 'changed',
    ui: ['Same links, access-gated', 'Award notification', 'Boost rows'],
  },
  {
    surface: 'Page',
    title: 'Wallet',
    via: 'click',
    status: 'changed',
    ui: [
      'Balance (refetched)',
      'Purchased · Received · Spent · Fees',
      '# Use your Cores',
      'History · Pending rows explained',
      '[Buy Cores]',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Totals reconcile: show the fee line, count streak restores in Spent.',
      },
      {
        tone: 'fix',
        text: 'Pending row: "Usually under a minute", plus a support link after 10 minutes.',
      },
    ],
  },
  {
    surface: 'Page',
    title: '/cores',
    via: 'Buy Cores',
    status: 'changed',
    ui: ['/cores?origin=…&next=/wallet', 'Packs + inline checkout'],
    notes: [
      {
        tone: 'fix',
        text: 'Every /cores link passes next (asPath). Streak flows switch from router.pathname to asPath.',
      },
    ],
  },
  {
    surface: 'Checkout',
    title: 'Checkout',
    via: 'pick a pack',
    ui: ['[Pay]'],
  },
  {
    surface: 'Page',
    title: 'Back to the wallet',
    via: 'Got it',
    status: 'changed',
    ui: ['Purchased +300 highlighted', '# Use your Cores'],
    notes: [
      {
        tone: 'backend',
        text: 'Alert on purchases stuck in Processing for 10+ minutes, and let Paddle retry when the handler fails.',
      },
    ],
  },
];

const Wallet = (): ReactElement => (
  <Frame
    id="wallet"
    number="6"
    title="Wallet and buying Cores"
    icon={frameIcons.card}
    summary="The wallet is the second biggest purchase origin (744 starts in 90 days). A purchase started there ends on the homepage."
  >
    <Lane label="Today" steps={walletToday} />
    <Lane label="Fixed" tone="fixed" steps={walletFixed} />
  </Frame>
);

const firstBoostToday: Step[] = [
  {
    surface: 'Page',
    title: 'Own post',
    ui: [
      '(Boost) in the header',
      'Strip: Boost to reach 10k more devs now!',
      'Menu: Boost post',
    ],
    where: 'BoostButton · BoostNewPostStrip · PostOptionButton',
    notes: [
      {
        tone: 'pain',
        text: 'The strip has no button, it only points at the header. It never shows on article posts.',
      },
      {
        tone: 'data',
        text: '3,954 dismissed the strip. 30 of them boosted.',
      },
      {
        tone: 'pain',
        text: 'Gates differ: the menu offers Boost on Brief posts, and the analytics header skips canBoost.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Boost your post',
    via: 'Boost',
    ui: [
      'Budget 5,000 / day',
      'Duration 7 days',
      '35,000 Cores · est. reach',
      '[Boost post for 35,000 Cores]',
    ],
    where: 'BoostPostModal.tsx · boost_settings',
    notes: [
      {
        tone: 'pain',
        text: 'On a new post the CTA is disabled for up to 30s while reach loads, with no explanation.',
      },
      {
        tone: 'data',
        text: 'The minimum is 5,000 Cores a day. 0.5% of eligible posters boosted in 90 days.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Buy Cores',
    via: 'not enough Cores',
    ui: ['You need 34,980 more Cores', '100 · 300 · 600 · …', '[Buy]'],
    notes: [
      {
        tone: 'pain',
        text: 'Packs aren’t sized to the boost; the need parameter exists but nothing sets it.',
      },
      {
        tone: 'data',
        text: '34 of the 39 buyers who never boosted bought 600 Cores or less.',
      },
    ],
  },
  {
    surface: 'Checkout',
    title: 'Checkout',
    via: 'pick a pack',
    ui: ['[Pay]'],
    notes: [
      {
        tone: 'data',
        text: 'On their own post: 93 started checkout, 28 completed. Most errors carry no reason.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Back to the form',
    via: 'Got it',
    status: 'broken',
    ui: ['Budget kept', '[Boost post for 35,000 Cores]'],
    notes: [
      {
        tone: 'pain',
        text: 'The user has to press Boost again. 15 of 28 buyers boosted within a day.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Boost is live!',
    via: 'Boost',
    ui: ['# Boost is live!', '[Track performance]'],
  },
];

const firstBoostFixed: Step[] = [
  {
    surface: 'Page',
    title: 'Own post',
    status: 'changed',
    ui: [
      '(Boost) in the header',
      'Strip on every post type · [Boost]',
      '“Taking off: boost it”',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Strip gets its own Boost button and shows on article posts. One gate (useCanBoostPost, not Brief) for every entry.',
      },
      {
        tone: 'fix',
        text: '"This post is taking off" prompt on posts with traction (240 posts got 50+ upvotes from authors who never boosted).',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Boost your post',
    via: 'Boost',
    status: 'changed',
    ui: [
      'Starter: 1 day · 2,000 Cores',
      'or custom budget',
      'Reading your post to estimate reach…',
      '[Get 1,980 Cores and boost]',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Test a starter preset next to the sliders. The experiment flag defaults to control (today’s 5k).',
      },
      {
        tone: 'backend',
        text: 'A lower minimum is a boost_settings change, so it goes in the same experiment.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Buy Cores, pack preselected',
    via: 'CTA',
    status: 'changed',
    ui: ['Covers your boost', '3,000 ✓ · 5,000 · 10,000', '[Buy 3,000 Cores]'],
    notes: [
      {
        tone: 'fix',
        text: 'Pass need, preselect the smallest pack covering the boost, and say "boost" in the copy, not "award".',
      },
    ],
  },
  {
    surface: 'Checkout',
    title: 'Checkout',
    via: 'Buy',
    ui: ['[Pay]'],
    notes: [
      {
        tone: 'fix',
        text: 'Log the Paddle error reason (since apps#7065) and fix postal-code validation, the only named error.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Boost launches',
    via: 'Cores land',
    status: 'new',
    ui: ['Boosting for 1 day · 2,000 Cores', '(Change)'],
    notes: [
      {
        tone: 'fix',
        text: 'Start the campaign the user already configured, with a short confirm row instead of a second press.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Boost is live!',
    via: 'auto',
    status: 'changed',
    ui: ['# Boost is live!', 'Find it in Boosts', '[See your boost]'],
  },
];

const FirstBoost = (): ReactElement => (
  <Frame
    id="first-boost"
    number="7"
    title="First boost"
    icon={frameIcons.boost}
    summary="Boost is a self-serve ads product for small dev-tool companies. The path to a first boost asks for 35,000 Cores by default and loses the boost when the user stops to buy Cores."
  >
    <Lane label="Today" steps={firstBoostToday} />
    <Lane label="Fixed" tone="fixed" steps={firstBoostFixed} />
  </Frame>
);

const afterBoostToday: Step[] = [
  {
    surface: 'Modal',
    title: 'Ads dashboard',
    ui: [
      'Spend · Impressions · Users',
      '“Launch your first campaign”',
      'Active ads (all of them)',
    ],
    where: 'AdsDashboardModal.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'A modal reached only from menus. No page or URL. The empty-state copy shows when you do have campaigns.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Campaign view',
    via: 'pick a campaign',
    ui: [
      'Progress · Ends in 3 days',
      'Spend · Impressions · Users',
      '(Stop campaign)',
    ],
    where: 'BoostedViewModal.tsx',
    notes: [
      {
        tone: 'pain',
        text: 'No way to extend. Stopping a squad boost says "Post boost canceled!".',
      },
    ],
  },
  {
    surface: 'Notification',
    title: 'Boost is live',
    via: 'at 70% spend',
    ui: ['Your boost is live'],
    notes: [
      {
        tone: 'pain',
        text: 'Fires when 70% of the budget is spent, not when the boost starts.',
      },
    ],
  },
  {
    surface: 'Notification',
    title: 'Boost ended',
    via: 'campaign ends',
    ui: ['Your boost ended', '/notifications?c_id='],
  },
  {
    surface: 'Modal',
    title: 'Boost again',
    via: 'click',
    status: 'broken',
    ui: ['! Crash: onBoostAgain is undefined'],
    where: 'useCampaignByIdModal.ts',
    notes: [
      {
        tone: 'pain',
        text: 'P0 from the audit: the rebuy moment crashes.',
      },
      {
        tone: 'data',
        text: '118 of 159 boosters boosted once. 138 haven’t boosted in 60+ days.',
      },
      {
        tone: 'voice',
        text: '"Deleted my post mid-boost and lost 5k Cores." Under-delivery Jan–Jun left 187k Cores unrefunded.',
      },
    ],
  },
];

const afterBoostFixed: Step[] = [
  {
    surface: 'Page',
    title: 'Boosts page',
    status: 'new',
    ui: ['# Boosts', 'Live (1) · Ended (4)', 'Totals: spend · reach'],
    notes: [
      {
        tone: 'fix',
        text: 'The dashboard becomes a page with a URL, linked from the Boosting button, boost rows in the wallet and the profile menu.',
      },
    ],
  },
  {
    surface: 'Page',
    title: 'Campaign',
    via: 'pick a campaign',
    status: 'changed',
    ui: [
      'Progress · Ends in 3 days',
      'Impressions · Users · Clicks on post',
      '[Extend] (Stop and refund 1,200)',
    ],
    notes: [
      {
        tone: 'fix',
        text: 'Show the refund amount before stopping. Toast copy follows the campaign type.',
      },
      {
        tone: 'backend',
        text: 'Extend needs a campaign mutation in daily-api.',
      },
    ],
  },
  {
    surface: 'Notification',
    title: 'Boost is live',
    via: 'on start',
    status: 'changed',
    ui: ['Your boost is live', '(See your boost)'],
    notes: [
      {
        tone: 'backend',
        text: 'Move the trigger from 70% spend to campaign start.',
      },
    ],
  },
  {
    surface: 'Notification',
    title: 'Boost ended, with results',
    via: 'campaign ends',
    status: 'changed',
    ui: [
      '5.7k impressions · 3.5k devs',
      'Unused 300 Cores refunded',
      '[Boost again]',
    ],
    notes: [
      {
        tone: 'backend',
        text: 'Refund unspent Cores on completion and on post deletion; show it as a wallet row.',
      },
    ],
  },
  {
    surface: 'Modal',
    title: 'Boost again, prefilled',
    via: 'Boost again',
    status: 'changed',
    ui: ['Last budget: 1 day · 2,000', '[Boost post for 2,000 Cores]'],
    notes: [
      {
        tone: 'fix',
        text: 'Pass onBoostAgain from useCampaignByIdModal and prefill the last budget.',
      },
      {
        tone: 'fix',
        text: 'Log stop, extend, dashboard opens and strip dismissals so the funnel doesn’t go dark after launch.',
      },
    ],
  },
];

const AfterBoost = (): ReactElement => (
  <Frame
    id="after-boost"
    number="8"
    title="After the boost, and boosting again"
    icon={frameIcons.boost}
    summary="A quarter of boosters come back. The moment they’re most likely to rebuy crashes, and there’s no page to come back to."
  >
    <Lane label="Today" steps={afterBoostToday} />
    <Lane label="Fixed" tone="fixed" steps={afterBoostFixed} />
  </Frame>
);

const planColumns: {
  title: string;
  lead: string;
  tone: 'pain' | 'fix' | 'data' | 'backend';
  items: string[];
}[] = [
  {
    title: 'Now · bugs',
    lead: 'Small apps changes that stop users getting lost.',
    tone: 'pain',
    items: [
      'Boost again from the notification crashes (onBoostAgain).',
      'Every /cores link passes next; streak flows use asPath.',
      'Gate SidebarProfileStats and the Cores shortcut by Cores access.',
      'Keep the picked award after buying Cores; fix the dead "+".',
      'Squad stop toast, inverted dashboard copy, analytics header gate.',
      'Answer the two unreplied payment tickets.',
    ],
  },
  {
    title: 'Next · flow',
    lead: 'The silky part: no task is interrupted by a purchase.',
    tone: 'fix',
    items: [
      'Preselect the pack that covers the need, for awards and boosts.',
      'Launch the configured boost after the purchase lands.',
      'Clickable boost strip on every post type, one gate everywhere.',
      'Award notification links to the wallet; balance refreshes on arrival.',
      'Wallet totals reconcile; "Use your Cores" on the wallet.',
      'Boosts page with a URL, Extend and refund preview.',
    ],
  },
  {
    title: 'Test · experiments',
    lead: 'Flags default to control.',
    tone: 'data',
    items: [
      'Starter boost: 1 day · 2,000 Cores.',
      '"Your first Cores" sheet after the first quest claim.',
      '"This post is taking off" boost prompt.',
      'Balance nudge on own posts when it covers a boost.',
    ],
  },
  {
    title: 'Backend',
    lead: 'daily-api and Njord work behind the flow.',
    tone: 'backend',
    items: [
      'Refund unspent Cores on completion and post deletion.',
      'Extend campaign mutation.',
      '"Is live" on start; "ended" with results.',
      'Award notification with award, net Cores, post and note.',
      'Alert on Processing 10+ min; let Paddle retry on handler errors.',
    ],
  },
];

const Plan = (): ReactElement => (
  <Frame
    id="plan"
    number="9"
    title="Fix plan"
    icon={frameIcons.sparkle}
    className="w-[100rem]"
    summary="Ordered by how much of the journey each one unblocks. Measure with the funnel events from apps#7194 (open, start, complete, close boost, with origin on checkout) two weeks after each step ships."
  >
    <div className="grid grid-cols-4 gap-6">
      {planColumns.map((column) => (
        <div key={column.title} className="flex flex-col gap-3">
          <span className="font-bold typo-title3">{column.title}</span>
          <span className="text-text-tertiary typo-callout">{column.lead}</span>
          {column.items.map((item, index) => (
            <Sticky key={item} tone={column.tone} index={index}>
              {item}
            </Sticky>
          ))}
        </div>
      ))}
    </div>
  </Frame>
);

const BoardTitle = ({ children }: { children: string }): ReactElement => (
  <h1 className="font-bold text-text-tertiary typo-mega1">{children}</h1>
);

export const BoardContent = (): ReactElement => (
  <div className="flex w-max flex-col items-start gap-32 p-24">
    <div className="flex items-start gap-24">
      <ReadMe />
      <Research />
      <Plan />
    </div>
    <div className="flex items-start gap-32">
      <div className="flex flex-col items-start gap-24">
        <BoardTitle>Cores and wallet</BoardTitle>
        <FirstCores />
        <GiveAward />
        <ReceiveAward />
        <Wallet />
      </div>
      <div className="flex flex-col items-start gap-24">
        <BoardTitle>Boost</BoardTitle>
        <FirstBoost />
        <AfterBoost />
      </div>
    </div>
  </div>
);
