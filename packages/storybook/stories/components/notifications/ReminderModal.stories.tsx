import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { ReminderModal } from '@dailydotdev/shared/src/components/notifications/ReminderModal';
import ExtensionProviders from '../../extension/_providers';
import { Button } from '@dailydotdev/shared/src/components/buttons/Button';
import { useToggle } from '@dailydotdev/shared/src/hooks/useToggle';
import { fn } from '@storybook/test';

const meta: Meta<typeof ReminderModal> = {
  title: 'components/Notifications/ReminderModal',
  component: ReminderModal,
  args: {
    onReminderSet: fn(),
    onRequestClose: fn(),
  },
  beforeEach: async () => {},
  render: (props) => {
    const [isOpen, toggle] = useToggle(true);

    return (
      <ExtensionProviders>
        <Button onClick={() => toggle()}>Toggle modal</Button>
        <div className={'py-20'}>
          <ReminderModal
            {...props}
            isOpen={isOpen}
            onRequestClose={() => {
              toggle();
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

type Story = StoryObj<typeof ReminderModal>;

export const Default: Story = {};
