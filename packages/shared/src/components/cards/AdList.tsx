import React, { forwardRef, ReactElement, Ref } from 'react';
import { AdCardProps } from './AdCard';
import { ListCard, ListCardMain, ListCardTitle } from './Card';
import AdLink from './AdLink';
import AdAttribution from './AdAttribution';

export const AdList = forwardRef(function AdList(
  { ad, onLinkClick, domProps }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <ListCardMain>
        <ListCardTitle className="line-clamp-4 font-bold typo-title3">
          {ad.description}
        </ListCardTitle>
        <AdAttribution ad={ad} className={{ main: 'mt-2' }} />
      </ListCardMain>
    </ListCard>
  );
});
