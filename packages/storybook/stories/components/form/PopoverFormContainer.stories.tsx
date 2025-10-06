import type { Meta, StoryObj } from '@storybook/react-vite';
import { PopoverFormContainer } from '@dailydotdev/shared/src/features/common/components/PopoverFormContainer';

const meta: Meta<typeof PopoverFormContainer> = {
  title: 'Components/Form/PopoverFormContainer',
  component: PopoverFormContainer,
  args: {},
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=35737-567657&m=dev',
    },
  },
  render: (props) => {
    return (
      <div className="max-w-lg">
        <PopoverFormContainer {...props} />
      </div>
    );
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PopoverFormContainer>;

export const Default: Story = {
  args: {
    triggerChildren: (
      <div className="flex items-center gap-2">
        <img
          className="rounded-4"
          src="https://placehold.co/24x24"
          alt="Kitten"
        />
        <span>Everyone</span>
      </div>
    ),
    children: (
      <>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i}>content</div>
        ))}
      </>
    ),
  },
};
