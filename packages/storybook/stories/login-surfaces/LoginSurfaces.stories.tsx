import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { DesktopFrame } from '../onboarding-fixes/kit';
import { bareStory } from './frames';

const meta: Meta = {
  title: 'Login Surfaces/Inventory',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const img = (name: string): string => `/images/login-surfaces/${name}.jpg`;

type Shot = {
  file: string;
  /** A live story in place of the capture, for screens that are mocked. */
  storyId?: string;
  step: string;
  title: string;
  note: ReactNode;
  device: 'desktop' | 'phone';
};

const Url = ({ children }: { children: ReactNode }): ReactElement => (
  <code className="break-all font-mono text-text-tertiary typo-caption1">
    {children}
  </code>
);

const Screen = ({
  file,
  storyId,
  step,
  title,
  note,
  device,
}: Shot): ReactElement => (
  <figure
    className={classNames(
      'flex shrink-0 flex-col gap-2',
      device === 'desktop' ? 'w-[32.5rem] max-w-[86vw]' : 'w-60 max-w-[62vw]',
    )}
  >
    {storyId ? (
      <DesktopFrame
        storyId={bareStory(storyId)}
        title={title}
        width={device === 'desktop' ? 1440 : 390}
        height={device === 'desktop' ? 900 : 664}
      />
    ) : (
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
    )}
    <figcaption className="flex flex-col gap-0.5">
      <span className="font-bold uppercase text-accent-cabbage-default typo-caption2">
        {step}
      </span>
      <span className="font-bold typo-callout">{title}</span>
      <span className="text-text-tertiary typo-footnote">{note}</span>
    </figcaption>
  </figure>
);

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
    <div className="flex items-start gap-5 overflow-x-auto pb-2">
      {shots.map((shot) => (
        <Screen key={shot.file} {...shot} />
      ))}
    </div>
  </section>
);

const glance = (
  aligned: boolean,
): [string, string, ReactNode, ReactNode, ReactNode][] => [
  [
    'Webapp desktop',
    'app.daily.dev',
    <>
      Marketing landing on <Url>daily.dev/</Url>
    </>,
    'None. The page is server-rendered and paints at once.',
    'Google, GitHub, email',
  ],
  [
    'Webapp mobile',
    'app.daily.dev',
    'Same marketing landing, plus Google One Tap sheet',
    'None',
    'Google, GitHub, email',
  ],
  [
    'PWA',
    '/?pwa=true',
    'Same marketing landing',
    <>
      OS splash: app icon on <Url>#151618</Url> (manifest)
    </>,
    'Google, GitHub, email',
  ],
  [
    'Android app',
    '/?android=true',
    <>
      Onboarding funnel (<Url>/onboarding</Url>), not the landing
      {aligned && ', with the landing’s block and art'}
    </>,
    aligned
      ? 'The splash art with the logo'
      : 'Empty dark page with the logged-in bottom nav',
    'Google, GitHub, email',
  ],
  [
    'iOS app',
    '/?ios=true',
    <>
      Onboarding funnel (<Url>/onboarding</Url>), not the landing
      {aligned && ', with the landing’s block and art'}, under the App Tracking
      Transparency prompt
    </>,
    aligned
      ? 'Black, then the native splash: the landing art with the logo'
      : 'Black, then the native splash: the illustrated room with the logo',
    'Google, Apple, email',
  ],
  [
    'Chrome / Edge extension',
    'r.daily.dev/install',
    <>
      <Url>/activate</Url>: &quot;Let&apos;s activate your new tab&quot;
    </>,
    'New tab is blank until auth and flags load',
    <>
      Hands off to webapp <Url>/onboarding?r=extension</Url>
      {aligned && ': Google, GitHub, email'}
    </>,
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
    'One artwork on iOS too.',
    'The native splash and the screen behind the tracking prompt use the landing art. The splash is SplashImage in the iOS repo, so it ships with an app release.',
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

const Inventory = ({
  isAligned = false,
}: {
  isAligned?: boolean;
}): ReactElement => (
  <div className="min-h-screen bg-background-default px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[75rem] flex-col gap-12">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          {isAligned
            ? 'Mock · the same surfaces after the alignment'
            : 'Captured Oct 25, 2026 · production · logged out · fresh browser'}
        </p>
        <h1 className="font-bold typo-title1">
          {isAligned
            ? 'daily.dev login surfaces, aligned'
            : 'daily.dev login surfaces'}
        </h1>
        <p className="text-text-secondary typo-callout">
          {isAligned
            ? 'The same page with every signup screen aligned to the marketing landing. Funnel screens are live stories from Aligned signup; everything else is unchanged from the captures.'
            : 'The first screen a signed-out person sees on each surface, the loading state before it, and the sign-up screen one tap away. Click any screen for the full-size capture.'}
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          At a glance
        </h2>
        <div className="overflow-x-auto rounded-12 border border-border-subtlest-tertiary bg-background-subtle">
          <table className="w-full min-w-[47.5rem] border-collapse typo-footnote">
            <thead>
              <tr>
                {[
                  'Surface',
                  'Opens',
                  'Lands on',
                  'Loading state',
                  'Providers on first screen',
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
              {glance(isAligned).map(
                ([surface, opens, lands, loading, providers]) => (
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
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Surface
        title="Webapp · desktop"
        note="1440 × 900. Sign up in the header leads to the onboarding funnel, a different design from the landing."
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
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--desktop'
              : undefined,
            step: 'Sign up',
            title: 'Onboarding funnel',
            note: <Url>/onboarding</Url>,
            device: 'desktop',
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
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--android-loading'
              : undefined,
            step: 'Loading',
            title: isAligned ? 'Splash art' : 'Shell with bottom nav',
            note: isAligned
              ? 'The same art as the iOS splash, no navigation.'
              : 'Shows logged-in navigation before redirecting.',
            device: 'phone',
          },
          {
            file: '07-android-landing',
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--phone'
              : undefined,
            step: 'First screen',
            title: 'Onboarding funnel',
            note: <Url>/onboarding?android=true</Url>,
            device: 'phone',
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
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--ios-splash-screen'
              : undefined,
            step: 'Loading',
            title: 'Native splash',
            note: 'SplashImage in the iOS repo, not this one.',
            device: 'phone',
          },
          {
            file: '15-ios-tracking-prompt',
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--ios-tracking'
              : undefined,
            step: 'First launch',
            title: 'Tracking prompt on top',
            note: 'App Tracking Transparency, shown once.',
            device: 'phone',
          },
          {
            file: '14-ios-first',
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--ios'
              : undefined,
            step: 'First screen',
            title: 'Onboarding funnel',
            note: 'Google and Apple, then email.',
            device: 'phone',
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
          },
          {
            file: '11-extension-signup',
            storyId: isAligned
              ? 'login-surfaces-aligned-signup--desktop'
              : undefined,
            step: 'Sign up',
            title: 'Onboarding funnel',
            note: <Url>/onboarding?r=extension</Url>,
            device: 'desktop',
          },
        ]}
      />

      <section className="flex flex-col gap-4">
        <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
          Not captured
        </h2>
        <div className="grid grid-cols-1 gap-4 laptop:grid-cols-2">
          {[
            [
              'Extension new tab, signed out',
              'Needs the extension loaded. Code path: blank until GrowthBook and auth are ready, then the feed with HijackingLoginStrip on laptop widths and ExtensionSignInContent in the feed. See Extension → HijackingStrip.',
            ],
            [
              'Opera and Firefox',
              'Build branches exist in the rspack config, but nothing releases them. Only Chrome and Edge ship.',
            ],
          ].map(([title, body]) => (
            <div
              key={title}
              className="flex flex-col gap-2 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-4"
            >
              <h3 className="font-bold typo-callout">{title}</h3>
              <p className="text-text-tertiary typo-footnote">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {isAligned ? (
        <>
          <section className="flex flex-col gap-4">
            <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
              Now aligned
            </h2>
            <FindingList items={aligned} />
          </section>
          <section className="flex flex-col gap-4">
            <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
              Still different
            </h2>
            <FindingList items={stillOpen} />
          </section>
        </>
      ) : (
        <section className="flex flex-col gap-4">
          <h2 className="border-b border-border-subtlest-tertiary pb-3 font-bold typo-title3">
            What doesn&apos;t line up today
          </h2>
          <FindingList items={findings} />
        </section>
      )}
    </div>
  </div>
);

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <Inventory />,
};

export const Aligned: StoryObj = {
  name: 'Overview · aligned',
  render: () => <Inventory isAligned />,
};
