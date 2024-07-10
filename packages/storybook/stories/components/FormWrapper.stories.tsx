import type { Meta, StoryObj } from '@storybook/react';
import { FormWrapper } from '@dailydotdev/shared/src/components/fields/form';

const meta: Meta<typeof FormWrapper> = {
  title: 'Components/FormWrapper',
  component: FormWrapper,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    copy: {
      description: 'The copy for the `left` and `right` buttons',
      control: {
        type: 'object',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof FormWrapper>;


export const Wrapper: Story = {
  render: (props) => {
    return (
      <div className='grid grid-cols-2 w-full'>
        <h2>Without Wrapper:</h2>
        <h2>Wrapper:</h2>
        <div style={{ width: '20rem' }}>
          <div className='bg-background-subtle p-4'>Content</div>
        </div>
        <div style={{ width: '20rem' }}>
          <FormWrapper {...props} form='sample'>
            <div className='bg-background-subtle p-4'>Content</div>
          </FormWrapper>
        </div>
      </div>
    );
  },
  name: 'Wrapper',
  parameters: {
    controls: { exclude: ['form', 'children', 'className', 'onLeftClick', 'onRightClick'] },
  },
};
