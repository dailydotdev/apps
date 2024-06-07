import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { InputFieldFunctionsProps } from '../../hooks/useInputFieldFunctions';
import classed from '../../lib/classed';
import styles from './fields.module.css';

export const FieldInput = classed(
  'input',
  'min-w-0  bg-transparent typo-body caret-text-link focus:outline-none',
);

export const BaseField = classed(
  'div',
  'flex px-4 overflow-hidden bg-surface-float border border-transparent cursor-text',
  styles.field,
);

export type FieldType = 'primary' | 'secondary' | 'tertiary';

type Attributes<T> = T extends HTMLInputElement
  ? InputHTMLAttributes<HTMLInputElement>
  : TextareaHTMLAttributes<HTMLTextAreaElement>;

export type TextInputProps<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> = InputFieldFunctionsProps & Omit<Attributes<T>, 'className'>;
