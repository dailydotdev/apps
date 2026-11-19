import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import type { ReadinessItem } from '@dailydotdev/shared/src/features/squads/lib/readiness';
import {
  getCompanyPageReadinessItems,
  getPlanChecklistItems,
} from '@dailydotdev/shared/src/features/squads/lib/readiness';
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

type PlanDone = Partial<
  Record<
    | 'cta'
    | 'intel'
    | 'post'
    | 'boost'
    | 'agent'
    | 'ideas'
    | 'review'
    | 'routine',
    boolean
  >
>;

const getItems = (
  filled: Filled,
  isPaid = false,
  plan?: { isTeam?: boolean; done?: PlanDone },
): ReadinessItem[] => [
  ...getCompanyPageReadinessItems({
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
  }),
  ...(plan
    ? getPlanChecklistItems({
        squad: { handle: 'acme' },
        hasSeat: true,
        hasCta: !!plan.isTeam,
        intelTopics: plan.isTeam ? 20 : 5,
        credits: '$245',
        done: {
          cta: false,
          intel: false,
          post: false,
          boost: false,
          agent: false,
          ideas: false,
          review: false,
          routine: false,
          ...plan.done,
        },
      })
    : []),
];

/** Splits like the page does on load; `later` were filled in during the visit */
const Readiness = ({
  filled,
  later = {},
  isPaid,
  plan,
}: {
  filled: Filled;
  later?: Filled;
  isPaid?: boolean;
  /** "Starter" or "Team": the paid checklist */
  plan?: string;
}): ReactElement | null => {
  const [isDismissed, setDismissed] = useState(false);
  const [tried, setTried] = useState<string[]>([]);
  const planItems = plan
    ? {
        isTeam: plan === 'Team',
        done: Object.fromEntries(tried.map((id) => [id, true])) as PlanDone,
      }
    : undefined;
  const atLoad = getItems(filled, isPaid || !!plan, plan ? {} : undefined);
  const now = getItems({ ...filled, ...later }, isPaid || !!plan, planItems);
  const missing = new Set(
    atLoad
      .filter(({ isDone, kind }) => !isDone || kind === 'included')
      .map(({ id }) => id),
  );

  if (isDismissed) {
    return null;
  }

  return (
    <CompanyPageReadiness
      title={
        plan ? `Get the most out of ${plan}` : 'Level up your look and feel'
      }
      description={
        plan
          ? 'Everything your plan includes, and how to use it.'
          : 'Developers open your page and your profile from every post you write.'
      }
      rows={now.filter(({ id }) => missing.has(id))}
      done={now.filter(({ id, isDone }) => isDone && !missing.has(id))}
      getPrompt={() => ''}
      onTrySkill={({ id }) => setTried((ids) => [...ids, id])}
      onDismiss={() => setDismissed(true)}
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
          .map(({ agentStep }) => agentStep as string),
      })}
    </pre>
  ),
};

const starterFilled: Filled = {
  logo: true,
  description: true,
  cover: true,
  website: true,
  photo: true,
  headline: true,
};

export const StarterPlan: Story = {
  render: () => (
    <Column>
      <Readiness plan="Starter" filled={starterFilled} />
    </Column>
  ),
};

export const TeamPlan: Story = {
  render: () => (
    <Column>
      <Readiness
        plan="Team"
        filled={{ ...starterFilled, links: true, product: true, job: true }}
      />
    </Column>
  ),
};

export const StarterPlanPhone: Story = {
  render: () => (
    <Column width={358}>
      <Readiness plan="Starter" filled={starterFilled} />
    </Column>
  ),
};

export const PlanCopiedPrompt: Story = {
  render: () => (
    <pre
      className="whitespace-pre-wrap rounded-12 bg-surface-float p-4 typo-footnote"
      style={{ width: 640 }}
    >
      {getCompanyPageReadinessPrompt({
        handle: 'acme',
        plan: 'Starter',
        steps: getItems(starterFilled, true, {})
          .filter(({ isDone, agentStep }) => !isDone && agentStep)
          .map(({ agentStep }) => agentStep as string),
      })}
    </pre>
  ),
};
