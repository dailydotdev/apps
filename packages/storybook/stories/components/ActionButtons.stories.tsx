import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Post, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import post from '@dailydotdev/shared/__tests__/fixture/post';
import ExtensionProviders from '../extension/_providers';
import ActionButtons from '@dailydotdev/shared/src/components/cards/ActionsButtons/ActionButtons';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { useConditionalFeature } from '../../mock/hooks';

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
    onCommentClick: fn(),
    onBookmarkClick: fn(),
    onCopyLinkClick: fn(),
  },
  beforeEach: async () => {
    useConditionalFeature.mockReturnValue({ value: false });
  },
  render: (props) => {
    const currentFeature = useConditionalFeature(feature.animatedUpvote);

    const [post, setPost] = useState(props.post);
    const onUpvoteClick = async (post: Post) => {
      const isAdding = post.userState?.vote !== UserVote.Up;

      const updatedPost = {
        ...post,
        numUpvotes: (post?.numUpvotes ?? 0) + (isAdding ? 1 : -1),
        userState: { vote: isAdding ? UserVote.Up : UserVote.None },
      };
      setPost(updatedPost);
      props.onUpvoteClick(updatedPost);
    };

    return (
      <ExtensionProviders>
        <>Animated upvote button: "{`${currentFeature.value}`}"</>
        <hr className={'my-4 border-accent-salt-baseline'} />

        <div className={'py-20 grid place-items-center'}>
          <ActionButtons {...props} post={post} onUpvoteClick={onUpvoteClick} />
        </div>
      </ExtensionProviders>
    );
  },
};

export default meta;

type Story = StoryObj<typeof ActionButtons>;

export const Default: Story = {
  beforeEach: async () => {
    useConditionalFeature.mockReturnValue({ value: false });
  },
};

export const AnimatedUpvote: Story = {
  beforeEach: async () => {
    useConditionalFeature.mockReturnValue({ value: true });
  },
};
