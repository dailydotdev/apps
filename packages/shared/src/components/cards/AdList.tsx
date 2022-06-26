import React, { forwardRef, ReactElement, Ref } from 'react';
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
  { ad, onLinkClick, postCardVersion, ...props }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <ListCard {...props} ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      {postCardVersion === 'v1' && (
        <>
          <ListCardAside />
          <ListCardDivider />
        </>
      )}
      <ListCardMain>
        <ListCardTitle
          className={classNames('line-clamp-4 font-bold typo-title3')}
        >
          {ad.description}
        </ListCardTitle>
        <AdAttribution ad={ad} className="mt-2" />
      </ListCardMain>
    </ListCard>
  );
});
