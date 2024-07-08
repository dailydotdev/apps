import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Post, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import post from '@dailydotdev/shared/__tests__/fixture/post';
import ExtensionProviders from '../extension/_providers';
import { UpvoteExperiment } from '@dailydotdev/shared/src/lib/featureValues';
import ActionButtons from '@dailydotdev/shared/src/components/cards/ActionsButtons/ActionButtons';
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
    useConditionalFeature.mockReturnValue({
      value: UpvoteExperiment.Control,
      isLoading: false,
    });
  },
  render: (props) => {
    const { value: currentFeature } = useConditionalFeature();

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
        <>Feature: "{currentFeature}"</>
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
    useConditionalFeature.mockReturnValue({
      value: UpvoteExperiment.Control,
      isLoading: false,
    });
  },
};

export const AnimatedUpvote: Story = {
  beforeEach: async () => {
    useConditionalFeature.mockReturnValue({
      value: UpvoteExperiment.Animated,
      isLoading: false,
    });
  },
};
