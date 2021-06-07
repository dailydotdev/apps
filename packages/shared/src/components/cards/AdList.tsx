import React, { forwardRef, ReactElement, Ref, useEffect } from 'react';
import { AdCardProps } from './AdCard';
import {
  ListCard,
  ListCardAside,
  ListCardDivider,
  ListCardMain,
  ListCardTitle,
} from './Card';
import classNames from 'classnames';
import styles from './Card.module.css';
import AdLink from './AdLink';
import AdAttribution from './AdAttribution';

export const AdList = forwardRef(function AdList(
  { ad, onImpression, onLinkClick, className, ...props }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  useEffect(() => {
    onImpression?.(ad);
  }, []);

  return (
    <ListCard {...props} className={classNames(className, styles.ad)} ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <ListCardAside />
      <ListCardDivider />
      <ListCardMain>
        <ListCardTitle>{ad.description}</ListCardTitle>
        <AdAttribution ad={ad} className="mt-2" />
      </ListCardMain>
    </ListCard>
  );
});
