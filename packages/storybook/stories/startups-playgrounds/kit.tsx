import type { ReactElement } from 'react';
import React from 'react';
import { Frame } from '../startups-onboarding/frame';
import type { PlaygroundState } from './map';

export enum Viewport {
  Desktop = 'desktop',
  Phone = 'phone',
}

const sizes: Record<Viewport, { width: number; height: number }> = {
  [Viewport.Desktop]: { width: 1280, height: 860 },
  [Viewport.Phone]: { width: 375, height: 812 },
};

const storyLink = (id: string): string => `/?path=/story/${id}`;

const Column = ({
  label,
  storyId,
  title,
  viewport,
}: {
  label: string;
  storyId?: string;
  title: string;
  viewport: Viewport;
}): ReactElement => (
  <div className="flex min-w-0 flex-col gap-2">
    <p className="flex items-center justify-between text-text-tertiary typo-footnote">
      {label}
      {storyId && (
        <a
          href={storyLink(storyId)}
          target="_top"
          className="text-text-link underline"
        >
          Open live
        </a>
      )}
    </p>
    {storyId ? (
      <Frame
        key={viewport}
        storyId={storyId}
        title={title}
        {...sizes[viewport]}
        maxWidth={viewport === Viewport.Phone ? 256 : undefined}
      />
    ) : (
      <div
        className="flex items-center justify-center rounded-12 border border-dashed border-border-subtlest-tertiary p-4 text-center text-text-tertiary typo-footnote"
        style={{ aspectRatio: '1280 / 860' }}
      >
        {label === 'After' ? 'Only visible live' : 'Not in today’s build'}
      </div>
    )}
  </div>
);

export const StateRow = ({
  state,
  index,
  viewport,
}: {
  state: PlaygroundState;
  index?: number;
  viewport: Viewport;
}): ReactElement => (
  <section
    id={`state-${state.id}`}
    className="flex flex-col gap-3 border-t border-border-subtlest-tertiary pt-6"
    style={{ scrollMarginTop: 72 }}
  >
    <div className="flex flex-col gap-1">
      <h3 className="font-bold typo-title3">
        {index ? `${index}. ` : ''}
        {state.label}
        <span className="ml-2 font-normal text-text-tertiary typo-footnote">
          {state.id}
        </span>
      </h3>
      {state.note && (
        <p className="text-pretty text-text-secondary typo-callout">
          {state.note}
        </p>
      )}
    </div>
    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
      <Column
        label="Before"
        storyId={state.today}
        title={`${state.label}, before`}
        viewport={viewport}
      />
      <Column
        label="After"
        storyId={state.proposed}
        title={`${state.label}, after`}
        viewport={viewport}
      />
    </div>
  </section>
);

export const ViewportSwitch = ({
  viewport,
  onChange,
}: {
  viewport: Viewport;
  onChange: (next: Viewport) => void;
}): ReactElement => (
  <div
    role="radiogroup"
    aria-label="Screen size"
    className="flex w-fit gap-1 rounded-12 border border-border-subtlest-tertiary p-1"
  >
    {Object.values(Viewport).map((option) => (
      <button
        key={option}
        type="button"
        role="radio"
        aria-checked={option === viewport}
        onClick={() => onChange(option)}
        className={`rounded-8 px-3 py-1 font-bold typo-footnote ${
          option === viewport
            ? 'bg-surface-float text-text-primary'
            : 'text-text-tertiary hover:text-text-primary'
        }`}
      >
        {option === Viewport.Desktop ? 'Desktop' : 'Phone'}
      </button>
    ))}
  </div>
);
