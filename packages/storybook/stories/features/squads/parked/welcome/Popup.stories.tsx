import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { SquadWelcome } from '../app/graphql/squadWelcomeAudience';
import { emptySquadWelcome } from '../app/graphql/squadWelcomeAudience';
import { SquadWelcomeCard } from '../app/features/squads/components/welcome/SquadWelcomeCard';
import {
  getSquadWelcomeExamples,
  getSquadWelcomeView,
} from '../app/features/squads/lib/welcome';
import { SquadWelcomeModal } from '../app/components/modals/squads/SquadWelcomeModal';
import { team } from '../../../../squad-page/data';
import { memberSquad, Viewer, welcome, withApp, withSeed } from '../fixtures';
import { phone } from '../kit';

// The pop-up a member sees once, right after joining. One template; the
// stories below are the same layout with its fields filled in differently.

const Frame = ({
  saved,
  squad = memberSquad,
}: {
  saved: SquadWelcome;
  squad?: Squad;
}): ReactElement => (
  <div className="flex min-h-screen items-center justify-center bg-overlay-quaternary-onion p-4">
    <div className="w-full max-w-[26.25rem] overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default">
      <SquadWelcomeCard view={getSquadWelcomeView(saved, squad)} />
    </div>
  </div>
);

const example = (label: string): SquadWelcome => {
  const found = getSquadWelcomeExamples(memberSquad).find(
    (item) => item.label === label,
  );

  return { ...emptySquadWelcome, enabled: true, ...found?.text };
};

const meta: Meta = {
  title: 'Verified Squads (parked)/1. Welcome pop-up/Pop-up',
  parameters: { layout: 'fullscreen' },
  decorators: [withApp],
};

export default meta;

type Story = StoryObj;

/** The default: the squad's cover and logo, three house rules, one button. */
export const Default: Story = {
  render: () => <Frame saved={welcome} />,
};

/** Example "An event", with a link: the button opens it in a new tab. */
export const Event: Story = {
  render: () => (
    <Frame
      saved={{
        ...example('An event'),
        headline: 'Join us live: AI review in practice',
        text: 'Thursday, Oct 16 · 17:00 CET, online. 45 minutes with the team, then your questions.',
        ctaUrl: 'https://www.coderabbit.ai/events',
      }}
    />
  ),
};

/** Example "A product". */
export const Product: Story = {
  render: () => (
    <Frame
      saved={{ ...example('A product'), ctaUrl: 'https://www.coderabbit.ai' }}
    />
  ),
};

/** Example "A launch". */
export const Launch: Story = {
  render: () => (
    <Frame
      saved={{
        ...example('A launch'),
        ctaUrl: 'https://www.coderabbit.ai/blog/agents',
      }}
    />
  ),
};

/** The company's own cover and image instead of the squad's. */
export const CustomImages: Story = {
  render: () => (
    <Frame
      saved={{
        ...example('An event'),
        coverUrl:
          'https://www.coderabbit.ai/content/assets/triage-pr-queue/hero.png',
        imageUrl: team[0].image,
      }}
    />
  ),
};

/** Nothing filled in: "Welcome to <squad>" and a "Got it" button. */
export const Bare: Story = {
  render: () => (
    <Frame saved={{ ...emptySquadWelcome, enabled: true, text: null }} />
  ),
};

/** Every field at its limit: 60, 160 and 24 characters, three rules. */
export const LongestCopy: Story = {
  render: () => (
    <Frame
      saved={{
        ...welcome,
        headline: 'Welcome to the CodeRabbit community for AI code review now',
        text: 'Launches, release notes and answers from the team now show in your feed. Ask anything about reviews, setup or pricing, and read the house rules below.',
        ctaLabel: 'Introduce yourself now!',
      }}
    />
  ),
};

/** A squad without a cover: the band stays, in the surface colour. */
export const NoCover: Story = {
  render: () => (
    <Frame
      saved={welcome}
      squad={{ ...memberSquad, headerImage: undefined } as Squad}
    />
  ),
};

/**
 * react-modal looks for the app root (#__next) while the modal renders, so
 * the root goes in first and the modal a tick later.
 */
const AppModal = (): ReactElement => {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => setIsReady(true), []);

  return (
    <div id="__next" className="min-h-screen">
      {isReady && (
        <SquadWelcomeModal
          squad={memberSquad}
          welcome={welcome}
          isOpen
          onRequestClose={() => undefined}
        />
      )}
    </div>
  );
};

/** The real modal, as it opens after Join. On a phone it is a drawer. */
export const InTheApp: Story = {
  decorators: [withSeed({ viewer: Viewer.Member })],
  render: () => <AppModal />,
};

export const InTheAppPhone: Story = {
  ...InTheApp,
  name: 'In the app · Phone (drawer)',
  globals: phone,
};
