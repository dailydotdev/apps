import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import ExtensionProviders from '../../extension/_providers';
import { KitStyles, Viewer } from '../kit';
import { WorkspaceStyles } from '../workspace';
import { DirectionShell } from '../direction';
import type { UseCase } from './cases';

export type { UseCase } from './cases';

// Shared furniture for the use-case stories: every case drawn twice, on
// the direction, at desktop width and on a 375px phone. The phone is a
// frame of the Direction playground, so its breakpoints are real.

export const viewerLabel: Record<Viewer, string> = {
  [Viewer.Anonymous]: 'Anonymous',
  [Viewer.Visitor]: 'Logged in, not a member',
  [Viewer.Member]: 'Member',
  [Viewer.Moderator]: 'Moderator',
  [Viewer.Admin]: 'Admin',
  [Viewer.Blocked]: 'Blocked',
};

const playground = 'squad-page-1-direction--playground';

/** The Direction playground in a frame of its own width, so phone rules apply. */
export const DeviceFrame = ({
  args,
  width,
  height,
  label,
  scale = 1,
}: {
  args: string;
  width: number;
  /** px */
  height: number;
  label: string;
  /** Draw a wide device smaller without changing its viewport. */
  scale?: number;
}): ReactElement => (
  <div className="flex shrink-0 flex-col gap-2">
    <span className="text-text-quaternary typo-caption1">{label}</span>
    <div
      style={{ width: width * scale, height: height * scale }}
      className="overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-background-default"
    >
      <iframe
        title={label}
        loading="lazy"
        src={`iframe.html?id=${playground}&globals=theme:dark&args=${args}`}
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      />
    </div>
  </div>
);

export const Case = ({ useCase }: { useCase: UseCase }): ReactElement => {
  const height = useCase.height ?? 44;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="font-bold text-text-primary typo-callout">
          {useCase.title}
        </span>
        <span className="max-w-[100ch] text-text-tertiary typo-footnote">
          <b className="text-text-secondary">{useCase.who}.</b> {useCase.sees}
        </span>
      </div>
      <div className="flex items-start gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-text-quaternary typo-caption1">Desktop</span>
          <DirectionShell
            viewer={useCase.viewer}
            initialPage={useCase.page ?? 'home'}
            source={useCase.source}
            empty={useCase.empty}
            isPrivate={useCase.isPrivate}
            config={useCase.config}
            width={1060}
            height={height}
          />
        </div>
        <DeviceFrame
          args={`case:${useCase.id}`}
          width={375}
          height={height * 16}
          label="Phone, 375px"
        />
      </div>
    </div>
  );
};

export const Page = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}): ReactElement => (
  <ExtensionProviders>
    <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
      <KitStyles />
      <WorkspaceStyles />
      <div className="mx-auto flex w-full max-w-[92rem] flex-col gap-12">
        <header className="flex flex-col gap-3 border-b border-border-subtlest-tertiary pb-8">
          <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
            {eyebrow}
          </span>
          <h1 className="max-w-[24ch] font-bold typo-mega3">{title}</h1>
          <div className="flex max-w-[76ch] flex-col gap-3 text-text-secondary typo-body">
            {intro}
          </div>
        </header>
        {children}
      </div>
    </div>
  </ExtensionProviders>
);

export const Full = ({ children }: { children: ReactNode }): ReactElement => (
  <ExtensionProviders>
    <div className="flex min-h-screen items-start justify-center bg-background-subtle p-8">
      <KitStyles />
      <WorkspaceStyles />
      {children}
    </div>
  </ExtensionProviders>
);
