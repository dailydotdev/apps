import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import ExtensionProviders, { bootAsAnonymous } from '../extension/_providers';
import type { CookieCopy } from './kit';
import { CookieCard, LoggedOutExplore } from './kit';
import type { HeadlineCopy } from './banner';
import { variantById } from './variants';
import type { FrameArgs } from './frames';

/** Production's gate: `usePublicPageSignupBannerGate` (laptop, 1,020px). */
const STRIP_MIN_WIDTH = 1020;

/**
 * The page each frame loads: the logged-out Explore page at the iframe's
 * real width, with one strip and the cookie card. Hidden from the sidebar;
 * the review pages embed it. Accept / Reject / × answer the card, and the
 * chip brings it back.
 */
const CookieStripFrame = ({ variant, cookie, consent, copy }: FrameArgs) => {
  const [width, setWidth] = useState(() => window.innerWidth);
  const [answered, setAnswered] = useState(consent === 'answered');
  const { Strip } = variantById(variant);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => setAnswered(consent === 'answered'), [consent]);

  return (
    <div data-frame-ready>
      <LoggedOutExplore width={width} />
      {width >= STRIP_MIN_WIDTH && (
        <Strip consentOpen={!answered} copy={copy as HeadlineCopy} />
      )}
      {answered ? (
        <button
          type="button"
          onClick={() => setAnswered(false)}
          className="fixed left-1/2 top-4 z-max -translate-x-1/2 rounded-10 bg-text-primary px-3 py-1.5 font-bold text-surface-invert typo-footnote"
        >
          Show the cookie banner again
        </button>
      ) : (
        <CookieCard
          key={cookie}
          copy={cookie as CookieCopy}
          onAnswer={() => setAnswered(true)}
        />
      )}
    </div>
  );
};

const meta: Meta<FrameArgs> = {
  title: 'Cookie banner & Signup strip/Frame',
  tags: ['!dev'],
  parameters: { layout: 'fullscreen' },
  args: { variant: 'today', cookie: 'short', consent: 'open', copy: 'geo' },
  beforeEach: () => bootAsAnonymous(),
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <Story />
      </ExtensionProviders>
    ),
  ],
  render: (args): ReactElement => <CookieStripFrame {...args} />,
};

export default meta;

export const CookieStripFrameStory: StoryObj<FrameArgs> = {
  name: 'Cookie strip frame',
};
