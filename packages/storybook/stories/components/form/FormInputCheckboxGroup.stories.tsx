import type { Meta, StoryObj } from '@storybook/react';
import {
  FormInputRating,
} from '@dailydotdev/shared/src/features/common/components/FormInputRating';
import { useState } from 'react';
import { fn } from '@storybook/test';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  FormInputCheckboxGroup,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';
import {
  CheckboxGroupVariant,
} from '@dailydotdev/shared/src/features/common/components/FormInputCheckboxGroup';

const meta: Meta<typeof FormInputCheckboxGroup> = {
  title: 'Components/Form/FormInputCheckboxGroup',
  component: FormInputCheckboxGroup,
  args: {
    onValueChange: fn(),
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/nmfWPS7x3kzLUvYMkBx2kW/daily.dev---Dev-Mode?node-id=27351-6350&t=UTlDOWAz9YE7p040-0',
    },
  },
  render: (props) => {
    return (
      <div className='max-w-lg'>
        <FormInputCheckboxGroup {...props} />
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<typeof FormInputCheckboxGroup>;

export const Default: Story = {
  args: {
    options: [
      {
        label: 'JavaScript', value: 'js',
      },
      {
        label: 'Python',
        value: 'py',
      },
      {
        label: 'Go', value: 'go',
      },
    ],
  },
};
export const WithImages: Story = {
  args: {
    options: [
      {
        label: 'JavaScript', value: 'js',
        image: {
          src: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgss-technology.com%2Fwp-content%2Fuploads%2F2021%2F07%2F04.png&f=1&nofb=1&ipt=1ebbe741885867ff8c9ca748d0d711db7990fb3083ce1fdb2fddfc8e9864acf7&ipo=images',
        },
      },
      {
        label: 'Python',
        value: 'py',
        image: {
          src: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgss-technology.com%2Fwp-content%2Fuploads%2F2021%2F07%2F04.png&f=1&nofb=1&ipt=1ebbe741885867ff8c9ca748d0d711db7990fb3083ce1fdb2fddfc8e9864acf7&ipo=images',
        },
      },
      {
        label: 'Go', value: 'go',
        image: {
          src: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgss-technology.com%2Fwp-content%2Fuploads%2F2021%2F07%2F04.png&f=1&nofb=1&ipt=1ebbe741885867ff8c9ca748d0d711db7990fb3083ce1fdb2fddfc8e9864acf7&ipo=images',
        },
      },
    ],
  },
};

export const Vertical: Story = {
  args: {
    options: [
      { label: 'JavaScript', value: 'js' },
      {
        label: 'Python',
        value: 'py',
      },
      { label: 'Go', value: 'go' },
    ],
    variant: CheckboxGroupVariant.Vertical,
  },
};
