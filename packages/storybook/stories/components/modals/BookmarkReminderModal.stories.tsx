import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { BookmarkReminderModal } from '@dailydotdev/shared/src/components/modals/post/BookmarkReminderModal';
import ExtensionProviders from '../../extension/_providers';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useToggle } from '@dailydotdev/shared/src/hooks/useToggle';
import { fn } from '@storybook/test';
import post from '@dailydotdev/shared/__tests__/fixture/post';

const meta: Meta<typeof BookmarkReminderModal> = {
  title: 'components/Modals/BookmarkReminderModal',
  component: BookmarkReminderModal,
  args: {
    onReminderSet: fn(),
    onRequestClose: fn(),
    post: post
  },
  beforeEach: async () => {},
  render: (props) => {
    const [isOpen, toggle] = useToggle(true);

    return (
      <ExtensionProviders>
        <Button onClick={() => toggle()}>Toggle modal</Button>
        <div className={'py-20'}>
          <BookmarkReminderModal
            {...props}
            isOpen={isOpen}
            onRequestClose={() => {
              toggle(false);
            }}
          />
        </div>
      </ExtensionProviders>
    );
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/proto/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=11948-88340&t=gwv0XNAQIwQWLzOS-0&scaling=min-zoom&content-scaling=fixed&page-id=11947%3A88177',
    },
  },
};

export default meta;

type Story = StoryObj<typeof BookmarkReminderModal>;

export const Default: Story = {};
