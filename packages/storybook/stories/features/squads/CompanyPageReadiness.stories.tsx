import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { ReadinessItem } from '@dailydotdev/shared/src/features/squads/lib/readiness';
import { getCompanyPageReadinessItems } from '@dailydotdev/shared/src/features/squads/lib/readiness';
import { getCompanyPageReadinessPrompt } from '@dailydotdev/shared/src/features/squads/lib/companyPage';
import { CompanyPageReadiness } from '@dailydotdev/shared/src/features/squads/components/readiness/CompanyPageReadiness';
import { SquadValuePanel } from '@dailydotdev/shared/src/features/squads/components/valuePanel/SquadValuePanel';
import { FreeBoostCard } from '@dailydotdev/shared/src/features/squads/components/freeBoost/FreeBoostCard';
import ExtensionProviders from '../../extension/_providers';

// The readiness checklist at the top of a company page, for its admins, with
// the card that sits under it in each state.

type Filled = Partial<
  Record<
    | 'logo'
    | 'description'
    | 'cover'
    | 'website'
    | 'links'
    | 'product'
    | 'photo'
    | 'headline'
    | 'job',
    boolean
  >
>;

const getItems = (filled: Filled, isPaid = false): ReadinessItem[] =>
  getCompanyPageReadinessItems({
    squad: {
      handle: 'acme',
      image: filled.logo
        ? '/squad-page/logo.png'
        : 'https://media.daily.dev/squad_placeholder_sfwkmj',
      description: filled.description ? 'Acme builds things.' : '',
      headerImage: filled.cover ? '/cover.png' : undefined,
      website: filled.website ? 'https://acme.dev' : null,
      links: filled.links ? ['https://github.com/acme'] : [],
    } as Squad,
    user: {
      profileCompletion: {
        percentage: 0,
        hasProfileImage: !!filled.photo,
        hasHeadline: !!filled.headline,
        hasExperienceLevel: true,
        hasWork: !!filled.job,
        hasEducation: false,
      },
    },
    hasLinks: isPaid,
    products: isPaid ? Number(!!filled.product) : undefined,
  });

/** Splits like the page does on load; `later` were filled in during the visit */
const Readiness = ({
  filled,
  later = {},
  isPaid,
}: {
  filled: Filled;
  later?: Filled;
  isPaid?: boolean;
}): ReactElement => {
  const [copied, setCopied] = useState(false);
  const atLoad = getItems(filled, isPaid);
  const now = getItems({ ...filled, ...later }, isPaid);
  const missing = new Set(
    atLoad.filter(({ isDone }) => !isDone).map(({ id }) => id),
  );

  return (
    <CompanyPageReadiness
      rows={now.filter(({ id }) => missing.has(id))}
      done={now.filter(({ id, isDone }) => isDone && !missing.has(id))}
      isPromptCopied={copied}
      onCopyPrompt={() => setCopied(true)}
    />
  );
};

const offer = {
  cashback: 500,
  monthlyCredits: 245,
  promoLength: 'for your first year',
};

const Column = ({
  children,
  width = 640,
}: {
  children: ReactElement | ReactElement[];
  width?: number;
}): ReactElement => (
  <div className="flex flex-col gap-4" style={{ width }}>
    {children}
  </div>
);

const meta: Meta = {
  title: 'Features/Squads/Company page readiness',
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="bg-background-default p-6">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const BeforeFirstPost: Story = {
  render: () => (
    <Column>
      <Readiness filled={{ logo: true, description: true }} />
      <FreeBoostCard state="first_post" composeUrl="#" />
    </Column>
  ),
};

export const FreeAfterBoost: Story = {
  render: () => (
    <Column>
      <Readiness
        filled={{ logo: true, description: true, website: true, photo: true }}
      />
      <SquadValuePanel
        name="Acme"
        analyticsUrl="#"
        stats={{
          impressions: 9412,
          reach: 6120,
          clicks: 214,
          engagement: 87,
          followers: 31,
          agentViews: null,
        }}
        upgrade={{ offer, checkoutUrl: '#' }}
      />
    </Column>
  ),
};

export const DoneDuringVisit: Story = {
  render: () => (
    <Column>
      <Readiness
        filled={{ logo: true, description: true }}
        later={{ cover: true, photo: true }}
      />
    </Column>
  ),
};

export const PaidPage: Story = {
  render: () => (
    <Column>
      <Readiness
        isPaid
        filled={{
          logo: true,
          description: true,
          cover: true,
          website: true,
          photo: true,
          headline: true,
        }}
      />
    </Column>
  ),
};

export const Phone: Story = {
  render: () => (
    <Column width={358}>
      <Readiness filled={{ logo: true, description: true }} />
    </Column>
  ),
};

export const CopiedPrompt: Story = {
  render: () => (
    <pre
      className="whitespace-pre-wrap rounded-12 bg-surface-float p-4 typo-footnote"
      style={{ width: 640 }}
    >
      {getCompanyPageReadinessPrompt({
        handle: 'acme',
        steps: getItems({ logo: true, description: true })
          .filter(({ isDone }) => !isDone)
          .map(({ agentStep }) => agentStep),
      })}
    </pre>
  ),
};
