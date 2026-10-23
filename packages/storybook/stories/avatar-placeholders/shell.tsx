import type { ReactElement, ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import classNames from 'classnames';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Character } from './data';
import { AvatarMode, getCharacterSrc } from './data';

const motionCss = `
@keyframes apRise {
  from { opacity: 0; transform: translateY(10px); filter: blur(8px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes apSwap {
  from { opacity: 0; transform: scale(0.92); filter: blur(6px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes apReveal {
  0% { opacity: 0; transform: translateY(16px) scale(0.9); filter: blur(14px); }
  100% { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes apHalo {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 0.55; transform: none; }
}
.ap-rise { animation: apRise 420ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--ap-delay, 0ms); }
.ap-swap { animation: apSwap 320ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--ap-delay, 0ms); }
.ap-reveal { animation: apReveal 720ms cubic-bezier(0.16, 1, 0.3, 1) both; animation-delay: var(--ap-delay, 0ms); }
.ap-halo { animation: apHalo 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ap-press { transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1); }
.ap-press:active { transform: scale(0.96); }
.ap-balance { text-wrap: balance; }
.ap-pretty { text-wrap: pretty; }
.ap-tabular { font-variant-numeric: tabular-nums; }
.ap-ring { box-shadow: 0 0 0 2px var(--theme-background-default), 0 0 0 4px var(--theme-accent-cabbage-default); }
.ap-stack > * + * { margin-left: -0.5rem; }
.ap-stack > * { box-shadow: 0 0 0 2px var(--theme-background-default); }
.ap-cutout { box-shadow: 0 0 0 2px var(--theme-background-default); }
.ap-cutout-lg { box-shadow: 0 0 0 4px var(--theme-background-subtle); }
.ap-elevated {
  box-shadow:
    0 0 0 1px rgb(255 255 255 / 0.06),
    0 2px 6px -2px rgb(0 0 0 / 0.35),
    0 16px 40px -12px rgb(0 0 0 / 0.45);
}
@media (prefers-reduced-motion: reduce) {
  .ap-rise, .ap-swap, .ap-reveal, .ap-halo { animation-duration: 1ms; animation-delay: 0ms; }
  .ap-press { transition: none; }
}
`;

export const AvatarMotion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: motionCss }} />
);

// ProfilePicture reads the request protocol through react-query.
const queryClient = new QueryClient();

const AvatarModeContext = createContext<AvatarMode>(AvatarMode.Characters);

export const useAvatarMode = (): AvatarMode => useContext(AvatarModeContext);

export const Page = ({
  children,
  initialMode = AvatarMode.Characters,
  withModeToggle = false,
}: {
  children: ReactNode;
  initialMode?: AvatarMode;
  withModeToggle?: boolean;
}): ReactElement => {
  const [mode, setMode] = useState(initialMode);

  return (
    <QueryClientProvider client={queryClient}>
      <AvatarModeContext.Provider value={mode}>
        <div className="min-h-screen bg-background-default px-4 pb-24 pt-8 text-text-primary tablet:px-10">
          <AvatarMotion />
          {withModeToggle && (
            <div className="sticky top-4 z-3 mx-auto mb-6 flex w-full max-w-[73.75rem] justify-end">
              <ModeToggle mode={mode} onChange={setMode} />
            </div>
          )}
          <div className="mx-auto flex w-full max-w-[73.75rem] flex-col gap-14">
            {children}
          </div>
        </div>
      </AvatarModeContext.Provider>
    </QueryClientProvider>
  );
};

export const ModeToggle = ({
  mode,
  onChange,
}: {
  mode: AvatarMode;
  onChange: (mode: AvatarMode) => void;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label="Placeholder treatment"
    className="ap-elevated flex items-center gap-1 rounded-14 border border-border-subtlest-tertiary bg-background-subtle p-1"
  >
    {[
      { value: AvatarMode.Today, label: 'Today' },
      { value: AvatarMode.Characters, label: 'With characters' },
    ].map((option) => (
      <button
        key={option.value}
        type="button"
        role="radio"
        aria-checked={mode === option.value}
        onClick={() => onChange(option.value)}
        className={classNames(
          'ap-press rounded-10 px-3 py-1.5 font-bold typo-footnote',
          mode === option.value
            ? 'bg-text-primary text-surface-invert'
            : 'text-text-tertiary hover:text-text-primary',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

export const PageHeader = ({
  eyebrow,
  title,
  goal,
  metric,
  children,
}: {
  eyebrow: string;
  title: string;
  goal?: string;
  metric?: string;
  children?: ReactNode;
}): ReactElement => (
  <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-8">
    <span className="uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
      {eyebrow}
    </span>
    <h1 className="ap-balance max-w-[34ch] typo-mega3">{title}</h1>
    {children && (
      <div className="ap-pretty flex max-w-[72ch] flex-col gap-3 text-text-tertiary typo-body">
        {children}
      </div>
    )}
    {(goal || metric) && (
      <dl className="mt-2 grid max-w-[72ch] gap-3 tablet:grid-cols-2">
        {goal && (
          <div className="rounded-14 bg-surface-float px-4 py-3">
            <dt className="text-text-quaternary typo-caption1">Goal</dt>
            <dd className="font-bold text-text-primary typo-callout">{goal}</dd>
          </div>
        )}
        {metric && (
          <div className="rounded-14 bg-surface-float px-4 py-3">
            <dt className="text-text-quaternary typo-caption1">Metric</dt>
            <dd className="font-bold text-text-primary typo-callout">
              {metric}
            </dd>
          </div>
        )}
      </dl>
    )}
  </header>
);

export const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <section className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <h2 className="ap-balance typo-title2">{title}</h2>
      {description && (
        <div className="ap-pretty max-w-[72ch] text-text-tertiary typo-callout">
          {description}
        </div>
      )}
    </div>
    {children}
  </section>
);

export enum CalloutTone {
  Neutral = 'neutral',
  Good = 'good',
  Bad = 'bad',
}

const toneToClassName: Record<CalloutTone, string> = {
  [CalloutTone.Neutral]: 'border-border-subtlest-tertiary',
  [CalloutTone.Good]: 'border-accent-avocado-default',
  [CalloutTone.Bad]: 'border-accent-ketchup-default',
};

export const Callout = ({
  tone = CalloutTone.Neutral,
  title,
  children,
}: {
  tone?: CalloutTone;
  title: string;
  children?: ReactNode;
}): ReactElement => (
  <div
    className={classNames(
      'flex flex-col gap-2 rounded-16 border-l-2 bg-surface-float px-5 py-4',
      toneToClassName[tone],
    )}
  >
    <div className="flex items-center gap-2">
      {tone !== CalloutTone.Neutral && (
        <span
          className={classNames(
            'rounded-6 px-1.5 py-0.5 uppercase tracking-wide typo-caption2',
            tone === CalloutTone.Good
              ? 'bg-overlay-float-avocado text-accent-avocado-default'
              : 'bg-overlay-float-ketchup text-accent-ketchup-default',
          )}
        >
          {tone === CalloutTone.Good ? 'Do' : "Don't"}
        </span>
      )}
      <span className="font-bold typo-callout">{title}</span>
    </div>
    {children && (
      <div className="ap-pretty text-text-tertiary typo-footnote">
        {children}
      </div>
    )}
  </div>
);

export const Table = ({
  head,
  rows,
}: {
  head: string[];
  rows: ReactNode[][];
}): ReactElement => (
  <div className="overflow-x-auto rounded-16 border border-border-subtlest-tertiary">
    <table className="w-full min-w-[40rem] border-collapse text-left">
      <thead>
        <tr className="bg-surface-float">
          {head.map((cell) => (
            <th
              key={cell}
              className="px-4 py-3 font-bold text-text-secondary typo-caption1"
            >
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            // eslint-disable-next-line react/no-array-index-key
            key={rowIndex}
            className="border-t border-border-subtlest-tertiary align-top"
          >
            {row.map((cell, cellIndex) => (
              <td
                // eslint-disable-next-line react/no-array-index-key
                key={cellIndex}
                className="px-4 py-3 text-text-tertiary typo-footnote"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Surface = ({
  label,
  note,
  children,
  className,
}: {
  label: string;
  note?: ReactNode;
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <figure className={classNames('flex min-w-0 flex-col gap-3', className)}>
    <div className="flex flex-1 flex-col rounded-20 border border-border-subtlest-tertiary bg-background-subtle p-4">
      {children}
    </div>
    <figcaption className="flex flex-col gap-0.5 px-1">
      <span className="font-bold text-text-primary typo-footnote">{label}</span>
      {note && (
        <span className="ap-pretty text-text-tertiary typo-caption1">
          {note}
        </span>
      )}
    </figcaption>
  </figure>
);

// Mirrors roundClasses in ProfilePicture so the cast is judged at production radii.
const radiusBySize: [number, string][] = [
  [16, '0.25rem'],
  [20, '0.375rem'],
  [24, '0.5rem'],
  [32, '0.625rem'],
  [40, '0.75rem'],
  [48, '0.875rem'],
  [56, '1rem'],
  [64, '1.125rem'],
];

export const radiusForSize = (sizePx: number): string =>
  radiusBySize.find(([max]) => sizePx <= max)?.[1] ?? '1.625rem';

export const CharacterAvatar = ({
  character,
  sizePx,
  crop = 'auto',
  round = false,
  className,
  animationKey,
}: {
  character: Character;
  sizePx: number;
  crop?: 'auto' | 'full' | 'face';
  round?: boolean;
  className?: string;
  animationKey?: string | number;
}): ReactElement => {
  const cropToSrc = {
    auto: getCharacterSrc(character, sizePx),
    full: character.src,
    face: character.faceSrc,
  };

  return (
    <img
      key={animationKey}
      src={cropToSrc[crop]}
      alt={character.name}
      width={sizePx}
      height={sizePx}
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: round ? '9999px' : radiusForSize(sizePx),
      }}
      className={classNames(
        'shrink-0 bg-surface-float object-cover',
        animationKey !== undefined && 'ap-swap',
        className,
      )}
    />
  );
};

export const Chip = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement => (
  <span
    className={classNames(
      'inline-flex items-center gap-1 rounded-8 px-2 py-0.5 typo-caption2',
      className ?? 'bg-surface-float text-text-tertiary',
    )}
  >
    {children}
  </span>
);
