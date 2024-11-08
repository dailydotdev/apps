import type { Meta, StoryObj } from '@storybook/react';
import { QueryClientProvider } from '../../../extension/_providers';
import { SquadGrid } from '@dailydotdev/shared/src/components/cards/squad/SquadGrid';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { defaultSquadToken } from '@dailydotdev/shared/__tests__/fixture/squads';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';

const meta: Meta<typeof SquadGrid> = {
  title: 'Components/Cards/Squad/SquadGrid',
  component: SquadGrid,
  args: {
    source: {
      name: 'Squad Name',
      permalink: 'https://daily.dev',
      id: '123',
      active: true,
      public: true,
      type: SourceType.Squad,
      membersCount: 232093,
      description: 'Squad description',
      memberPostingRole: SourceMemberRole.Admin,
      memberInviteRole: SourceMemberRole.Admin,
      image: 'https://via.placeholder.com/150',
      handle: 'squad-handle',
      members: {
        edges: [
          {
            node: {
              user: {
                id: 'Se4LmwLU0q6aVDpX1MkqX',
                name: 'Lee Hansel Solevilla',
                image:
                  'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
                permalink: 'http://webapp.local.com:5002/a123124124111',
                username: 'a123124124111',
              },
              source: null,
              referralToken: defaultSquadToken,
              role: SourceMemberRole.Admin,
            },
          },
          {
            node: {
              user: {
                id: 'Se4LmwLU0q6aVDpX1MkqX',
                name: 'Lee Hansel Solevilla',
                image:
                  'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
                permalink: 'http://webapp.local.com:5002/a123124124111',
                username: 'a123124124111',
              },
              source: null,
              referralToken: defaultSquadToken,
              role: SourceMemberRole.Admin,
            },
          },
          {
            node: {
              user: {
                id: 'Se4LmwLU0q6aVDpX1MkqX',
                name: 'Lee Hansel Solevilla',
                image:
                  'https://media.daily.dev/image/upload/s--O0TOmw4y--/f_auto/v1715772965/public/noProfile',
                permalink: 'http://webapp.local.com:5002/a123124124111',
                username: 'a123124124111',
              },
              source: null,
              referralToken: defaultSquadToken,
              role: SourceMemberRole.Admin,
            },
          },
        ],
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider>
        <AuthContext.Provider value={{}}>
          <div className="grid grid-cols-3 gap-4">
            <Story />
          </div>
        </AuthContext.Provider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SquadGrid>;

export const Default: Story = {
  name: 'SquadGrid',
};
