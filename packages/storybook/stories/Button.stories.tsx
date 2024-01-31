import type { Meta, StoryObj } from '@storybook/react';
import classNames from 'classnames';

import {
  Button,
  ButtonSize,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { ShareIcon } from '@dailydotdev/shared/src/components/icons';

const meta: Meta<typeof Button> = {
  component: Button,
  parameters: {
    controls: {
      expanded: true,
    },
  },
  argTypes: {
    href: {
      control: 'text',
    },
    onClick: {
      control: 'object',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Sizes: Story = {
  render: ({ children, ...props }) => (
    <div className="grid grid-cols-3 gap-4">
      <h2>Size</h2>
      <h2>Button</h2>
      <h2>IconOnly Button</h2>
      {Object.values(ButtonSize)
        .reverse()
        .map((size) => (
          <>
            <span key={size + '_header'}>{size}</span>
            <span key={size}>
              <Button {...props} buttonSize={size}>
                {children}
              </Button>
            </span>
            <span key={size + '_iconOnly'}>
              <Button {...props} buttonSize={size} icon={<ShareIcon />} />
            </span>
          </>
        ))}
    </div>
  ),
  name: 'Sizes',
  args: {
    children: 'Button',
    className: 'btn-primary',
  },
};

export const Variants: Story = {
  render: ({ className, children, ...props }) => (
    <div className="grid grid-cols-4 gap-4">
      <h2>Primary</h2>
      <h2>Secondary</h2>
      <h2>Tertiary</h2>
      <h2>Float</h2>
      <span>
        <Button {...props} className={classNames(className, 'btn-primary')}>
          {children}
        </Button>
      </span>
      <span>
        <Button {...props} className={classNames(className, 'btn-secondary')}>
          {children}
        </Button>
      </span>
      <span>
        <Button {...props} className={classNames(className, 'btn-tertiary')}>
          {children}
        </Button>
      </span>
      <span>
        <Button
          {...props}
          className={classNames(className, 'btn-tertiaryFloat')}
        >
          {children}
        </Button>
      </span>
    </div>
  ),
  name: 'Variants',
  args: {
    children: 'Button',
  },
};

export const Icon: Story = {
  render: ({ children, icon, rightIcon, ...props }) => (
    <div className="grid grid-cols-3 gap-4">
      <h2>Icon left</h2>
      <h2>Icon right</h2>
      <h2>Icon only</h2>
      <span>
        <Button {...props} icon={icon}>
          {children}
        </Button>
      </span>
      <span>
        <Button {...props} rightIcon={rightIcon}>
          {children}
        </Button>
      </span>
      <span>
        <Button {...props} icon={icon} iconOnly />
      </span>
    </div>
  ),
  name: 'Icon',
  args: {
    children: 'Share',
    icon: <ShareIcon />,
    rightIcon: <ShareIcon />,
    className: 'btn-primary',
  },
};
