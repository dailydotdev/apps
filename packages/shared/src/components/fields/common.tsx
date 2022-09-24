import { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import classed from '../../lib/classed';
import { ButtonProps } from '../buttons/Button';
import { IconProps } from '../Icon';
import styles from './fields.module.css';

export const FieldInput = classed(
  'input',
  'min-w-0 text-theme-label-tertiary bg-transparent typo-body caret-theme-label-link focus:outline-none',
);

export const BaseField = classed(
  'div',
  'flex px-4 overflow-hidden bg-theme-float border border-transparent cursor-text',
  styles.field,
);

export type FieldType = 'primary' | 'secondary' | 'tertiary';

type Attributes<T> = T extends HTMLInputElement
  ? InputHTMLAttributes<HTMLInputElement>
  : TextareaHTMLAttributes<HTMLTextAreaElement>;

export type TextFieldProps<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> = Attributes<T> & {
  inputId: string;
  label: string;
  baseFieldClassName?: string;
  hintClassName?: string;
  saveHintSpace?: boolean;
  absoluteLabel?: boolean;
  isLocked?: boolean;
  progress?: string;
  hint?: string;
  valid?: boolean;
  validityChanged?: (valid: boolean) => void;
  valueChanged?: (value: string) => void;
  fieldType?: FieldType;
  leftIcon?: ReactNode;
  actionButton?: React.ReactElement<ButtonProps<'button'>>;
  rightIcon?: React.ReactElement<IconProps>;
};
