import React, { forwardRef, ReactElement, Ref, useContext } from 'react';
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
import FeaturesContext from '../../contexts/FeaturesContext';

export const AdList = forwardRef(function AdList(
  { ad, onLinkClick, postHeadingFont, ...props }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const { postEngagementNonClickable } = useContext(FeaturesContext);

  return (
    <ListCard {...props} ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      {!postEngagementNonClickable && (
        <>
          <ListCardAside />
          <ListCardDivider />
        </>
      )}
      <ListCardMain>
        <ListCardTitle className={classNames('line-clamp-4', postHeadingFont)}>
          {ad.description}
        </ListCardTitle>
        <AdAttribution ad={ad} className="mt-2" />
      </ListCardMain>
    </ListCard>
  );
});
