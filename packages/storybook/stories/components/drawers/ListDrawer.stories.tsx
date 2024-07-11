import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  ListDrawer
} from '@dailydotdev/shared/src/components/drawers/ListDrawer';

const meta: Meta<typeof ListDrawer> = {
  title: 'Components/Drawers/ListDrawer',
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
  args: {
    options: ['Option 1', 'Option 2', 'Option 3'],
  }
};

export default meta;

type Story = StoryObj<typeof ListDrawer>;

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
          options={props.options}
          selected={selected}
          onSelectedChange={({ index }) => setSelected(index)}
        />
        <p className="mt-4 typo-footnote text-text-tertiary">One thing to note:<br/>When implementing a custom "Close" button,you will have to utilize injecting a `ref` object which you will use when closing the drawer to keep the exit animation. <br/>The sample code here does that.</p>
      </>
    );
  },
  name: 'List Drawer',
};
