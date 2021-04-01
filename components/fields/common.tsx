import classed from '../../lib/classed';
import styles from '../../styles/fields.module.css';

export const FieldInput = classed(
  'input',
  'min-w-0 text-theme-label-primary bg-transparent typo-callout caret-theme-label-link focus:outline-none',
);

export const BaseField = classed(
  'div',
  'flex px-3 items-center overflow-hidden bg-theme-float border border-transparent cursor-text',
  styles.field,
);
