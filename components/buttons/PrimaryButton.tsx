import { ReactElement } from 'react';
import BaseButton, { ButtonProps, StyledButtonProps } from './BaseButton';
import colors, { ColorName } from '../../styles/colors';
import { shadow2, shadow3 } from '../../styles/shadows';

export const primaryStyle = (color?: ColorName): StyledButtonProps => ({
  darkStates: {
    default: {
      color: 'var(--theme-label-invert)',
      background: color ? colors[color]['40'] : '#FFFFFF',
      borderColor: 'transparent',
    },
    hover: {
      background: color ? colors[color]['30'] : colors.salt['50'],
      shadow: color
        ? shadow3(`${colors[color]['50']}66`)
        : 'var(--theme-shadow3)',
    },
    active: {
      background: color ? colors[color]['10'] : colors.salt['90'],
      shadow: color
        ? shadow2(`${colors[color]['50']}A3`)
        : 'var(--theme-shadow2)',
    },
    pressed: {
      color: 'var(--theme-label-primary)',
      background: 'none',
      borderColor: 'var(--theme-label-primary)',
    },
    disabled: {
      background: color ? `${colors[color]['10']}33` : `${colors.salt['90']}33`,
    },
  },
  lightStates: {
    default: {
      background: color ? colors[color]['60'] : colors.pepper['90'],
    },
    hover: {
      background: color ? colors[color]['70'] : colors.pepper['50'],
    },
    active: {
      background: color ? colors[color]['90'] : colors.pepper['10'],
    },
    disabled: {
      background: color
        ? `${colors[color]['90']}33`
        : `${colors.pepper['10']}33`,
    },
  },
});

export default function PrimaryButton<Tag extends keyof JSX.IntrinsicElements>(
  props: ButtonProps<Tag>,
): ReactElement {
  const style = primaryStyle(props.themeColor);
  return BaseButton<Tag>({
    ...props,
    ...style,
  });
}
