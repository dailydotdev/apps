import React, { forwardRef, ReactElement, Ref, useEffect } from 'react';
import classNames from 'classnames';
import { AdCardProps } from './AdCard';
import {
  ListCard,
  ListCardAside,
  ListCardDivider,
  ListCardMain,
  ListCardTitle,
} from './Card';
import AdLink from './AdLink';
import AdAttribution from './AdAttribution';

export const AdList = forwardRef(function AdList(
  { ad, onRender, onLinkClick, className, ...props }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  useEffect(() => {
    onRender?.(ad);
  }, []);

  return (
    <ListCard {...props} className={classNames(className)} ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <ListCardAside />
      <ListCardDivider />
      <ListCardMain>
        <ListCardTitle className="line-clamp-4">{ad.description}</ListCardTitle>
        <AdAttribution ad={ad} className="mt-2" />
      </ListCardMain>
    </ListCard>
  );
});
