import ShowMoreContent from '@dailydotdev/shared/src/components/cards/common/ShowMoreContent';
import { Meta } from '@storybook/react-vite';
import { StoryObj } from '@storybook/react-vite';
import { ShowMoreContentProps } from '@dailydotdev/shared/src/components/cards/common/ShowMoreContent';
import { TLDRText } from '@dailydotdev/shared/src/components/utilities';
import React from 'react';

const meta: Meta<typeof ShowMoreContent> = {
  title: 'Components/ShowMore',
  component: ShowMoreContent,
  render: (args) => {
    return (
      <div className="max-w-lg">
        <ShowMoreContent {...args} />
      </div>
    );
  },
};

const defaultProps: ShowMoreContentProps = {
  content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
  threshold: 50,
  charactersLimit: 150,
};

export default meta;

type Story = StoryObj<typeof ShowMoreContent>;

export const Default: Story = {
  args: { ...defaultProps },
};

export const WithPrefix: Story = {
  args: { ...defaultProps, contentPrefix: <TLDRText>TLDR</TLDRText> },
};
