import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import type { ExpandableContentProps } from '@dailydotdev/shared/src/components/ExpandableContent';
import { ExpandableContent } from '@dailydotdev/shared/src/components/ExpandableContent';

const meta: Meta<typeof ExpandableContent> = {
  title: 'Components/ExpandableContent',
  component: ExpandableContent,
  tags: ['autodocs'],
  argTypes: {
    maxHeight: {
      control: { type: 'number', min: 100, max: 800, step: 10 },
      description: 'Maximum height in pixels before showing "See More" button',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;

type Story = StoryObj<typeof ExpandableContent>;

const LongTextContent = () => (
  <div>
    <h2 className="mb-4 text-2xl font-bold">Long Text Content</h2>
    <p className="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
      veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
      commodo consequat.
    </p>
    <p className="mb-4">
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
      dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
      proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <p className="mb-4">
      Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
      doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
      veritatis et quasi architecto beatae vitae dicta sunt explicabo.
    </p>
    <p className="mb-4">
      Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
      sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
    </p>
    <p className="mb-4">
      Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur,
      adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et
      dolore magnam aliquam quaerat voluptatem.
    </p>
    <p className="mb-4">
      Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit
      laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure
      reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.
    </p>
    <p className="mb-4">
      At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis
      praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias
      excepturi sint occaecati cupiditate non provident.
    </p>
  </div>
);

export const Default: Story = {
  args: {
    maxHeight: 320,
  },
  render: (args: ExpandableContentProps) => (
    <ExpandableContent {...args}>
      <LongTextContent />
    </ExpandableContent>
  ),
};

const ContentWithImages = () => (
  <div>
    <h2 className="mb-4 text-2xl font-bold">Content with Images</h2>
    <p className="mb-4">
      This content includes images that should be properly handled by the
      component's height detection.
    </p>
    <img
      src="https://picsum.photos/400/300"
      alt="Random placeholder"
      className="mb-4 w-full rounded-lg"
    />
    <p className="mb-4">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. The image above
      should be included in the height calculation to properly show or hide the
      "See More" button.
    </p>
    <img
      src="https://picsum.photos/400/200"
      alt="Another placeholder"
      className="mb-4 w-full rounded-lg"
    />
    <p className="mb-4">
      More content below the second image to ensure the total height exceeds the
      maximum and triggers the expandable behavior.
    </p>
  </div>
);

export const WithImages: Story = {
  args: {
    maxHeight: 320,
  },
  render: (args: ExpandableContentProps) => (
    <ExpandableContent {...args}>
      <ContentWithImages />
    </ExpandableContent>
  ),
};
