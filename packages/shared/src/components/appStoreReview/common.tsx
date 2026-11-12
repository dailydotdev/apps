import type { ReactElement } from 'react';
import React from 'react';

// Our own ask around Apple's review tools. Apple's rating pop-up is requested
// on its own a moment after a surface lands, never from a tap, and whether it
// shows is Apple's call. Every button opens the App Store's write-a-review
// screen, which always works, so each surface stands on its own.
export const appStoreReviewCopy = {
  headline: 'A little love goes a long way.',
  emoji: '❤️',
  text: 'If daily.dev has made your day a little better, a quick rating would mean a lot to us.',
  cta: 'Rate daily.dev',
  ctaLabel: 'Rate daily.dev on the App Store',
  dismiss: 'Not now',
};

// Apple's sample asks only after people pause on a finished step.
export const appStoreReviewRequestDelayMs = 2000;

// A non-breaking space keeps the emoji with the last word, and screen
// readers skip it.
export const AskHeadline = (): ReactElement => (
  <>
    {appStoreReviewCopy.headline}
    {' '}
    <span aria-hidden>{appStoreReviewCopy.emoji}</span>
  </>
);
