import { HTMLAttributes, ReactElement } from 'react';
import BaseButton, { BaseButtonProps, StyledButtonProps } from './BaseButton';
import colors, { ColorName } from '../../styles/colors';

export const tertiaryStyle = (color?: ColorName): StyledButtonProps => ({
  darkStates: {
    default: {
      color: 'var(--theme-label-tertiary)',
      background: 'none',
      borderColor: 'transparent',
    },
    hover: {
      color: color ? colors[color]['40'] : 'var(--theme-label-primary)',
      background: color ? `${colors[color]['10']}1F` : `${colors.salt['90']}1F`,
    },
    active: {
      color: color ? colors[color]['40'] : 'var(--theme-label-primary)',
      background: color ? `${colors[color]['10']}33` : `${colors.salt['90']}33`,
    },
    pressed: {
      color: color ? colors[color]['40'] : 'var(--theme-label-primary)',
    },
    disabled: {
      color: 'var(--theme-label-disabled)',
    },
  },
  lightStates: {
    hover: {
      color: color ? colors[color]['60'] : undefined,
      background: color
        ? `${colors[color]['90']}1F`
        : `${colors.pepper['10']}1F`,
    },
    active: {
      color: color ? colors[color]['60'] : undefined,
      background: color
        ? `${colors[color]['90']}33`
        : `${colors.pepper['10']}33`,
    },
    pressed: {
      color: color ? colors[color]['60'] : undefined,
    },
  },
});

export default function TertiaryButton<
  C extends HTMLElement = HTMLButtonElement,
  P = HTMLAttributes<C>
>(props: BaseButtonProps & P): ReactElement {
  const style = tertiaryStyle(props.color);
  return BaseButton({
    ...props,
    ...style,
  });
}
