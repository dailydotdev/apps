import type { Meta, StoryObj } from '@storybook/react';
import { ExtensionProviders } from '../../../extension/_providers';
import { SquadList } from '@dailydotdev/shared/src/components/cards/squad/SquadList';
import {
  SourceMemberRole,
  SourceType,
} from '@dailydotdev/shared/src/graphql/sources';
import AuthContext from '@dailydotdev/shared/src/contexts/AuthContext';

const meta: Meta<typeof SquadList> = {
  title: 'Components/Cards/Squad/SquadList',
  component: SquadList,
  args: {
    shouldShowCount: false,
    squad: {
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
        <div className="w-96 p-4 border border-border-subtlest-primary rounded-16">
          <Story />
        </div>
      </ExtensionProviders>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof SquadList>;

export const Default: Story = {
  name: 'SquadList',
};
