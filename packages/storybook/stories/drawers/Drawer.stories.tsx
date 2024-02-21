import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
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
    const ref = useRef<{ onClose(): void }>();

    return (
      <>
        <Button variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
          Trigger
        </Button>
        <DrawerComponent {...props} ref={ref} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Container>Test</Container>
          <Container>Test</Container>
          <Container>Test</Container>
          <Container>Test</Container>
          <Button
            variant={ButtonVariant.Float}
            onClick={() => ref.current.onClose()}
          >
            Close
          </Button>
        </DrawerComponent>
      </>
    );
  },
  name: 'Drawer',
  args: { position: DrawerPosition.Bottom, },
};
