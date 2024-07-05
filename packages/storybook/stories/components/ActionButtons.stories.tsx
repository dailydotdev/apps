import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ActionButtons
  from '@dailydotdev/shared/src/components/cards/list/ActionButtons';
import { UserVote } from '@dailydotdev/shared/src/graphql/posts';
import post from '@dailydotdev/shared/__tests__/fixture/post';
import ExtensionProviders from '../extension/_providers';

const meta: Meta<typeof ActionButtons> = {
  title: 'components/ActionButtons',
  component: ActionButtons,
  args: {
    post: {
      ...post,
      id: '1',
      numUpvotes: 10,
      userState: {
        vote: UserVote.None,
      },
    },
    onUpvoteClick: fn(),
    onDownvoteClick: fn(),
    onCommentClick: fn(),
    onBookmarkClick: fn(),
    onCopyLinkClick: fn(),
  },
  render: (props) => {
    return <ExtensionProviders><ActionButtons {...props} /></ExtensionProviders>;
  },
};

export default meta;

type Story = StoryObj<typeof ActionButtons>;

export const Default: Story = {};

export const AnimatedUpvote: Story = {};
