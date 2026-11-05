import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Page } from '../onboarding-fixes/kit';
import { blurFrames } from '../startups-onboarding/frame';
import { StateRow, Viewport, ViewportSwitch } from './kit';
import type { PlaygroundFlow } from './map';
import { exitNotes, findState, flows, groups } from './map';

// One page per use case: every screen of it, in order, with before and after.
// States no use case passes through, like errors, have a page of their own.

const meta: Meta = {
  title: 'Startups Onboarding/2. Before and after',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
};

export default meta;

type Story = StoryObj;

const INTRO =
  "Before is today's build, and After is the proposal. These are pictures, so they load quickly. Click one to open it live.";

const inFlows = new Set(flows.flatMap(({ steps }) => steps));

// Storybook's iframe opens links in the parent, so a #hash link would leave
// the page. Jumps scroll instead.
const jumpTo = (id: string): void => {
  document.getElementById(id)?.scrollIntoView();
};

const Sheet = ({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  children: (viewport: Viewport) => ReactNode;
}): ReactElement => {
  const [viewport, setViewport] = useState(Viewport.Desktop);

  return (
    <Page eyebrow={eyebrow} title={title} intro={intro}>
      <ViewportSwitch
        viewport={viewport}
        onChange={(next) => {
          blurFrames();
          setViewport(next);
        }}
      />
      {children(viewport)}
    </Page>
  );
};

const Steps = ({ flow }: { flow: PlaygroundFlow }): ReactElement => (
  <ol className="flex flex-wrap items-center gap-2">
    {flow.steps.map((id, index) => (
      <li key={id}>
        <button
          type="button"
          onClick={() => jumpTo(`state-${id}`)}
          className="rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-primary typo-footnote hover:bg-surface-float"
        >
          {index + 1}. {findState(id).label}
        </button>
      </li>
    ))}
  </ol>
);

const UseCase = ({
  id,
  title,
  playground,
}: {
  id: string;
  title: string;
  /** The live version, where there is one. */
  playground?: string;
}): ReactElement => {
  const flow = flows.find((item) => item.id === id) as PlaygroundFlow;

  return (
    <Sheet
      eyebrow="Before and after"
      title={title}
      intro={
        <div className="flex flex-col gap-2">
          <p className="text-pretty">{flow.who}</p>
          <p className="text-pretty">{INTRO}</p>
          {playground && (
            <a
              href={`/?path=/story/startups-onboarding-1-playgrounds--${playground}`}
              target="_top"
              className="w-fit text-text-link underline"
            >
              Open the playground for this use case
            </a>
          )}
        </div>
      }
    >
      {(viewport) => (
        <>
          <Steps flow={flow} />
          {flow.steps.map((step, index) => (
            <StateRow
              key={step}
              state={findState(step)}
              index={index + 1}
              viewport={viewport}
            />
          ))}
          {id === 'exits' && (
            <section className="flex flex-col gap-2 border-t border-border-subtlest-tertiary pt-6">
              <h2 className="font-bold typo-title3">The ones with no screen</h2>
              <ul className="flex list-disc flex-col gap-1 pl-5 text-text-secondary typo-callout">
                {exitNotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </Sheet>
  );
};

const OtherStates = (): ReactElement => (
  <Sheet
    eyebrow="Before and after"
    title="Errors and variations"
    intro={`The states no use case passes through on its main path, by step. ${INTRO}`}
  >
    {(viewport) =>
      groups.map((group) => {
        const states = group.states.filter(({ id }) => !inFlows.has(id));

        return states.length > 0 ? (
          <section key={group.id} className="flex flex-col gap-6">
            <h2 className="font-bold typo-title2">{group.title}</h2>
            {states.map((state) => (
              <StateRow key={state.id} state={state} viewport={viewport} />
            ))}
          </section>
        ) : null;
      })
    }
  </Sheet>
);

export const NewFounder: Story = {
  name: 'New founder',
  render: () => (
    <UseCase id="new-founder" title="New founder" playground="new-founder" />
  ),
};

export const Social: Story = {
  name: 'GitHub or Google',
  render: () => (
    <UseCase id="social" title="GitHub or Google" playground="social" />
  ),
};

export const Returning: Story = {
  name: 'Returning user',
  render: () => (
    <UseCase id="returning" title="Returning user" playground="returning" />
  ),
};

export const SignedIn: Story = {
  name: 'Signed in, no squad',
  render: () => (
    <UseCase
      id="signed-in"
      title="Signed in, no squad"
      playground="signed-in"
    />
  ),
};

export const Admin: Story = {
  name: 'Squad admin',
  render: () => <UseCase id="admin" title="Squad admin" playground="admin" />,
};

export const Upsell: Story = {
  name: 'Squad page upsell',
  render: () => (
    <UseCase id="upsell" title="Squad page upsell" playground="upsell" />
  ),
};

export const Manage: Story = {
  name: 'Manage › Subscription',
  render: () => (
    <UseCase id="manage" title="Manage › Subscription" playground="manage" />
  ),
};

export const AfterBuying: Story = {
  name: 'After buying',
  render: () => (
    <UseCase id="after-buying" title="After buying" playground="after-buying" />
  ),
};

export const Exits: Story = {
  name: 'Exits and failures',
  render: () => <UseCase id="exits" title="Exits and failures" />,
};

export const Other: Story = {
  name: 'Errors and variations',
  render: () => <OtherStates />,
};
