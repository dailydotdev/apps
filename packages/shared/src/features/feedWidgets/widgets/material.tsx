import type { CSSProperties, ReactElement } from 'react';
import React from 'react';

export const happeningNowGlow: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 60% at 0% 0%, color-mix(in srgb, var(--theme-accent-avocado-default) 22%, transparent) 0%, transparent 70%)',
};

export const todoListGlow: CSSProperties = {
  backgroundImage:
    'radial-gradient(90% 60% at 100% 0%, color-mix(in srgb, var(--theme-accent-cabbage-default) 18%, transparent) 0%, transparent 70%)',
};

export const LiveDot = (): ReactElement => (
  <span aria-hidden className="relative flex size-4 shrink-0 items-center">
    <span className="absolute left-1 size-2 animate-ping rounded-max bg-accent-avocado-default opacity-50 motion-reduce:animate-none" />
    <span className="relative left-1 size-2 rounded-max bg-accent-avocado-default" />
  </span>
);
