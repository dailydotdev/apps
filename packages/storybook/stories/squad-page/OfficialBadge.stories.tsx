import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ExtensionProviders from '../extension/_providers';
import { KitStyles } from './kit';
import { RulesWidget, VerifiedWidget } from './home';

const meta: Meta = {
  title: 'Squad Page/4. Verified badge',
  parameters: { layout: 'fullscreen' },
};

export default meta;

const Eyebrow = ({ children }: { children: ReactNode }): ReactElement => (
  <span className="font-bold uppercase tracking-[0.16em] text-text-quaternary typo-caption1">
    {children}
  </span>
);

/** The chosen badge, Aurora, as it ships at the top of the widget column. */
export const Overview: StoryObj = {
  render: () => (
    <ExtensionProviders>
      <div className="min-h-screen bg-background-default px-8 pb-24 pt-10 text-text-primary">
        <KitStyles />
        <div className="mx-auto flex w-full max-w-[60rem] flex-col gap-10">
          <header className="flex flex-col gap-4 border-b border-border-subtlest-tertiary pb-8">
            <Eyebrow>Squad page · The official badge</Eyebrow>
            <h1 className="max-w-[24ch] font-bold typo-giga3">Aurora</h1>
            <p className="max-w-[64ch] text-text-secondary typo-body">
              Frosted glass with a brand-purple hairline and two soft light
              sources, cabbage and onion, behind the seal and four words. Picked
              from 28 explorations; it is the Verified company page card at the
              top of the right column.
            </p>
          </header>
          <div className="flex w-80 flex-col gap-4">
            <VerifiedWidget />
            <RulesWidget />
          </div>
        </div>
      </div>
    </ExtensionProviders>
  ),
};
