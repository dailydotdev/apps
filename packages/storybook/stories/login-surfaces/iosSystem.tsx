import type { ReactElement, ReactNode } from 'react';
import React from 'react';

// Apple's App Tracking Transparency alert over whatever screen is showing.
// Its body is the app's NSUserTrackingUsageDescription; the icon, title and
// buttons are system UI the app can't change. The orange tile with the blue
// badge stands in for Apple's tracking glyph.
export const IOSTrackingAlert = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="relative min-h-dvh w-full">
    {children}
    <div className="absolute inset-0 z-3 flex items-center justify-center bg-overlay-quaternary-onion px-6">
      <div className="flex w-full max-w-[19rem] flex-col gap-3 rounded-24 bg-surface-float p-6 backdrop-blur-xl">
        <div className="relative size-12 rounded-12 bg-accent-bun-default">
          <span className="absolute -bottom-1 -right-1 size-5 rounded-6 bg-accent-blueCheese-default" />
        </div>
        <p className="font-bold text-text-primary typo-callout">
          Allow “daily.dev” to track your activity across other companies’ apps
          and websites?
        </p>
        <p className="text-text-tertiary typo-footnote">
          Your data helps us measure the effectiveness of our advertising
          campaigns and improve how we reach new users.
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {['Ask App Not to Track', 'Allow'].map((label) => (
            <span
              key={label}
              className="flex h-11 items-center justify-center rounded-16 bg-surface-hover text-text-primary typo-callout"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);
