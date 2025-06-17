import type { Meta, StoryObj } from '@storybook/react';
import { Tooltip } from '@dailydotdev/shared/src/components/tooltip/Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'The content to display in the tooltip',
    },
    open: {
      control: 'boolean',
      description: 'Controls the open state of the tooltip',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'The default open state of the tooltip',
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: 'Callback when the tooltip open state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    children: <button>Hover me</button>,
  },
};

export const WithCustomContent: Story = {
  args: {
    content: (
      <div>
        <strong>Custom Content</strong>
        <p>This tooltip has custom HTML content</p>
      </div>
    ),
    children: <button>Hover for custom content</button>,
  },
};

export const Controlled: Story = {
  args: {
    content: 'This tooltip is controlled',
    open: true,
    children: <button>Controlled tooltip</button>,
  },
};

export const WithIcon: Story = {
  args: {
    content: 'Information tooltip',
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
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>
    ),
  },
};

export const WithCustomClassName: Story = {
  args: {
    content: 'Custom styled tooltip',
    className: 'bg-blue-500 text-white',
    children: <button>Custom styled tooltip</button>,
  },
};
