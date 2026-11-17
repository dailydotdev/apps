import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import {
  SourceMemberRole,
  SourcePermissions,
} from '@dailydotdev/shared/src/graphql/sources';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadManagePage } from '@dailydotdev/shared/src/features/squads/components/manage/SquadManagePage';
import { SquadManageSection } from '@dailydotdev/shared/src/features/squads/lib/routes';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';
import { squad as data } from './data';

// The Manage menu per tier: every squad lists the same sections, and a
// section its plan doesn't include shows locked to the plan that unlocks it.

const makeSquad = (id: string, features: Partial<Squad['features']>): Squad =>
  ({
    id: `manage-tiers-${id}`,
    handle: data.handle,
    name: data.name,
    image: data.image,
    type: 'squad',
    public: true,
    features,
    moderationPostCount: 0,
    currentMember: {
      role: SourceMemberRole.Admin,
      seat: Object.keys(features ?? {}).length > 0,
      permissions: Object.values(SourcePermissions),
    } as unknown as SourceMember,
  }) as unknown as Squad;

const Page = ({
  id,
  features,
}: {
  id: string;
  features: Partial<Squad['features']>;
}): ReactElement => (
  <SquadPageContextProvider squad={makeSquad(id, features)} isViewerReady>
    <SquadManagePage section={SquadManageSection.Details} />
  </SquadPageContextProvider>
);

const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Squads/Manage menu per tier',
  parameters: { layout: 'fullscreen' },
  beforeEach: () => {
    getBootMock.mockReturnValue({
      ...defaultBootData,
      user: defaultUser,
      squads: [],
      accessToken: { token: '1', expiresIn: '1' },
      visit: { sessionId: '1', visitId: '1' },
      feeds: [],
    } as ReturnType<typeof getBootMock>);
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <WhenUser>
          <Story />
        </WhenUser>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

// What every daily.dev for Startups plan turns on that the app reads
const base = { links: true, products: true };

export const Free: Story = {
  render: () => <Page id="free" features={{}} />,
};

export const StartupsStarter: Story = {
  render: () => <Page id="starter" features={base} />,
};

export const StartupsTeam: Story = {
  render: () => <Page id="team" features={{ ...base, cta: true }} />,
};

export const Enterprise: Story = {
  render: () => (
    <Page
      id="enterprise"
      features={{
        ...base,
        cta: true,
        verified: true,
        adFree: true,
        jobs: true,
      }}
    />
  ),
};
