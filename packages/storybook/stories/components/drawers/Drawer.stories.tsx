import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Drawer as DrawerComponent,
  DrawerPosition,
} from '@dailydotdev/shared/src/components/drawers/Drawer';
import {
  ButtonV2,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';

const meta: Meta<typeof DrawerComponent> = {
  title: 'Components/Drawers/Drawer',
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
      description: 'When this property is not null, a title bar will be rendered with this value',
    },
    closeOnOutsideClick: {
      control: { type: "boolean" },
      description: 'When true, the drawer will close when clicking anywhere on the overlay',
    }
  },
};

export default meta;

type Story = StoryObj<typeof DrawerComponent>;

const Container = classed('div', 'px-3 py-4 border-b border-border-subtlest-tertiary');

export const Drawer: Story = {
  render: ({ children, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<{ onClose(): void }>();

    return (
      <>
        <ButtonV2 variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
          Trigger
        </ButtonV2>
        <DrawerComponent {...props} ref={ref} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Container>Test</Container>
          <Container>Test</Container>
          <Container>Test</Container>
          <Container>Test</Container>
          <ButtonV2
            variant={ButtonVariant.Float}
            onClick={() => ref.current.onClose()}
          >
            Close
          </ButtonV2>
        </DrawerComponent>
        <p className="mt-4 typo-footnote text-text-tertiary">One thing to note:<br/>When implementing a custom "Close" button,you will have to utilize injecting a `ref` object which you will use when closing the drawer to keep the exit animation. <br/>The sample code here does that.</p>
      </>
    );
  },
  name: 'Drawer',
  args: { position: DrawerPosition.Bottom, },
};
