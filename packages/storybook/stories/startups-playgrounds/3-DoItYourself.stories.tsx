import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Squad } from '@dailydotdev/shared/src/graphql/sources';
import { SquadPlan } from '@dailydotdev/shared/src/features/squads/lib/plans';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { SquadManageBranding } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageBranding';
import { SquadManageDetails } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageDetails';
import { SquadManageLayout } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLayout';
import { SquadManageLinks } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageLinks';
import { SquadManagePlan } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePlan';
import {
  SquadManageProductForm,
  SquadManageProducts,
} from '@dailydotdev/shared/src/features/squads/components/manage/SquadManageProducts';
import type { SquadBranding } from '@dailydotdev/shared/src/graphql/squadBranding';
import type { SquadProduct } from '@dailydotdev/shared/src/graphql/squadProducts';
import { SetupPath, SetupScreen } from '../startups-onboarding/screens';
import { sampleProduct } from '../startups-onboarding/setupEditor';
import { Providers } from '../startups-onboarding/providers';
import { acmeTeam, Seeded, teamPlan } from './seed';

// The do-it-yourself checklist first: in the onboarding, each action opens its
// settings page in the right box, or as its own page on a phone. Then those real
// manage pages on their own, empty and filled, as they look inside settings.

const meta: Meta = {
  title: 'Startups Onboarding/3. Do it yourself',
  parameters: { layout: 'fullscreen' },
  globals: { theme: 'dark' },
  decorators: [
    (Story) => (
      <Providers>
        <div className="min-h-screen bg-background-default">
          <Story />
        </div>
      </Providers>
    ),
  ],
};

export default meta;

type Story = StoryObj;

const filled = {
  ...acmeTeam,
  description: 'Deploy previews your whole team can review.',
  website: 'https://acme.dev',
  links: [
    'https://docs.acme.dev',
    'https://github.com/acme',
    'https://acme.dev/changelog',
  ],
} as Squad;

const buttonOn = {
  color: '#7C6BEA',
  button: { enabled: true, label: 'Start free', url: 'https://acme.dev' },
} as unknown as SquadBranding;

const Edit = ({
  section,
  squad = acmeTeam,
  products,
  branding,
  children,
}: {
  section: SquadManageSection;
  squad?: Squad;
  products?: SquadProduct[];
  branding?: SquadBranding;
  children: ReactNode;
}): ReactElement => (
  <Seeded
    squad={squad}
    subscription={teamPlan}
    products={products}
    branding={branding}
  >
    <SquadManageLayout section={section}>{children}</SquadManageLayout>
  </Seeded>
);

export const TheList: Story = {
  name: 'The list: click any action, then Save',
  render: () => (
    <SetupScreen
      plan={SquadPlan.Team}
      initialPath={SetupPath.Manual}
      done={{ details: true }}
    />
  ),
};

export const LogoAndDescription: Story = {
  name: 'Logo and description',
  render: () => (
    <Edit section={SquadManageSection.Details}>
      <SquadManageDetails />
    </Edit>
  ),
};

export const WebsiteAndLinks: Story = {
  name: 'Website and links, empty',
  render: () => (
    <Edit section={SquadManageSection.Links}>
      <SquadManageLinks />
    </Edit>
  ),
};

export const WebsiteAndLinksFilled: Story = {
  name: 'Website and links, filled',
  render: () => (
    <Edit section={SquadManageSection.Links} squad={filled}>
      <SquadManageLinks />
    </Edit>
  ),
};

export const YourProduct: Story = {
  name: 'Your product, empty',
  render: () => (
    <Edit section={SquadManageSection.Products}>
      <SquadManageProducts />
    </Edit>
  ),
};

export const YourProductFilled: Story = {
  name: 'Your product, filled',
  render: () => (
    <Edit section={SquadManageSection.Products} products={[sampleProduct]}>
      <SquadManageProducts />
    </Edit>
  ),
};

export const AddProduct: Story = {
  name: 'Your product, add',
  render: () => (
    <Edit section={SquadManageSection.Products}>
      <SquadManageProductForm />
    </Edit>
  ),
};

export const EditProduct: Story = {
  name: 'Your product, edit',
  render: () => (
    <Edit section={SquadManageSection.Products} products={[sampleProduct]}>
      <SquadManageProductForm productId={sampleProduct.id} />
    </Edit>
  ),
};

export const HeaderCta: Story = {
  name: 'Header CTA, off',
  render: () => (
    <Edit section={SquadManageSection.Branding}>
      <SquadManageBranding />
    </Edit>
  ),
};

export const HeaderCtaOn: Story = {
  name: 'Header CTA, on',
  render: () => (
    <Edit section={SquadManageSection.Branding} branding={buttonOn}>
      <SquadManageBranding />
    </Edit>
  ),
};

export const GiveSeats: Story = {
  name: 'Give your team seats',
  render: () => (
    <Edit section={SquadManageSection.Plan}>
      <SquadManagePlan />
    </Edit>
  ),
};

export const ConnectAgent: Story = {
  name: 'Connect your agent',
  render: () => <SetupScreen plan={SquadPlan.Team} />,
};
