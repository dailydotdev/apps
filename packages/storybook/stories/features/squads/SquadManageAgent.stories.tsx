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

// The Agent and API section of a verified company squad's Manage page: the
// page's agent card, kept in settings so it is there after the card is dismissed.

const makeSquad = (
  seat: boolean,
  isPaid = true,
  features: Squad['features'] = { verified: true },
): Squad =>
  ({
    id: `manage-agent-${seat ? 'seat' : 'no-seat'}${isPaid ? '' : '-free'}`,
    handle: data.handle,
    name: data.name,
    image: data.image,
    type: 'squad',
    public: true,
    features: isPaid ? features : {},
    moderationPostCount: 0,
    currentMember: {
      role: SourceMemberRole.Admin,
      seat,
      permissions: Object.values(SourcePermissions),
    } as unknown as SourceMember,
  }) as unknown as Squad;

const Page = ({
  seat,
  isPaid = true,
  section = SquadManageSection.Agent,
  features,
}: {
  seat: boolean;
  isPaid?: boolean;
  section?: SquadManageSection;
  features?: Squad['features'];
}): ReactElement => (
  <SquadPageContextProvider
    squad={makeSquad(seat, isPaid, features)}
    isViewerReady
  >
    <SquadManagePage section={section} />
  </SquadPageContextProvider>
);

const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Squads/Manage agent and API',
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

export const SeatHolder: Story = {
  render: () => <Page seat />,
};

export const AdminWithoutSeat: Story = {
  render: () => <Page seat={false} />,
};

// No plan at all: the section is locked in the menu and leads to Subscription
export const FreeSquadAdmin: Story = {
  render: () => (
    <Page seat={false} isPaid={false} section={SquadManageSection.Rules} />
  ),
};

// daily.dev for Startups Starter: not verified, but the plan includes the API
export const StarterPlanAdmin: Story = {
  render: () => <Page seat features={{ products: true, links: true }} />,
};
