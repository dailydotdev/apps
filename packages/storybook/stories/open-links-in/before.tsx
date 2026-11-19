import type { ReactElement } from 'react';
import React from 'react';
import { LockIcon } from '@dailydotdev/shared/src/components/icons/Lock';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons/Share';
import { BookmarkIcon } from '@dailydotdev/shared/src/components/icons/Bookmark';
import { CompassIcon } from '@dailydotdev/shared/src/components/icons/Compass';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { BrowserChrome, Phone } from './kit';

const host = 'dev.to';

const paragraphs = [
  'A developer built an automation tool that applied to nearly 1,200 jobs out of 49,000 listings seen, and still got zero offers. The app matched jobs to his skills, rewrote his applications and cover letters, and over three months it produced two interviews.',
  'The numbers say more about the market than about the code: every listing had hundreds of applicants, and the same recruiters saw the same template in different clothes.',
  'What did work was slower and smaller: a referral from a former colleague, a short message to a hiring manager, a demo that solved one real problem.',
  'If you are going to automate anything, automate the research, not the sending. Know the team before they know you.',
];

const PageBody = (): ReactElement => (
  <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background-subtle">
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtlest-tertiary px-4">
      <span className="font-bold typo-callout">DEV Community</span>
      <span className="rounded-10 border border-border-subtlest-secondary px-2.5 py-1 text-text-secondary typo-caption1">
        Log in
      </span>
    </div>
    <div className="flex flex-col gap-3 px-5 pb-6 pt-4">
      <span className="text-text-tertiary typo-caption1">Tom Hale · Nov 1</span>
      <h1 className="font-bold leading-tight typo-title2">
        I applied to 1,200 dev jobs and that&apos;s it, man.
      </h1>
      {paragraphs.map((text) => (
        <p key={text} className="text-text-secondary typo-callout">
          {text}
        </p>
      ))}
    </div>
  </div>
);

// Before 1.26: Apple's Safari view. Done and the read-only URL on top; back,
// forward, share, bookmarks and the compass (Open in Safari) at the bottom,
// always there.
export const SafariViewStill = (): ReactElement => (
  <Phone browser={BrowserChrome.None}>
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary bg-background-subtle px-3">
        <span className="w-14 text-text-link typo-callout">Done</span>
        <span className="flex h-8 flex-1 items-center justify-center gap-1 rounded-10 bg-surface-float text-text-secondary typo-footnote">
          <LockIcon size={IconSize.XSmall} />
          {host}
        </span>
        <span className="flex w-14 justify-end text-text-link">
          <RefreshIcon size={IconSize.Small} />
        </span>
      </div>
      <PageBody />
      <div className="flex h-[3.25rem] shrink-0 items-center justify-around border-t border-border-subtlest-tertiary bg-background-subtle pb-2 text-text-link">
        <ArrowIcon size={IconSize.Medium} className="-rotate-90" />
        <ArrowIcon
          size={IconSize.Medium}
          className="rotate-90 text-text-quaternary"
        />
        <ShareIcon size={IconSize.Medium} />
        <BookmarkIcon size={IconSize.Medium} />
        <CompassIcon size={IconSize.Medium} />
      </div>
      <span className="absolute bottom-16 right-2 rounded-10 bg-text-primary px-2 py-1 text-background-default typo-caption2">
        Open in Safari, always here
      </span>
    </div>
  </Phone>
);
