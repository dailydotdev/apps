import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { InputFieldFunctionsProps } from '../../hooks/useInputFieldFunctions';
import classed from '../../lib/classed';
import styles from './fields.module.css';

export const FieldInput = classed(
  'input',
  'min-w-0 bg-transparent typo-body caret-text-link focus:outline-none',
);

export const BaseField = classed(
  'div',
  // Border width only — the resting border *color* is the Float hairline set on
  // `.field` (fields.module.css) so every field matches the Button v2 weight.
  'flex px-4 overflow-hidden bg-surface-float border cursor-text',
  styles.field,
);

export type FieldType = 'primary' | 'secondary' | 'tertiary' | 'quaternary';

type Attributes<T> = T extends HTMLInputElement
  ? InputHTMLAttributes<HTMLInputElement>
  : TextareaHTMLAttributes<HTMLTextAreaElement>;

export type TextInputProps<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> = InputFieldFunctionsProps & Omit<Attributes<T>, 'className'>;
