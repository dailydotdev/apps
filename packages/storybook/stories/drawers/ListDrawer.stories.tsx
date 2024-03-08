import { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import classed from '@dailydotdev/shared/src/lib/classed';
import { DrawerPosition } from '@dailydotdev/shared/src/components/drawers/Drawer';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ListDrawer
} from '@dailydotdev/shared/src/components/drawers/ListDrawer';

const meta: Meta<typeof ListDrawer> = {
  component: ListDrawer,
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
    options: {
      description: 'Comma separated list of options (only in storybook)',
      control: { type: 'text', separator: ',' },
      defaultValue: {
        summary: 'Option 1, Option 2, Option 3',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ListDrawer>;

const Container = classed('div', 'px-3 py-4 border-b border-theme-divider-tertiary');

export const Drawer: Story = {
  render: (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(-1);

    return (
      <>
        <Button variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
          Trigger
        </Button>
        <ListDrawer
          {...props}
          drawerProps={{
            isOpen,
            displayCloseButton: true,
            onClose: () => setIsOpen(false)
          }}
          options={props.options?.toString().split(',') ?? []} // only in storybook - for some reason, they are not accepting array properly
          selected={selected}
          onSelectedChange={({ index }) => setSelected(index)}
        />
        <p className="mt-4 typo-footnote text-theme-label-tertiary">One thing to note:<br/>When implementing a custom "Close" button,you will have to utilize injecting a `ref` object which you will use when closing the drawer to keep the exit animation. <br/>The sample code here does that.</p>
      </>
    );
  },
  name: 'List Drawer',
};
