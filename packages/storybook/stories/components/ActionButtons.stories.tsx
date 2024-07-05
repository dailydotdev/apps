import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import ActionButtons from '@dailydotdev/shared/src/components/cards/list/ActionButtons/ActionButtons';
import { Post, UserVote } from '@dailydotdev/shared/src/graphql/posts';
import post from '@dailydotdev/shared/__tests__/fixture/post';
import ExtensionProviders from '../extension/_providers';
import { feature } from '@dailydotdev/shared/src/lib/featureManagement';
import { useFeature } from '../../mock/GrowthBookProvider';
import { UpvoteExperiment } from '@dailydotdev/shared/src/lib/featureValues';

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
  beforeEach: async () => {
    useFeature.mockReturnValue(UpvoteExperiment.Control);
  },
  render: (props) => {
    const currentFeature = useFeature(feature.upvote);
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
        <hr className={'my-4 border-accent-salt-baseline'}/>
        <ActionButtons {...props} post={post} onUpvoteClick={onUpvoteClick} />
      </ExtensionProviders>
    );
  },
};

export default meta;

type Story = StoryObj<typeof ActionButtons>;

export const Default: Story = {};

export const AnimatedUpvote: Story = {
  beforeEach: async () => {
    useFeature.mockReturnValue(UpvoteExperiment.Animated);
  },
};
