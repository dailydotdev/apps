import classNames from 'classnames';
import styles from '../../../cards/Card.module.css';
import classed from '../../../../lib/classed';

const clickableCardClasses = classNames(
  styles.link,
  'absolute inset-0 w-full h-full focus-outline',
);

export const CardButton = classed('button', clickableCardClasses);
