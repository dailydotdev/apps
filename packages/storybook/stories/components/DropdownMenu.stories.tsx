import type { Meta, StoryObj } from '@storybook/react';
import { DropdownMenu } from '@dailydotdev/shared/src/components/dropdown/DropdownMenu';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'The trigger element that opens the dropdown',
    },
    options: {
      control: 'object',
      description: 'Array of menu items to display in the dropdown',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    children: <button>Open Menu</button>,
    options: [
      {
        label: 'Edit',
        icon: '✏️',
        action: () => console.log('Edit clicked'),
      },
      {
        label: 'Delete',
        icon: '🗑️',
        action: () => console.log('Delete clicked'),
      },
    ],
  },
};

export const WithDisabledItem: Story = {
  args: {
    children: <button>Menu with Disabled Item</button>,
    options: [
      {
        label: 'Active Option',
        icon: '✅',
        action: () => console.log('Active clicked'),
      },
      {
        label: 'Disabled Option',
        icon: '⚠️',
        action: () => console.log('Disabled clicked'),
        disabled: true,
      },
    ],
  },
};

export const CustomTrigger: Story = {
  args: {
    children: (
      <button className="p-2 rounded-full bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="4" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="20" r="2" />
        </svg>
      </button>
    ),
    options: [
      {
        label: 'View Profile',
        icon: '👤',
        action: () => console.log('View Profile clicked'),
      },
      {
        label: 'Settings',
        icon: '⚙️',
        action: () => console.log('Settings clicked'),
      },
      {
        label: 'Logout',
        icon: '🚪',
        action: () => console.log('Logout clicked'),
      },
    ],
  },
};

export const LongList: Story = {
  args: {
    children: <button>Menu with Many Options</button>,
    options: Array.from({ length: 8 }, (_, i) => ({
      label: `Option ${i + 1}`,
      icon: '📝',
      action: () => console.log(`Option ${i + 1} clicked`),
    })),
  },
};
