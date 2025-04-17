import type { Meta, StoryFn } from '@storybook/react';
import CommentContainer, { CommentContainerProps } from '@dailydotdev/shared/src/components/comments/CommentContainer';
import { action } from '@storybook/addon-actions';
import { SourceType } from '@dailydotdev/shared/src/graphql/sources';
import ExtensionProviders from '../../extension/_providers';

const meta: Meta<typeof CommentContainer> = {
  title: 'Components/Comments/CommentContainer',
  component: CommentContainer,
  argTypes: {
    className: { control: 'object' },
    children: { control: 'text' },
    linkToComment: { control: 'boolean' },
    showContextHeader: { control: 'boolean' },
    actions: { control: 'text' },
    onClick: { action: 'clicked' },
  },
};

export default meta;

const Template: StoryFn<CommentContainerProps> = (args) => (
  <ExtensionProviders>
    <CommentContainer {...args} />
  </ExtensionProviders>
);

export const Default = Template.bind({});
Default.args = {
    post: {
    source: {
      id: 'source-1',
      name: 'Example Source',
      permalink: '/source/example',
      type: SourceType.Squad,
      active: true,
      public: true,
      membersCount: 100,
      description: 'An example squad',
      createdAt: new Date(),
    },
    title: 'Example Post Title',
  },
  comment: {
    id: '1',
    author: {
      id: 'author-1',
      username: 'exampleUser',
      name: 'Example User',
      image: '/path/to/image.jpg',
      permalink: '/user/exampleUser',
      isPlus: true,
      companies: [],
      coresRole: 3
    },
    award: {
      image: 'https://placehold.it/300x300',
      name: 'award name'
    },
    contentHtml: '<p>This is an example comment</p>',
    permalink: '/comment/1',
    parent: undefined,
    userState: { awarded: false, vote: 0 },
    createdAt: new Date().toISOString(),
    numUpvotes: 10,
    numAwards: 2,
    post: {
    title: 'Example Post Title',
  },
  },
  commentHash: 'hash-1',
  postAuthorId: 'author-1',
  postScoutId: 'scout-1',
  className: { container: 'example-class' },
  children: 'This is a child element',
  linkToComment: true,
  showContextHeader: true,
  actions: <button>Action</button>,
  onClick: action('Comment clicked'),
};
