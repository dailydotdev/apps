import React, { forwardRef, ReactElement, Ref } from 'react';
import {
  Card,
  CardImage,
  CardSpace,
  CardTextContainer,
  CardTitle,
} from '../common/Card';
import AdLink from './common/AdLink';
import AdAttribution from './common/AdAttribution';
import { AdImage } from './common/AdImage';
import { AdPixel } from './common/AdPixel';
import type { AdCardProps } from './common/common';
import Link from '../../utilities/Link';
import {
  Button,
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '../../buttons/Button';
import { plusUrl } from '../../../lib/constants';

export const AdGrid = forwardRef(function AdGrid(
  { ad, onLinkClick, domProps }: AdCardProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  return (
    <Card {...domProps} data-testid="adItem" ref={ref}>
      <AdLink ad={ad} onLinkClick={onLinkClick} />
      <CardTextContainer>
        <CardTitle className="my-4 line-clamp-4 font-bold typo-title3">
          {ad.description}
        </CardTitle>
      </CardTextContainer>
      <CardSpace />
      <AdImage ad={ad} ImageComponent={CardImage} />
      <CardTextContainer>
        <div className="flex items-center pt-2">
          <AdAttribution ad={ad} />
          <Link passHref href={plusUrl}>
            <Button
              tag="a"
              variant={ButtonVariant.Float}
              size={ButtonSize.Small}
              color={ButtonColor.Bacon}
              className="ml-auto"
            >
              Remove
            </Button>
          </Link>
        </div>
      </CardTextContainer>
      <AdPixel pixel={ad.pixel} />
    </Card>
  );
});
