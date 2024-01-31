import React, { ComponentProps } from 'react';
import type { Meta } from '@storybook/react';
import * as icons from '@dailydotdev/shared/src/components/icons';
import Icon, {
  IconSize,
} from '@dailydotdev/shared/src/components/Icon';
import { StoryObj } from '@storybook/react';

const iconMap = {...icons};
type CustomProps = ComponentProps<typeof Icon> & { renderIcon: React.ReactElement };

const meta: Meta<CustomProps> = {
  title: 'Icon',
  component: Icon,
  args: {
    renderIcon: 'AiIcon',
    size: IconSize.XXXLarge
  },
  argTypes: {
    renderIcon: { control: "select", options: Object.entries(icons).map(([icon]) => icon), description: 'Not a actual prop of this component, only used to help render example icons' },
    IconPrimary: {  table: {
        disable: true
      } },
    IconSecondary: {  table: {
        disable: true
      } },
  },
};

export default meta;

type Story = StoryObj<CustomProps>;

export const Individual: Story = {
  render: (props) => {
    // @ts-ignore
    const IconComponent = iconMap[props.renderIcon];
    return <IconComponent
      {...props}
    />

  },
}
