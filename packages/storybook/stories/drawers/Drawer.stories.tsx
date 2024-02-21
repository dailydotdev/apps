import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { StorybookDrawerTrigger } from '@dailydotdev/shared/src/components/drawers';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Drawer as DrawerComponent,
  DrawerPosition,
} from '@dailydotdev/shared/src/components/drawers/Drawer';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';

const meta: Meta<typeof DrawerComponent> = {
  component: DrawerComponent,
  parameters: {
    controls: {
      expanded: true,
    },
    design: {
      type: "figma",
      url: "https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=2384%3A21195&mode=dev",
    },
  },
  argTypes: {
    position: {
      control: { type: "radio" },
      options: DrawerPosition,
    },
    title: {
      control: { type: "text" },
    },
    closeOnOutsideClick: {
      control: { type: "boolean" },
    }
  },
};

export default meta;

type Story = StoryObj<typeof DrawerComponent>;

const Container = classed('div', 'px-3 py-4 border-b border-theme-divider-tertiary');

export const Drawer: Story = {
  render: ({ children, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
          Trigger
        </Button>
        {isOpen && (
          <DrawerComponent {...props} onClose={() => setIsOpen(false)}>
            <Container>Test</Container>
            <Container>Test</Container>
            <Container>Test</Container>
            <Container>Test</Container>
            <Button
              variant={ButtonVariant.Float}
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </DrawerComponent>
        )}
      </>
    );
  },
  name: 'Position',
  args: { position: DrawerPosition.Bottom, },
};
