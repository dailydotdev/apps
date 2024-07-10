import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { NavDrawer } from '@dailydotdev/shared/src/components/drawers/NavDrawer';
import {
  AddUserIcon,
  BellIcon,
  CardIcon,
  EditIcon,
  LockIcon,
  TrashIcon,
} from '@dailydotdev/shared/src/components/icons';

const meta: Meta<typeof NavDrawer> = {
  title: 'Components/Drawers/NavDrawer',
  component: NavDrawer,
  parameters: {
    controls: {
      expanded: true,
    },
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=999%3A2766&mode=dev',
    },
  },
  args: {
    header: 'Settings',
    items: [
      {
        label: 'Profile',
        isHeader: true,
      },
      { label: 'Edit', icon: <EditIcon />, href: '/edit' },
      { label: 'Invite', icon: <AddUserIcon /> },
      { label: 'Delete', icon: <TrashIcon /> },
      {
        label: 'Manage',
        isHeader: true,
      },
      { label: 'Customize', icon: <CardIcon /> },
      { label: 'Security', icon: <LockIcon /> },
      { label: 'Notifications', icon: <BellIcon /> },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof NavDrawer>;

export const Drawer: Story = {
  render: (props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button variant={ButtonVariant.Primary} onClick={() => setIsOpen(true)}>
          Trigger
        </Button>
        <NavDrawer
          {...props}
          drawerProps={{
            isOpen,
            onClose: () => setIsOpen(false),
          }}
          items={props.items}
        />
      </>
    );
  },
  name: 'Nav Drawer',
};
