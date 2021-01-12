import { HTMLAttributes, ReactElement } from 'react';
import BaseButton, { BaseButtonProps, StyledButtonProps } from './BaseButton';
import colors, { ColorName } from '../../styles/colors';
import { shadow2, shadow3 } from '../../styles/shadows';

export const secondaryStyle = (color?: ColorName): StyledButtonProps => ({
  darkStates: {
    default: {
      color: 'var(--theme-label-primary)',
      background: 'none',
      borderColor: 'var(--theme-label-primary)',
    },
    hover: {
      color: color ? colors[color]['40'] : undefined,
      background: color ? `${colors[color]['10']}1F` : `${colors.salt['90']}1F`,
      borderColor: color ? colors[color]['40'] : undefined,
      shadow: color
        ? shadow3(`${colors[color]['50']}66`)
        : 'var(--theme-shadow3)',
    },
    active: {
      color: color ? colors[color]['40'] : undefined,
      background: color ? `${colors[color]['10']}33` : `${colors.salt['90']}33`,
      borderColor: color ? colors[color]['40'] : undefined,
      shadow: color
        ? shadow2(`${colors[color]['50']}A3`)
        : 'var(--theme-shadow2)',
    },
    pressed: {
      color: 'var(--theme-label-invert)',
      background: color ? colors[color]['40'] : '#FFFFFF',
      borderColor: 'transparent',
    },
    disabled: {
      borderColor: `${colors.salt['90']}33`,
    },
  },
  lightStates: {
    hover: {
      color: color ? colors[color]['60'] : undefined,
      background: color
        ? `${colors[color]['60']}1F`
        : `${colors.pepper['10']}1F`,
      borderColor: color ? colors[color]['60'] : undefined,
      shadow: color ? shadow3(`${colors[color]['60']}66`) : undefined,
    },
    active: {
      color: color ? colors[color]['60'] : undefined,
      background: color
        ? `${colors[color]['60']}33`
        : `${colors.pepper['10']}33`,
      borderColor: color ? colors[color]['60'] : undefined,
      shadow: color ? shadow2(`${colors[color]['60']}A3`) : undefined,
    },
    pressed: {
      background: color ? colors[color]['60'] : colors.pepper['90'],
    },
    disabled: {
      borderColor: `${colors.pepper['10']}33`,
    },
  },
});

export default function SecondaryButton<
  C extends HTMLElement = HTMLButtonElement,
  P = HTMLAttributes<C>
>(props: BaseButtonProps & P): ReactElement {
  const style = secondaryStyle(props.color);
  return BaseButton({
    ...props,
    ...style,
  });
}
