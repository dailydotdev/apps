import React, { ComponentProps } from 'react';
import type { Meta } from '@storybook/react-vite';
import * as icons from '@dailydotdev/shared/src/components/icons';
import Icon, {
  IconSize,
} from '@dailydotdev/shared/src/components/Icon';
import { StoryObj } from '@storybook/react-vite';

const iconMap = {...icons};
type CustomProps = ComponentProps<typeof Icon> & { renderIcon: React.ReactElement };

const meta: Meta<CustomProps> = {
  title: 'Atoms/Icon',
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
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/C7n8EiXBwV1sYIEHkQHS8R/daily.dev---Design-System?type=design&node-id=0-1&mode=design&t=G2RMnPc48y6jEo5a-0",
    },
  }
}

export const AllIcons: Story = {
  render: () => {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Primary Icons</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          {Object.entries(icons).map(([name, IconComponent]) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid var(--color-pepper-90)',
                borderRadius: '8px',
                backgroundColor: 'var(--theme-background-subtle)',
              }}
            >
              <IconComponent size={IconSize.XLarge} />
              <span style={{
                marginTop: '12px',
                fontSize: '12px',
                textAlign: 'center',
                wordBreak: 'break-word',
                color: 'var(--theme-label-primary)'
              }}>
                {(IconComponent as any).displayName || name}
              </span>
            </div>
          ))}
        </div>

        <h2 style={{ marginBottom: '20px' }}>Secondary Icons</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '16px'
        }}>
          {Object.entries(icons).map(([name, IconComponent]) => (
            <div
              key={`${name}-secondary`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px',
                border: '1px solid var(--color-pepper-90)',
                borderRadius: '8px',
                backgroundColor: 'var(--theme-background-subtle)',
              }}
            >
              <IconComponent size={IconSize.XLarge} secondary />
              <span style={{
                marginTop: '12px',
                fontSize: '12px',
                textAlign: 'center',
                wordBreak: 'break-word',
                color: 'var(--theme-label-primary)'
              }}>
                {(IconComponent as any).displayName || name}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  }
} as const;
