import type { Meta, StoryObj } from '@storybook/react';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import { UnfeaturedSquadGrid } from '@dailydotdev/shared/src/components/cards/squad/UnfeaturedSquadGrid';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';
import { ExtensionProviders } from '../../../extension/_providers';

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
      moderationRequired: false,
      moderationPostCount: 0,
    },
  },
  decorators: [
    (Story) => (
      <ExtensionProviders>
        <div className="grid grid-cols-4 gap-8">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof UnfeaturedSquadGrid>;

export const Default: Story = {
  name: 'UnfeaturedSquadGrid',
};
