import type { Meta, StoryObj } from '@storybook/react';
import { StorybookDrawerTrigger } from '@dailydotdev/shared/src/components/drawers';
import classed from '@dailydotdev/shared/src/lib/classed';
import {
  Drawer as DrawerComponent,
  DrawerPosition,
} from '@dailydotdev/shared/src/components/drawers/Drawer';

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
  },
};

export default meta;

type Story = StoryObj<typeof DrawerComponent>;

const Container = classed('div', 'px-3 py-4 border-b border-theme-divider-tertiary');

export const Drawer: Story = {
  render: ({ children, ...props }) => {
    return (
      <StorybookDrawerTrigger {...props} className={{ drawer: 'gap-3 pb-4' }}>
        <Container>Test</Container>
        <Container>Test</Container>
        <Container>Test</Container>
        <Container>Test</Container>
      </StorybookDrawerTrigger>
    );
  },
  name: 'Position',
  args: { position: DrawerPosition.Bottom, },
};
