import { ProgressStyle } from './shell';

// The options still open, shown on Design choices and on their own pages.

export const progressOptions: {
  id: string;
  style?: ProgressStyle;
  title: string;
  from: string;
  note: string;
  picked?: boolean;
}[] = [
  {
    id: 'progress-chips',
    style: ProgressStyle.Chips,
    title: 'A. Answer chips (chosen)',
    from: 'Our idea, built on the review-step pattern',
    picked: true,
    note: "Each finished step becomes a chip holding what you chose: Account, Acme, Starter. So it's progress and a running summary in one, and you can see what you're buying before you pay. The current chip is the only lit thing, and it can't be mistaken for tabs because the chips change as you go.",
  },
  {
    id: 'progress-glow',
    style: ProgressStyle.Glow,
    title: 'B. Glowing line',
    from: 'Deck',
    note: "The most premium, and the closest to the landing page. Thin segments, with the current one glowing. It says where you are, but not what's next, and has no check marks.",
  },
  {
    id: 'progress-journey',
    style: ProgressStyle.Journey,
    title: 'C. Vertical journey',
    from: 'Lightspark, Remote',
    note: 'The whole path is always visible, with a hint for the current step. It feels the most like a serious application, but it takes width from the form, and needs another pattern on phones.',
  },
  {
    id: 'progress-dock',
    style: ProgressStyle.Dock,
    title: 'D. Dots in the button bar',
    from: 'Riverside',
    note: "Progress and the next action sit in one bar, using the funnel's own glass bar. Very tidy, but screens with no Continue button, like sign-up, have nowhere to put it.",
  },
  {
    id: 'progress-card',
    style: ProgressStyle.Card,
    title: 'E. Checklist card',
    from: 'Tembo',
    note: 'A percentage and a checklist on the right. Reassuring and familiar from setup guides, but it competes with the page preview, and disappears on full-box screens like payment.',
  },
  {
    id: 'progress-rail',
    style: ProgressStyle.Rail,
    title: 'F. Connected steps',
    from: 'The last round',
    note: "Clear and standard, with check marks and a filling line. It works, but it looks like everyone else's stepper.",
  },
];

export const variations: [string, string, string][] = [
  [
    'crew-line',
    'Default. Crew and one line',
    'Chosen, and in the flow. The crew stands on the full round base, with the headline, subtitle and agents above it. It stays on the dark landing look, and says what the product does.',
  ],
  [
    'quote',
    '1. Big quote',
    "A founder talking to founders. The strongest for trust, but it needs a person's approval for this use. Yahia's quote is about daily.dev Ads.",
  ],
  [
    'logos',
    '2. Crew and company logos',
    'Recognised names, kept warm by the art. These companies buy through Enterprise, so the wording says "reaching developers on daily.dev" and no more. Worth a test later.',
  ],
  [
    'stats',
    '3. Stats',
    'Speaks to why agents matter. It dates quickly, so the numbers need a monthly refresh, and #1 in AI answers carries a measurement caveat.',
  ],
  [
    'awards',
    '4. Awards and ratings',
    'Easy to trust at a glance, but they describe the developer app, not this product. This one is the weakest for a buyer.',
  ],
  [
    'brand',
    '5. Brand colour and one line',
    'The boldest, and the fastest to read. It breaks from the dark landing page, and the plain line repeats what they just read.',
  ],
  [
    'crew',
    '6. Crew image only',
    'The same art with nothing to read. The most memorable, but it says nothing about value.',
  ],
];
