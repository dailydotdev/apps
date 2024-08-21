import type { Meta, StoryObj } from '@storybook/react';
import { SquadList } from '@dailydotdev/shared/src/components/squads/cards/directory/SquadList';
import { SourceMemberRole, SourceType } from '@dailydotdev/shared/src/graphql/sources';

const meta: Meta<typeof SquadList> = {
  title: 'Components/Cards/Squad/SquadList',
  component: SquadList,
  args: {
    isUserSquad: false,
    action: {
      text: 'View Squad',
      type: 'link',
      href: 'https://daily.dev',
    },
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
      handle: 'squad-handle'
    },
  },
  decorators: [
    (Story) => (
        <Story />
    ),
  ]
};

export default meta;

type Story = StoryObj<typeof SquadList>;

export const Default: Story = {
  name: 'SquadList',
};
