import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import { Frame } from '../startups-onboarding/frame';

/*
 * Review furniture for the All states pages: a state grid with a label and
 * a tag per case, and a row of real device frames (iframes at each width,
 * from Devices.stories.tsx).
 */

export type Tag = 'Production' | 'GTA VI' | 'Proposed';

const tagClass: Record<Tag, string> = {
  Production: 'bg-surface-float text-text-tertiary',
  'GTA VI': 'bg-accent-cabbage-default text-background-default',
  Proposed: 'bg-accent-bun-default text-background-default',
};

export const State = ({
  title,
  note,
  tag,
  children,
}: {
  title: string;
  note?: string;
  tag: Tag;
  children: ReactNode;
}): ReactElement => (
  <figure className="flex min-w-0 flex-col gap-2">
    <figcaption className="flex max-w-[26.25rem] flex-col gap-1">
      <span className="flex items-center gap-2">
        <span className="font-bold text-text-primary typo-callout">
          {title}
        </span>
        <span
          className={`rounded-6 px-1.5 py-0.5 font-bold typo-caption2 ${tagClass[tag]}`}
        >
          {tag}
        </span>
      </span>
      {note && <span className="text-text-tertiary typo-footnote">{note}</span>}
    </figcaption>
    {children}
  </figure>
);

export const StateGrid = ({
  children,
}: {
  children: ReactNode;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-x-10 gap-y-12">{children}</div>
);

export const devices = [
  { label: 'Phone · 375', width: 375, height: 812, shown: 200 },
  { label: 'Tablet · 768', width: 768, height: 1024, shown: 300 },
  { label: 'Laptop · 1280', width: 1280, height: 800, shown: 420 },
  { label: 'Laptop L · 1440', width: 1440, height: 900, shown: 460 },
  { label: 'Desktop · 1920', width: 1920, height: 1080, shown: 520 },
];

/** One story in a real iframe at every device width; click opens it live. */
export const DeviceRow = ({
  storyId,
  title,
}: {
  storyId: string;
  title: string;
}): ReactElement => (
  <div className="flex flex-wrap items-start gap-6">
    {devices.map((device) => (
      <div
        key={device.label}
        className="flex flex-col gap-2"
        style={{ width: device.shown }}
      >
        <span className="text-text-tertiary typo-footnote">{device.label}</span>
        <Frame
          storyId={storyId}
          title={`${title}, ${device.label}`}
          width={device.width}
          height={device.height}
        />
        <a
          href={`/?path=/story/${storyId}`}
          target="_blank"
          rel="noreferrer"
          className="text-text-link typo-caption1"
        >
          Open full size
        </a>
      </div>
    ))}
  </div>
);
