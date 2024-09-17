import type { Meta, StoryObj } from '@storybook/react';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { UnfeaturedSquadGrid } from '@dailydotdev/shared/src/components/cards/squad/UnfeaturedSquadGrid';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { QueryClientProvider } from '../../../extension/_providers';

const meta: Meta<typeof UnfeaturedSquadGrid> = {
  title: 'Components/Cards/Squad/UnfeaturedSquadGrid',
  component: UnfeaturedSquadGrid,
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
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider>
        <AuthContext.Provider value={{}}>
          <div className="grid grid-cols-4 gap-8">
            <Story />
          </div>
        </AuthContext.Provider>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof UnfeaturedSquadGrid>;

export const Default: Story = {
  name: 'UnfeaturedSquadGrid',
};
