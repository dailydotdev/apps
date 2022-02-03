import classed from '../../lib/classed';
import styles from './fields.module.css';

export const FieldInput = classed(
  'input',
  'min-w-0 text-theme-label-tertiary bg-transparent typo-body caret-theme-label-link focus:outline-none',
);

export const BaseField = classed(
  'div',
  'flex px-4 items-center overflow-hidden bg-theme-float border border-transparent cursor-text',
  styles.field,
);
