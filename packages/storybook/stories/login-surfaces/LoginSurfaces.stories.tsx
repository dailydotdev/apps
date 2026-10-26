import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { bareStory } from './frames';
import { LiveFrame } from './device';

const meta: Meta = {
  title: 'Login Surfaces/Inventory',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const img = (name: string): string => `/images/login-surfaces/${name}.jpg`;

type Shot = {
  file: string;
  step: string;
  title: string;
  note: ReactNode;
  device: 'desktop' | 'phone';
  /** The aligned screen, as a live story, when this one changes. */
  after?: { storyId: string; note: ReactNode };
};

const Url = ({ children }: { children: ReactNode }): ReactElement => (
  <code className="break-all font-mono text-text-tertiary typo-caption1">
    {children}
  </code>
);

const Tag = ({
  tone,
  children,
}: {
  tone: 'before' | 'after' | 'same';
  children: ReactNode;
}): ReactElement => (
  <span
    className={classNames(
      'self-start rounded-8 px-2 py-0.5 font-bold typo-caption1',
      tone === 'before' && 'bg-accent-ketchup-default text-white',
      tone === 'after' && 'bg-accent-avocado-default text-white',
      tone === 'same' && 'bg-surface-float text-text-tertiary',
    )}
  >
    {children}
  </span>
);

const frameWidth = (device: Shot['device']): string =>
  device === 'desktop' ? 'w-[32.5rem] max-w-[86vw]' : 'w-60 max-w-[62vw]';

const Capture = ({ file, title, device }: Shot): ReactElement => (
  <a
    href={img(file)}
    target="_blank"
    rel="noreferrer"
    className="block overflow-hidden rounded-12 border border-border-subtlest-tertiary bg-background-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-cabbage-default"
  >
    <img
      src={img(file)}
      alt={title}
      className={classNames(
        'block w-full',
        device === 'phone' && 'aspect-[390/664] object-cover object-top',
      )}
    />
  </a>
);

// A screen that changes shows the production capture next to the aligned
// mock; one that doesn't shows once, marked unchanged.
const Screen = (shot: Shot): ReactElement => {
  const { step, title, note, device, after } = shot;

  return (
    <figure className="flex shrink-0 flex-col gap-2">
      <div className="flex items-start gap-3">
        <div className={classNames('flex flex-col gap-2', frameWidth(device))}>
          <Tag tone={after ? 'before' : 'same'}>
            {after ? 'Before' : 'Unchanged'}
          </Tag>
          <Capture {...shot} />
        </div>
        {after && (
          <div
            className={classNames('flex flex-col gap-2', frameWidth(device))}
          >
            <Tag tone="after">After</Tag>
            <LiveFrame
              storyId={bareStory(after.storyId)}
              title={`${title}, aligned`}
              width={device === 'desktop' ? 1440 : 390}
              height={device === 'desktop' ? 900 : 664}
            />
          </div>
        )}
      </div>
      <figcaption className="flex max-w-[32.5rem] flex-col gap-0.5">
        <span className="font-bold uppercase text-accent-cabbage-default typo-caption2">
          {step}
        </span>
        <span className="font-bold typo-callout">{title}</span>
        <span className="text-text-tertiary typo-footnote">{note}</span>
        {after && (
          <span className="text-text-secondary typo-footnote">
            After: {after.note}
          </span>
        )}
      </figcaption>
    </figure>
  );
};

const Surface = ({
  title,
  note,
  shots,
}: {
  title: string;
  note: ReactNode;
  shots: Shot[];
}): ReactElement => (
  <section className="flex flex-col gap-4">
    <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-3">
      <h2 className="font-bold typo-title3">{title}</h2>
      <p className="max-w-[48rem] text-text-tertiary typo-callout">{note}</p>
    </div>
    <div className="flex items-start gap-8 overflow-x-auto pb-2">
      {shots.map((shot) => (
        <Screen key={shot.file} {...shot} />
      ))}
    </div>
  </section>
);

const glance: [string, string, ReactNode, ReactNode, ReactNode, ReactNode][] = [
  [
    'Webapp desktop',
    'app.daily.dev',
    <>
      Marketing landing on <Url>daily.dev/</Url>
    </>,
    'None. The page is server-rendered and paints at once.',
    'Google, GitHub, email',
    'The landing is the source of truth. Its sign-up funnel takes the landing’s block and art.',
  ],
  [
    'Webapp mobile',
    'app.daily.dev',
    'Same marketing landing, plus Google One Tap sheet',
    'None',
    'Google, GitHub, email',
    'Unchanged.',
  ],
  [
    'PWA',
    '/?pwa=true',
    'Same marketing landing',
    <>
      OS splash: app icon on <Url>#151618</Url> (manifest)
    </>,
    'Google, GitHub, email',
    'Unchanged.',
  ],
  [
    'Android app',
    '/?android=true',
    <>
      Onboarding funnel (<Url>/onboarding</Url>), not the landing
    </>,
    'Empty dark page with the logged-in bottom nav',
    'Google, GitHub, email',
    'Funnel takes the landing’s block and art; loading shows the splash art.',
  ],
  [
    'iOS app',
    '/?ios=true',
    <>
      Onboarding funnel (<Url>/onboarding</Url>), not the landing, under the App
      Tracking Transparency prompt
    </>,
    'Black, then the native splash: the illustrated room with the logo',
    'Google, Apple, email',
    'Funnel takes the landing’s block and art, Apple kept; the splash shows the boy and Patchy on the platform.',
  ],
  [
    'Chrome / Edge extension',
    'r.daily.dev/install',
    <>
      <Url>/activate</Url>: &quot;Let&apos;s activate your new tab&quot;
    </>,
    'New tab is blank until auth and flags load, then the feed with a log in banner',
    <>
      Hands off to webapp <Url>/onboarding?r=extension</Url>
    </>,
    'The hand-off funnel takes the landing’s block and art; the /activate demo video shows it.',
  ],
];

const aligned: [string, string][] = [
  [
    'One first screen for the same moment.',
    'The funnel takes the landing’s sign-up block and boy-and-dog art on desktop, Android and iOS. The desk photo and illustrated room are gone.',
  ],
  [
    'One headline.',
    '"Where developers discover what’s next." with the period and curly apostrophe everywhere.',
  ],
  [
    'One set of buttons.',
    'White Google, then the second provider and email as filled dark buttons with icons. No "or" divider.',
  ],
  [
    'Legal line under the buttons,',
    'on desktop and phone, followed by "Already have an account? Log in".',
  ],
  [
    'The same character world on iOS too.',
    'The screen behind the tracking prompt uses the landing art, and the native splash shows the boy and Patchy on the glowing platform. The splash is SplashImage in the iOS repo, so it ships with an app release.',
  ],
  [
    'Android loads on the same art.',
    'The loading state shows the splash art with the logo instead of an empty page with the logged-in bottom nav.',
  ],
];

const stillOpen: [string, string][] = [
  [
    'iOS keeps Apple in place of GitHub.',
    'On purpose: the App Store requires Sign in with Apple next to other social logins.',
  ],
  ['Mobile web stacks One Tap over the landing,', 'covering the third button.'],
];

const findings: [string, string][] = [
  [
    'Two different first screens for the same moment.',
    'The marketing landing (3D boy and dog) and the funnel (desk photo on desktop, illustrated room on mobile) each have their own look.',
  ],
  [
    'Headline punctuation differs.',
    'The landing reads "discover what’s next." with a period and a curly apostrophe; the funnel drops the period and uses a straight one.',
  ],
  [
    'Button styles differ.',
    'Landing: white Google, dark filled GitHub and email with icons. Funnel: white Google and GitHub, outlined email with no icon.',
  ],
  [
    'Legal line moves.',
    'Under the buttons on the landing, in the page footer on the desktop funnel, and not visible on the mobile funnel.',
  ],
  [
    'Brand mark placement differs.',
    'Top-left wordmark in the landing header, centered wordmark inside the funnel.',
  ],
  [
    'iOS swaps GitHub for Apple.',
    'Every other surface offers Google and GitHub; the iOS app offers Google and Apple, and its splash uses a third artwork.',
  ],
  [
    'Android loads through a logged-in shell.',
    'The bottom nav flashes before the funnel appears.',
  ],
  ['Mobile web stacks One Tap over the landing,', 'covering the third button.'],
];

const FindingList = ({
  items,
}: {
  items: [string, string][];
}): ReactElement => (
  <ol className="flex max-w-[50rem] list-decimal flex-col gap-3 pl-6 text-text-secondary typo-callout">
    {items.map(([lead, rest]) => (
      <li key={lead}>
        <strong className="text-text-primary">{lead}</strong> {rest}
      </li>
    ))}
  </ol>
);

const Inventory = (): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-12">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          Before: production, Oct 25, 2026, logged out · After: mock
        </p>
        <h1 className="font-bold typo-title1">
          daily.dev login surfaces, before and after
        </h1>
        <p className="text-text-secondary typo-callout">
          The first screen a signed-out person sees on each surface, the loading
          state before it, and the sign-up screen one tap away. Screens that
          change show the production capture next to the aligned mock; the rest
          are marked unchanged. Click a capture for full size.
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          At a glance
        </h2>
        <div className="overflow-x-auto rounded-12 border border-border-subtlest-tertiary bg-background-subtle">
          <table className="w-full min-w-[60rem] border-collapse typo-footnote">
            <thead>
              <tr>
                {[
                  'Surface',
                  'Opens',
                  'Lands on today',
                  'Loading today',
                  'Providers',
                  'After the alignment',
                ].map((head) => (
                  <th
                    key={head}
                    className="border-b border-border-subtlest-tertiary px-3.5 py-3 text-left font-normal uppercase text-text-tertiary typo-caption1"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {glance.map(
                ([surface, opens, lands, loading, providers, after]) => (
                  <tr
                    key={surface}
                    className="border-b border-border-subtlest-tertiary last:border-0"
                  >
                    <td className="px-3.5 py-3 align-top font-bold">
                      {surface}
                    </td>
                    <td className="px-3.5 py-3 align-top">
                      <Url>{opens}</Url>
                    </td>
                    <td className="px-3.5 py-3 align-top">{lands}</td>
                    <td className="px-3.5 py-3 align-top">{loading}</td>
                    <td className="px-3.5 py-3 align-top">{providers}</td>
                    <td className="px-3.5 py-3 align-top text-text-primary">
                      {after}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Surface
        title="Webapp · desktop"
        note="1440 × 900. Sign up in the header leads to the onboarding funnel."
        shots={[
          {
            file: '01-desktop-landing',
            step: 'First screen',
            title: 'Marketing landing',
            note: <Url>daily.dev/</Url>,
            device: 'desktop',
          },
          {
            file: '03-desktop-signup',
            step: 'Sign up',
            title: 'Onboarding funnel',
            note: <Url>/onboarding</Url>,
            device: 'desktop',
            after: {
              storyId: 'login-surfaces-aligned-signup--desktop',
              note: 'the landing’s sign-up block and art.',
            },
          },
        ]}
      />

      <Surface
        title="Webapp · mobile browser and PWA"
        note="iPhone 14 viewport. The PWA start URL renders the same landing; its only extra is the OS splash."
        shots={[
          {
            file: '05-mobile-landing',
            step: 'First screen',
            title: 'Landing + One Tap',
            note: "One Tap follows Google's language, here Hebrew.",
            device: 'phone',
          },
          {
            file: '09-pwa-start',
            step: 'PWA start',
            title: 'Same landing',
            note: <Url>/?pwa=true</Url>,
            device: 'phone',
          },
        ]}
      />

      <Surface
        title="Android app"
        note={
          <>
            Pixel 7 viewport with <Url>?android=true</Url>, the flag the app
            passes. The app skips the landing and opens the funnel directly.
          </>
        }
        shots={[
          {
            file: '07-android-landing-loading',
            step: 'Loading',
            title: 'Shell with bottom nav',
            note: 'Shows logged-in navigation before redirecting.',
            device: 'phone',
            after: {
              storyId: 'login-surfaces-aligned-signup--android-loading',
              note: 'the splash art with the app icon, no navigation.',
            },
          },
          {
            file: '07-android-landing',
            step: 'First screen',
            title: 'Onboarding funnel',
            note: <Url>/onboarding?android=true</Url>,
            device: 'phone',
            after: {
              storyId: 'login-surfaces-aligned-signup--phone',
              note: 'the landing’s sign-up block and art.',
            },
          },
        ]}
      />

      <Surface
        title="iOS app"
        note={
          <>
            The real app from the <Url>dailydotdev/ios</Url> repo on an iPhone
            17 simulator. It loads <Url>daily.dev/?ios=true</Url> and lands on
            the funnel, with Apple in place of GitHub.
          </>
        }
        shots={[
          {
            file: '13-ios-splash',
            step: 'Loading',
            title: 'Native splash',
            note: 'SplashImage in the iOS repo, not this one.',
            device: 'phone',
            after: {
              storyId: 'login-surfaces-aligned-signup--ios-splash-screen',
              note: 'the boy and Patchy on the glowing platform.',
            },
          },
          {
            file: '15-ios-tracking-prompt',
            step: 'First launch',
            title: 'Tracking prompt on top',
            note: 'App Tracking Transparency, shown once.',
            device: 'phone',
            after: {
              storyId: 'login-surfaces-aligned-signup--ios-tracking',
              note: 'over the aligned funnel. See Tracking prompt timing for when to ask.',
            },
          },
          {
            file: '14-ios-first',
            step: 'First screen',
            title: 'Onboarding funnel',
            note: 'Google and Apple, then email.',
            device: 'phone',
            after: {
              storyId: 'login-surfaces-aligned-signup--ios',
              note: 'the landing’s block and art, Apple kept.',
            },
          },
        ]}
      />

      <Surface
        title="Browser extension · Chrome and Edge"
        note={
          <>
            Install opens <Url>r.daily.dev/install</Url>, which lands on the
            activate page. The extension can&apos;t run OAuth from its own
            origin, so every sign-in hands off to the webapp funnel with{' '}
            <Url>r=extension</Url>.
          </>
        }
        shots={[
          {
            file: '10-extension-install',
            step: 'First screen after install',
            title: 'Activate new tab',
            note: <Url>daily.dev/activate</Url>,
            device: 'desktop',
            after: {
              storyId: 'login-surfaces-aligned-signup--extension-activate',
              note: 'the demo video shows the aligned page.',
            },
          },
          {
            file: '11-extension-signup',
            step: 'Sign up',
            title: 'Onboarding funnel',
            note: <Url>/onboarding?r=extension</Url>,
            device: 'desktop',
            after: {
              storyId: 'login-surfaces-aligned-signup--desktop',
              note: 'the landing’s sign-up block and art.',
            },
          },
          {
            file: '16-extension-newtab',
            step: 'Every new tab, signed out',
            title: 'Feed with a log in banner',
            note: 'Edge. "Unlock the full daily.dev experience" over the feed, plus a sign in strip.',
            device: 'desktop',
          },
        ]}
      />

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          Not captured
        </h2>
        <div className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4">
          <h3 className="font-bold typo-callout">Opera and Firefox</h3>
          <p className="text-text-tertiary typo-footnote">
            Build branches exist in the rspack config, but nothing releases
            them. Only Chrome and Edge ship.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          What doesn&apos;t line up today
        </h2>
        <FindingList items={findings} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          After: now aligned
        </h2>
        <FindingList items={aligned} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          After: still different
        </h2>
        <FindingList items={stillOpen} />
      </section>
    </div>
  </div>
);

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <Inventory />,
};
