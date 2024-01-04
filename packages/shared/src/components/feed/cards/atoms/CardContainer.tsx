import styles from '../../../cards/Card.module.css';
import classed from '../../../../lib/classed';

export const CardContainer = classed(
  'div',
  'relative min-h-card h-full group/card max-w-80',
  styles.cardContainer,
);
