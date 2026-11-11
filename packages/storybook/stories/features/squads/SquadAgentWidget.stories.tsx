import type { ReactElement } from 'react';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type {
  SourceMember,
  Squad,
} from '@dailydotdev/shared/src/graphql/sources';
import { SourceMemberRole } from '@dailydotdev/shared/src/graphql/sources';
import { SquadPageContextProvider } from '@dailydotdev/shared/src/features/squads/SquadPageContext';
import { SquadAgentWidget } from '@dailydotdev/shared/src/features/squads/components/widgets/SquadAgentWidget';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { defaultBootData, getBootMock } from '../../../mock/boot';
import ExtensionProviders from '../../extension/_providers';
import { squad as data } from './data';

// The right column card that tells the team of a verified company squad
// (Enterprise) they can run the page from their agent over the daily.dev MCP
// server, or from code through the public API.

const makeSquad = (seat: boolean): Squad =>
  ({
    id: `agent-widget-${seat ? 'seat' : 'no-seat'}`,
    handle: data.handle,
    name: data.name,
    image: data.image,
    type: 'squad',
    public: true,
    features: { verified: true },
    currentMember: {
      role: SourceMemberRole.Admin,
      seat,
      permissions: [],
    } as unknown as SourceMember,
  }) as unknown as Squad;

const Column = ({ seat }: { seat: boolean }): ReactElement => (
  <div style={{ width: 320 }}>
    <SquadPageContextProvider squad={makeSquad(seat)} isViewerReady>
      <SquadAgentWidget />
    </SquadPageContextProvider>
  </div>
);

const WhenUser = ({ children }: { children: ReactElement }) => {
  const { user } = useAuthContext();

  return user ? children : null;
};

const meta: Meta = {
  title: 'Features/Squads/Verified squad agent widget',
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
        <div className="p-6">
          <WhenUser>
            <Story />
          </WhenUser>
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj;

export const SeatHolder: Story = {
  render: () => <Column seat />,
};

export const AdminWithoutSeat: Story = {
  render: () => <Column seat={false} />,
};
