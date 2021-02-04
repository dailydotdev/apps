import React, {
  ChangeEvent,
  forwardRef,
  LegacyRef,
  ReactElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import styled from '@emotion/styled';
import classNames from 'classnames';
import VIcon from '../../icons/v.svg';
import { size05, size3, size5, sizeN } from '../../styles/sizes';
import { typoFootnote } from '../../styles/typography';
import colors, {
  overlayQuaternary,
  overlayTertiary,
} from '../../styles/colors';

const Input = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`;

const Checkmark = styled.div`
  position: relative;
  display: flex;
  width: ${size5};
  height: ${size5};
  align-items: center;
  justify-content: center;
  border-radius: ${sizeN(1.5)};
  border: ${size05} solid var(--theme-divider-primary);
  margin-right: ${size3};
  z-index: 1;

  .icon {
    width: 100%;
    height: 100%;
    color: var(--theme-label-primary);
    opacity: 0;
    transition: opacity 0.1s linear;
  }

  &:before {
    content: '';
    position: absolute;
    left: -9999px;
    top: -9999px;
    right: -9999px;
    bottom: -9999px;
    width: ${sizeN(8)};
    height: ${sizeN(8)};
    margin: auto;
    border-radius: ${sizeN(2.5)};
    opacity: 0;
    transition: background-color 0.1s linear, opacity 0.1s linear;
    pointer-events: none;
    z-index: -1;
  }
`;

const Label = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  color: var(--theme-label-tertiary);
  transition: color 0.1s linear;
  z-index: 1;
  cursor: pointer;
  user-select: none;
  font-weight: bold;
  ${typoFootnote};

  &:hover,
  &:focus-within,
  &.checked {
    color: var(--theme-label-primary);

    ${Checkmark} {
      .icon {
        opacity: 1;
      }
    }
  }

  &:hover,
  &:focus-within {
    ${Checkmark} {
      border-color: var(--theme-label-primary);

      &:before {
        background: var(--theme-hover);
        opacity: 1;
      }
    }
  }

  &:active {
    ${Checkmark}:before {
      background: var(--theme-active);
    }
  }

  &.checked {
    ${Checkmark} {
      background: ${colors.water['40']};
      border-color: transparent;

      .light & {
        background: ${colors.water['60']};
      }
    }

    &:hover,
    &:focus-within {
      ${Checkmark} {
        background: ${colors.water['20']};

        &:before {
          background: ${overlayQuaternary('water')};
        }

        .light & {
          background: ${colors.water['80']};
        }
      }
    }

    &:active {
      ${Checkmark}:before {
        background: ${overlayTertiary('water')};
      }
    }
  }
`;

export interface CheckboxProps {
  name: string;
  checked?: boolean;
  children?: ReactNode;
  className?: string;
  onToggle?: (checked: boolean) => unknown;
}

export default forwardRef(function Checkbox(
  { name, checked, children, className, onToggle }: CheckboxProps,
  ref: LegacyRef<HTMLInputElement>,
): ReactElement {
  const [actualChecked, setActualChecked] = useState(checked);

  useEffect(() => {
    setActualChecked(checked);
  }, [checked]);

  const onChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setActualChecked(event.target.checked);
    onToggle?.(event.target.checked);
  };

  return (
    <Label className={classNames(className, { checked: actualChecked })}>
      <Input
        type="checkbox"
        name={name}
        checked={checked}
        className={className}
        onChange={onChange}
        ref={ref}
      />
      <Checkmark>
        <VIcon />
      </Checkmark>
      {children}
    </Label>
  );
});
