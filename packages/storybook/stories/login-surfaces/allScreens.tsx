import type { ReactElement } from 'react';
import React from 'react';
import type { Device } from './device';
import { DevicePair, devices } from './device';
import type { Platform } from './inventory';

// Every aligned screen of a platform on one page, each at its device's real
// size with the production capture beside it. The single-screen stories in
// Aligned signup are what it embeds, so they stay out of the sidebar.
const screens: {
  platform: Platform;
  title: string;
  note?: string;
  device: Device;
  before: string;
  storyId: string;
}[] = [
  {
    platform: 'web',
    title: '/onboarding · desktop',
    note: 'Also the extension’s sign-up hand-off, /onboarding?r=extension.',
    device: devices.laptop,
    before: '03-desktop-signup',
    storyId: 'login-surfaces-aligned-signup--desktop',
  },
  {
    platform: 'mobile',
    title: '/onboarding · Android app',
    device: devices.pixel,
    before: '07-android-landing',
    storyId: 'login-surfaces-aligned-signup--phone',
  },
  {
    platform: 'web',
    title: 'Invite link · desktop',
    note: '/join?cid=…&userid=… lands on the funnel; it keeps who invited you above the headline.',
    device: devices.laptop,
    before: '24-invite-desktop',
    storyId: 'login-surfaces-aligned-signup--desktop-invite',
  },
  {
    platform: 'web',
    title: 'Invite link · mobile web',
    note: 'The web, so the legal line stays under the buttons.',
    device: devices.pixel,
    before: '25-invite-pixel',
    storyId: 'login-surfaces-aligned-signup--phone-invite',
  },
  {
    platform: 'mobile',
    title: '/onboarding · iOS app',
    note: 'Apple stays in GitHub’s place, as the App Store requires.',
    device: devices.iphone,
    before: '14-ios-first',
    storyId: 'login-surfaces-aligned-signup--ios',
  },
  {
    platform: 'mobile',
    title: 'iOS app · splash',
    note: 'SplashImage in the iOS repo; ships with an app release.',
    device: devices.iphone,
    before: '13-ios-splash',
    storyId: 'login-surfaces-aligned-signup--ios-splash-screen',
  },
  {
    platform: 'mobile',
    title: 'Android app · loading',
    device: devices.pixel,
    before: '07-android-landing-loading',
    storyId: 'login-surfaces-aligned-signup--android-loading',
  },
  {
    platform: 'web',
    title: 'Extension · /activate',
    note: 'The real page playing the rebuilt Keep it demo.',
    device: devices.laptop,
    before: '10-extension-install',
    storyId: 'login-surfaces-aligned-signup--extension-activate',
  },
  {
    platform: 'mobile',
    title: 'iOS app · tracking prompt',
    note: 'The chosen moment: right after the user answers "How did you hear about us?" in onboarding, not on launch over signup.',
    device: devices.iphone,
    before: '15-ios-tracking-prompt',
    storyId: 'login-surfaces-mobile-tracking-prompt-timing--after-acquisition',
  },
];

export const AlignedScreens = ({
  platform,
}: {
  platform: Platform;
}): ReactElement => (
  <div className="min-h-screen bg-background-subtle px-4 py-8 text-text-primary tablet:px-10">
    <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-16">
      <header className="flex max-w-[48rem] flex-col gap-2">
        <p className="font-bold uppercase text-text-tertiary typo-caption1">
          Mock · before is production, after is aligned
        </p>
        <h1 className="font-bold typo-title1">
          {platform === 'web' ? 'Web' : 'Mobile apps'}: aligned screens
        </h1>
        <p className="text-text-secondary typo-callout">
          Every screen that changes, at its device&apos;s real size: the
          production capture next to the aligned version.
        </p>
      </header>
      {screens
        .filter((screen) => screen.platform === platform)
        .map(({ title, note, device, before, storyId }) => (
          <section key={storyId + title} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-border-subtlest-tertiary pb-3">
              <h2 className="font-bold typo-title3">{title}</h2>
              {note && (
                <p className="text-text-tertiary typo-callout">{note}</p>
              )}
            </div>
            <DevicePair device={device} storyId={storyId} before={before} />
          </section>
        ))}
    </div>
  </div>
);
