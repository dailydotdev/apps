import type { ReactNode } from 'react';

/* The research behind round two: what each logged-out door does, what the
   second-surface products do, Nikita Bier's rules, and our own numbers. The
   screenshots were captured headless at 1440 on 2026-10-28 (public/landing-hero). */

export type Site = {
  id: string;
  name: string;
  pattern: string;
  lesson: string;
  usedBy: string[];
};

export const doors: Site[] = [
  {
    id: 'reddit',
    name: 'Reddit',
    pattern:
      'The Popular feed is the page. A docked card on the left (“Join the most real place on the internet”) with Google, Apple and Email; prompts fire on vote and comment. Google One Tap roughly doubled their signups.',
    lesson: 'Window plus docked card; ask at the moment of intent.',
    usedBy: ['S3', 'S5', 'S9'],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    pattern:
      '“Create the life you love on Pinterest” with Join free / I already have an account, real pins beside it, and the signup sheet after browsing. Opening the logged-out product first cost signups at first and raised intent, retention and SEO; Save and Follow on logged-out pages added 5% signups.',
    lesson: 'Browse first, wall later; actions as doors.',
    usedBy: ['S4', 'S5'],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    pattern:
      'The For You feed plays logged out. A one-line coach mark, then a login sheet when you interact.',
    lesson: 'The product is the pitch; the ask rides on interaction.',
    usedBy: ['S4', 'S5'],
  },
  {
    id: 'threads',
    name: 'Threads',
    pattern:
      'Readable feed, a docked “Log in or sign up” card, and a centered “Say more with Threads” sheet with one button: Continue with Instagram.',
    lesson: 'One identity, one tap; the sheet rises over content.',
    usedBy: ['S4', 'S9'],
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    pattern:
      'A modal over the blurred feed: “Real people. Real conversations. Social media you control.” Create account, Explore the app. Starter packs carried the cold start (a 2025 study: members gained up to 85% more followers).',
    lesson: 'Explore stays open; packs replace the empty account.',
    usedBy: ['S6', 'S8'],
  },
  {
    id: 'substack',
    name: 'Substack',
    pattern:
      'A For you feed with a right-hand card: “Log in or sign up · Join the most interesting and insightful discussions”, Start your Substack, Sign in.',
    lesson: 'Feed left, ask right, in the reader’s eye line.',
    usedBy: ['S3'],
  },
  {
    id: 'medium',
    name: 'Medium',
    pattern:
      '“Human stories & ideas.” One sentence. One button: Start reading. Nothing else above the fold.',
    lesson: 'The minimal door; the verb is the outcome.',
    usedBy: ['S2', 'S8'],
  },
  {
    id: 'discord',
    name: 'Discord',
    pattern:
      'A promise, then two buttons: Download for Mac (OS-aware) and Open Discord in your browser.',
    lesson: 'Platform-aware primary; the browser as the no-install path.',
    usedBy: ['S8', 'E2'],
  },
  {
    id: 'devto',
    name: 'DEV Community',
    pattern:
      'The feed is the page; a left card says “DEV Community is a community of 4,183,247 amazing developers” with Create account and Log in.',
    lesson:
      'The closest peer: window plus docked card with a live member count.',
    usedBy: ['S3'],
  },
];

export const surfaces: Site[] = [
  {
    id: 'grammarly',
    name: 'Grammarly',
    pattern:
      'No install button on the homepage. “Sign up, it’s free” and “Sign up with Google”; the extension is offered after the account exists.',
    lesson: 'The biggest extension company sequences the install after signup.',
    usedBy: ['E4', 'E6'],
  },
  {
    id: 'loom',
    name: 'Loom',
    pattern:
      'Primary “Get Loom for free”, a quieter “Install Chrome Extension” beside it.',
    lesson: 'Two buttons can coexist when weights differ clearly.',
    usedBy: ['E3', 'E2'],
  },
  {
    id: 'honey',
    name: 'Honey',
    pattern:
      '“Love deals? You came to the right place.” The benefit, then 141,786 Chrome Store reviews and 17 million members, then one button: Add to Chrome, it’s free.',
    lesson: 'Gain, proof, button, in that order.',
    usedBy: ['E1', 'E5', 'E9'],
  },
  {
    id: 'momentum',
    name: 'Momentum',
    pattern:
      '“Turn your new tab page into your personal space.” A blank Google tab turning into the dashboard, 13,000+ reviews, 3+ million users, Get Momentum.',
    lesson: 'Show the new tab becoming the product; proof under the button.',
    usedBy: ['E10', 'E1'],
  },
  {
    id: 'toby',
    name: 'Toby',
    pattern:
      '“Chrome Store Featured” eyebrow, “All your resources. In one place.”, Try Toby for free, an “Available on” row of browser marks.',
    lesson: 'The Featured badge as an eyebrow; browsers as marks.',
    usedBy: ['E5', 'E2'],
  },
  {
    id: 'tabliss',
    name: 'Tabliss',
    pattern:
      'Add to Chrome as the primary, “Try web version” as the link under it.',
    lesson: 'The inverse of daily.dev today; web as the fallback.',
    usedBy: ['E6'],
  },
  {
    id: 'rakuten',
    name: 'Rakuten',
    pattern:
      'Email field + Join for Free, then a ratings row: Trustpilot 4.6, App Store 4.8, Chrome Web Store 4.9, each a link.',
    lesson: 'Proof that doubles as the door to each surface.',
    usedBy: ['E5'],
  },
  {
    id: 'raindrop',
    name: 'Raindrop',
    pattern: '“Sign up” primary, “Download app” as a text link next to it.',
    lesson: 'Account first, surface second, both visible.',
    usedBy: ['E3'],
  },
  {
    id: 'spotify',
    name: 'Spotify web player',
    pattern:
      'The product plays logged out; “Install App” sits in the header next to Sign up and Log in.',
    lesson: 'The header is the conventional home of the second surface.',
    usedBy: ['E2'],
  },
  {
    id: 'readwise',
    name: 'Readwise',
    pattern:
      '“Get the most out of what you read.” One button, Get Started For Free; the app and extension come later.',
    lesson: 'Sell the reading outcome, not the surfaces.',
    usedBy: ['E9'],
  },
  {
    id: 'dailydevapps',
    name: 'daily.dev /apps today',
    pattern:
      '“One feed. Every surface you read on.” Browser extension, Mobile apps, Web app as three equal tiles; 1M+ · 4.9★ · 30K+ below.',
    lesson: 'The proof exists; the homepage hero does not use it.',
    usedBy: ['E5'],
  },
];

export type Principle = {
  who: string;
  rule: string;
  source: string;
  applied: string[];
};

export const principles: Principle[] = [
  {
    who: 'Nikita Bier',
    rule: '“If you can’t demonstrate value in the first three seconds, it’s over.” Invert time to value so the experience is the aha moment in seconds (Dupe, Death Clock).',
    source: 'Lenny’s Podcast, Aug 2024',
    applied: ['S7', 'S6', 'S3'],
  },
  {
    who: 'Nikita Bier',
    rule: '“Day 1: let people see how the app works before signing up. Metrics nosedive. Day 800: show them nothing more than a logo and a signup button. Metrics spike.” Both doors exist; test which one you are.',
    source: 'X, Oct 2022 (reply to Josh Elman)',
    applied: ['S2', 'S4'],
  },
  {
    who: 'Nikita Bier',
    rule: '“Excessively long sign up flows are fine if it leads to higher activation rates.” Add steps that reach the aha, don’t only remove them.',
    source: 'X thread, Jan 2022',
    applied: ['S7', 'S6'],
  },
  {
    who: 'Nikita Bier',
    rule: 'Every tap is scarce. “Products live and die in the pixels”; onboarding is where the design work matters most. Requiring a profile pic has incredibly high drop-off; prefill from what you already know.',
    source: 'X, Dec 2024; Lenny’s Podcast',
    applied: ['S9', 'S1'],
  },
  {
    who: 'Nikita Bier',
    rule: 'Users need to see your content outside the app after installing, so they remember it exists. A return trigger is the product.',
    source: 'X thread, Jan 2022',
    applied: ['E4', 'E6', 'E9'],
  },
  {
    who: 'Pinterest (Allen Jordan)',
    rule: 'Opening browsing before the wall cut signups at first and raised intent, retention and indexing. Save and Follow on logged-out pages: +5% signups.',
    source: 'Growth Design; growth-designers newsletter',
    applied: ['S3', 'S4', 'S5'],
  },
  {
    who: 'Duolingo',
    rule: 'The lesson before the account. Delaying signup alone drove a 20% lift in DAU.',
    source: 'Duolingo S-1 via Appcues',
    applied: ['S8'],
  },
  {
    who: 'Reddit / Zapier',
    rule: 'Sign in with Google + One Tap ≈ 2x signups (Reddit). One Tap alone +7%, the button +13% (Zapier), with duplicate-account tickets as the cost.',
    source: 'Google Identity case studies; Zapier blog',
    applied: ['S9'],
  },
  {
    who: 'Lazyweb research',
    rule: 'Plain, functional signup screens beat video and illustration in four tests (Ring, AllTrails, Nextdoor, Spotify). Signup is a job; decoration competes with it.',
    source: 'lazyweb.com/research',
    applied: ['S2', 'S1'],
  },
  {
    who: 'Griffel / Andrew Chen',
    rule: 'The fastest-growing consumer sites had minimal homepages: one value line, a form, no nav. Chen’s caveat: only once signups are the priority.',
    source: 'andrewchen.com, 2013',
    applied: ['S2'],
  },
  {
    who: 'Bluesky study (Lancaster, City, TU Darmstadt)',
    rule: 'Starter packs solved the cold start: pack members gained up to 85% more followers and posted 60% more.',
    source: 'arXiv 2501.11605, ICWSM 2025',
    applied: ['S6'],
  },
  {
    who: 'Extension developers',
    rule: 'The post-install welcome screen converts ~8% to a second product; banners before the task hurt trust. Ask when there is no task to interrupt.',
    source: 'dev.to, cross-promoting 18 extensions',
    applied: ['E4', 'E6'],
  },
];

export type Fact = { fact: ReactNode; source: string; applied: string[] };

export const facts: Fact[] = [
  {
    fact: 'About 85% of homepage visitors only ever see the first screen; 54% do nothing at all (no scroll, no click).',
    source: 'landing-hero-experiment-proposal-2026-10',
    applied: ['S1', 'S2', 'S10'],
  },
  {
    fact: 'The landing page converts at a stable 4–5% (about 5.5% on desktop), and it is traffic-starved rather than conversion-starved.',
    source: 'na-acquisition-lever-analysis',
    applied: ['S1'],
  },
  {
    fact: 'homepage_side_by_side lost 16% of signups (23% on Windows). A second offer at equal weight next to the form cannabalizes it.',
    source: 'GrowthBook, Oct 13–18',
    applied: ['E1', 'E2', 'E3', 'E7'],
  },
  {
    fact: '88% of extension installs happen in the signup session; after week 1 only ~0.25% of users ever install. Given the ask is shown, 12–18% install on every surface: the limit is reach, not persuasion.',
    source: 'web-to-extension-conversion-2026-09',
    applied: ['E4', 'E6'],
  },
  {
    fact: 'Extension converters retain +21pp D7 and 2.5x D30 even inside the most engaged stratum. Windows desktop without the extension retains 9.8% in week 1: no return trigger exists for them.',
    source:
      'web-to-extension-conversion-2026-09; week1-retention-no-extension-web-cohort-2026-09',
    applied: ['E9', 'E4'],
  },
  {
    fact: 'Following 10+ tags predicts installs 2.7x and retention. Funnel completers retain 27% vs 7%.',
    source: 'web-to-extension-conversion-2026-09',
    applied: ['S6', 'S7', 'S3'],
  },
  {
    fact: 'onboarding_extension_showcase won +14% extension activation by showing the features at the install moment. signup_strip_column won +14% signups by making the buttons visible.',
    source: 'GrowthBook, Oct 2026',
    applied: ['E4', 'S10'],
  },
  {
    fact: 'About 37% of Google/GitHub attempts hit a boot error after social auth. A bug fix, and probably the single biggest lever on hero signups.',
    source: 'landing-hero-experiment-proposal-2026-10',
    applied: ['S9'],
  },
  {
    fact: '2,971 visitors in 14 days clicked a store CTA and never came back: the store black hole.',
    source: 'landing-hero-experiment-proposal-2026-10',
    applied: ['E4', 'E6'],
  },
];

export const sources: { label: string; url: string }[] = [
  {
    label: 'Lenny’s Podcast: Nikita Bier’s playbook (transcript)',
    url: 'https://github.com/ChatPRD/lennys-podcast-transcripts/blob/main/episodes/nikita-bier/transcript.md',
  },
  {
    label: 'Nikita Bier, 2022 thread (Thread Reader)',
    url: 'https://threadreaderapp.com/thread/1481118406749220868.html',
  },
  {
    label: 'Nikita Bier: logo and a signup button (X)',
    url: 'https://x.com/nikitabier/status/1586816800221630464',
  },
  {
    label: 'Nikita Bier: onboarding feedback, profile pic drop-off (X)',
    url: 'https://x.com/nikitabier/status/1867270647912788365',
  },
  {
    label: 'Lessons from Nikita Bier (Antoine Buteau)',
    url: 'https://www.antoinebuteau.com/lessons-from-nikita-bier/',
  },
  {
    label: 'Pinterest: browsing before the wall (growth-designers)',
    url: 'https://growth-designers.beehiiv.com/p/newsletter-a-b-test-examples',
  },
  {
    label: 'Appcues: Duolingo delayed signup',
    url: 'https://www.appcues.com/blog/the-10-best-user-onboarding-experiences',
  },
  {
    label: 'Google Identity: Reddit case study',
    url: 'https://developers.google.com/identity/sign-in/case-studies/reddit',
  },
  {
    label: 'Zapier: One Tap inline',
    url: 'https://zapier.com/blog/google-one-tap-inline/',
  },
  {
    label: 'Lazyweb: why should sign-up screens be boring?',
    url: 'https://www.lazyweb.com/research/boring-sign-up-screens.md',
  },
  {
    label: 'Andrew Chen: the minimal homepage (guest post)',
    url: 'https://andrewchen.com/the-highest-roi-way-to-increase-signups-make-a-minimal-homepage-guest-post/',
  },
  {
    label: 'Bootstrapping social networks: Bluesky starter packs (arXiv)',
    url: 'https://arxiv.org/abs/2501.11605',
  },
  {
    label: 'Landing Doctors: LinkedIn teardown',
    url: 'https://landingdoctors.com/teardowns/linkedin-com',
  },
  {
    label: 'Cross-promoting 18 Chrome extensions (dev.to)',
    url: 'https://dev.to/ktg0215/how-i-cross-promote-18-chrome-extensions-without-annoying-users-1oa3',
  },
  {
    label: 'TechCrunch: Lapse invite gate',
    url: 'https://techcrunch.com/2023/10/18/lapse-tiktok-app-store-invite-friends/',
  },
  {
    label:
      'daily.dev on the Chrome Web Store (4.9, 2.9K ratings, 400K users, Featured)',
    url: 'https://chromewebstore.google.com/detail/dailydev-the-homepage-dev/jlmpjdjjbgclbocgajdjefcidcncaied',
  },
];
