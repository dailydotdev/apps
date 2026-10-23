import type { CSSProperties, ReactElement } from 'react';
import React, { useId, useState } from 'react';
import classNames from 'classnames';
import { PlayIcon, VIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { features } from '../data';
import type { CheckoutState } from '../checkout/model';
import { checklistGridClass, entryCopy } from '../checkout/parts';
import { SceneWindow, Stage, hasScene, sceneIdFor, useRotation } from './Stage';

/* Five ways to put PR #6868's animated showcase into the approved checkout.
   None of them changes the approved stories; each plugs into a CheckoutPage
   slot (features / paymentExtra / belowFold) or the success page. */

const ordered = (lead: string[]) => [
  ...lead.map((id) => features.find((f) => f.id === id)!).filter(Boolean),
  ...features.filter((f) => !lead.includes(f.id)),
];


/** The showcase order follows the checklist (usage), not the banner’s order. */
export const sceneIdsFor = (lead: string[]): string[] =>
  ordered(lead).filter((f) => hasScene(f.id)).map((f) => sceneIdFor[f.id]);

const Lead = ({ hint }: { hint?: string }) => (
  <p className="font-bold typo-footnote text-text-secondary">
    Everything in Free, plus:
    {hint && <span className="ml-1.5 font-normal text-text-quaternary">{hint}</span>}
  </p>
);

/* ------------------------------------------------------------------ */
/* A · Preview on hover — the list stays exactly as approved; every   */
/* features with a scene play it in a floating window. No height cost. */
/* ------------------------------------------------------------------ */

export const PreviewChecklist = ({ state }: { state: CheckoutState }): ReactElement => {
  const [open, setOpen] = useState<string | null>(null);
  const [pinned, setPinned] = useState(false);
  const lead = entryCopy[state.entry].lead;
  return (
    <div
      className="relative flex flex-col gap-2.5"
      onPointerLeave={() => !pinned && setOpen(null)}
    >
      <Lead hint="· hover a feature to see it" />
      <ul className={checklistGridClass(features.length)}>
        {ordered(lead).map((f, i) => {
          const sid = sceneIdFor[f.id];
          const label = <span className={i < 3 ? 'font-bold' : undefined}>{f.label}</span>;
          if (!sid) {
            return (
              <li key={f.id} className="flex items-center gap-2 typo-footnote text-text-primary">
                <VIcon size={IconSize.XSmall} className="flex-none text-accent-avocado-default" aria-hidden />
                {label}
              </li>
            );
          }
          const on = open === sid;
          return (
            <li key={f.id}>
              <button
                type="button"
                aria-expanded={on}
                onPointerEnter={() => !pinned && setOpen(sid)}
                onFocus={() => setOpen(sid)}
                onClick={() => {
                  setPinned(!(on && pinned));
                  setOpen(on && pinned ? null : sid);
                }}
                className={classNames(
                  'group -mx-1.5 flex w-full items-center gap-2 rounded-8 px-1.5 text-left typo-footnote text-text-primary transition-colors',
                  on ? 'bg-surface-float' : 'hover:bg-surface-float',
                )}
              >
                <VIcon size={IconSize.XSmall} className="flex-none text-accent-avocado-default" aria-hidden />
                {label}
                <PlayIcon
                  size={IconSize.Size16}
                  aria-hidden
                  className={classNames('ml-auto flex-none transition-opacity', on ? 'text-text-secondary opacity-100' : 'text-text-quaternary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100')}
                />
              </button>
            </li>
          );
        })}
      </ul>
      {open && (
        <div className="z-2 laptop:absolute laptop:inset-x-0 laptop:top-full laptop:mt-2 laptop:shadow-3-black">
          <SceneWindow sceneId={open} />
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* B · The list plays — all ten rows drive the window                 */
/* under the list. It rotates on its own; hovering or focusing a row  */
/* shows that scene and holds it until the pointer leaves the list.   */
/* The highlight hugs the label, not the column. ~+240px of height.   */
/* ------------------------------------------------------------------ */

export const SyncedChecklist = ({ state }: { state: CheckoutState }): ReactElement => {
  const lead = entryCopy[state.entry].lead;
  const ids = sceneIdsFor(lead);
  const { selected, isPlaying, show, pause } = useRotation({ ids });
  const windowId = useId();
  return (
    <div
      className="flex flex-col gap-2.5"
      onPointerEnter={() => pause(true)}
      onPointerLeave={() => pause(false)}
      onFocus={() => pause(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          pause(false);
        }
      }}
    >
      <Lead />
      <ul className={checklistGridClass(features.length)}>
        {ordered(lead).map((f, i) => {
          const sid = sceneIdFor[f.id];
          const label = <span className={i < 3 ? 'font-bold' : undefined}>{f.label}</span>;
          if (!sid) {
            return (
              <li key={f.id} className="flex items-center gap-2 typo-footnote text-text-primary">
                <VIcon size={IconSize.XSmall} className="flex-none text-accent-avocado-default" aria-hidden />
                {label}
              </li>
            );
          }
          const on = sid === selected;
          return (
            <li key={f.id} className="flex">
              {/* Negative margin = the same padding: the label stays on the approved grid. */}
              <button
                type="button"
                aria-pressed={on}
                aria-controls={windowId}
                onPointerEnter={() => show(sid)}
                onFocus={() => show(sid)}
                onClick={() => show(sid)}
                className={classNames(
                  'relative -mx-2 -my-0.5 flex items-center gap-2 overflow-hidden rounded-8 px-2 py-0.5 text-left typo-footnote text-text-primary transition-colors duration-200',
                  // Grey for every feature (Tsahi, 15 Oct); the checks stay green.
                  on && 'bg-surface-float',
                )}
              >
                <VIcon size={IconSize.XSmall} className="flex-none text-accent-avocado-default" aria-hidden />
                {label}
                {on && isPlaying && (
                  <span
                    key={selected}
                    aria-hidden
                    className="plus-banner-progress bg-text-primary"
                    style={{ '--plus-banner-dwell': '4200ms', left: '0.5rem', right: '0.5rem' } as CSSProperties}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <SceneWindow sceneId={selected} id={windowId} style={{ height: '13.5rem' }} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* C · Below the fold — the checkout stays one screen; scrolling past  */
/* it shows the full showcase, as product pages put a demo under the  */
/* price.                                                             */
/* ------------------------------------------------------------------ */

export const BelowFoldShowcase = ({ state }: { state: CheckoutState }): ReactElement => (
  <section aria-label="What Plus changes" className="border-t border-border-subtlest-tertiary px-4 py-12 tablet:px-10 laptop:px-12">
    <div className="mx-auto flex w-full max-w-[66rem] flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 max-w-xl flex-1 basis-[18rem] flex-col gap-1.5">
          <h2 className="text-balance font-bold typo-title2">See what Plus changes in your feed.</h2>
          <p className="text-pretty typo-callout text-text-tertiary">All ten features, playing on a feed like yours. Pick one, or let it run.</p>
        </div>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="h-10 rounded-12 border border-border-subtlest-tertiary px-4 font-bold typo-footnote text-text-primary hover:bg-surface-float"
        >
          Back to your plan
        </button>
      </div>
      <Stage ids={sceneIdsFor(entryCopy[state.entry].lead)} className="w-full max-w-[56rem]" />
    </div>
  </section>
);

/* ------------------------------------------------------------------ */
/* D · Fills the empty payment half — only when there is no frame:    */
/* signed out (sign-in buttons alone) and already Plus.               */
/* ------------------------------------------------------------------ */

export const PaymentSideShowcase = ({ state }: { state: CheckoutState }): ReactElement | null => {
  if (state.viewer !== 'anonymous' && state.viewer !== 'plus') {
    return null;
  }
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-5">
      <p className="font-bold typo-footnote text-text-secondary">
        {state.viewer === 'plus' ? 'What’s on for you' : 'What you get, on your feed'}
      </p>
      <Stage ids={sceneIdsFor(entryCopy[state.entry].lead)} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* E · Success tour — after paying, the same scenes as “what just     */
/* changed”, Briefing first because it is the one thing to set up.    */
/* ------------------------------------------------------------------ */

export const SuccessTour = (): ReactElement => (
  <div className="mt-10 flex w-full max-w-[56rem] flex-col gap-3">
    <p className="text-center font-bold typo-footnote text-text-secondary">What just changed</p>
    <Stage ids={['presidential-briefing', 'ad-free', 'custom feeds', 'clean titles', 'keyword filter', 'bookmark folders']} />
  </div>
);
