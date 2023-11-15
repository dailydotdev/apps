import classed from '../../../../lib/classed';
import styles from '../../../cards/Card.module.css';

export const Card = classed(
  'article',
  styles.card,
  'relative h-full flex flex-col p-2 rounded-2xl bg-theme-bg-secondary border border-theme-divider-tertiary hover:border-theme-divider-secondary shadow-2',
);
