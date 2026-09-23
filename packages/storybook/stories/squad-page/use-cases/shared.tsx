import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import ExtensionProviders from '../../extension/_providers';
import { KitStyles, Viewer } from '../kit';
import type { SquadConfig, SquadPage } from '../workspace';
import {
  addPage,
  ContentSource,
  findPage,
  WorkspaceShell,
  WorkspaceStyles,
} from '../workspace';

// Shared furniture for the use-case stories: one frame, one caption
// shape, and the case model every file draws from.

export interface UseCase {
  id: string;
  title: string;
  who: string;
  sees: string;
  viewer: Viewer;
  page?: string;
  source?: ContentSource;
  empty?: boolean;
  isPrivate?: boolean;
  config?: Partial<SquadConfig>;
  height?: number;
}

export const viewerLabel: Record<Viewer, string> = {
  [Viewer.Anonymous]: 'Anonymous',
  [Viewer.Visitor]: 'Logged in, not a member',
  [Viewer.Member]: 'Member',
  [Viewer.Moderator]: 'Moderator',
  [Viewer.Admin]: 'Admin',
  [Viewer.Blocked]: 'Blocked',
};

export const Case = ({ useCase }: { useCase: UseCase }): ReactElement => (
  <div className="flex flex-col gap-3">
    <div className="flex flex-col gap-1">
      <span className="font-bold text-text-primary typo-callout">
        {useCase.title}
      </span>
      <span className="text-text-tertiary typo-footnote">
        <b className="text-text-secondary">{useCase.who}.</b> {useCase.sees}
      </span>
    </div>
    <WorkspaceShell
      viewer={useCase.viewer}
      initialPage={
        useCase.page === 'add' ? addPage : findPage(useCase.page ?? 'home')
      }
      source={useCase.source ?? ContentSource.Feed}
      empty={useCase.empty}
      isPrivate={useCase.isPrivate}
      config={useCase.config}
      height={useCase.height ?? 44}
    />
  </div>
);

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

export const pageOf = (id: string): SquadPage =>
  id === 'add' ? addPage : findPage(id);
