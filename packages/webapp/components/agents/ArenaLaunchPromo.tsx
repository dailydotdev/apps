import type { ReactElement } from 'react';
import React from 'react';

interface ArenaLaunchPromoProps {
  visible: boolean;
  tweetUrl: string;
}

export const ArenaLaunchPromo = ({
  visible,
  tweetUrl,
}: ArenaLaunchPromoProps): ReactElement => {
  return (
    <section
      aria-hidden={!visible}
      className={`relative hidden overflow-hidden rounded-10 border border-border-subtlest-tertiary bg-surface-float px-3 py-2 transition-opacity duration-300 laptop:flex ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="from-accent-cabbage-default/10 to-accent-onion-default/10 pointer-events-none absolute inset-0 bg-gradient-to-r via-transparent" />
      <div className="bg-accent-avocado-default/10 pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl" />
      <div className="relative flex w-full items-center justify-between gap-3">
        <p className="text-text-secondary typo-footnote">
          Think Arena should blow up? Same.
        </p>
        <a
          href={tweetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-invert relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-8 bg-surface-invert px-2.5 py-1 font-bold typo-caption2"
        >
          <span className="pointer-events-none absolute inset-0">
            <span className="via-white/20 absolute left-1/2 top-1/2 h-[175%] w-[58%] -translate-x-1/2 -translate-y-1/2 rotate-[12deg] bg-gradient-to-r from-transparent to-transparent opacity-[0.18] blur-[2px]" />
          </span>
          <span className="relative z-1">Like on X</span>
        </a>
      </div>
    </section>
  );
};
