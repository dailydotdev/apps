import classNames from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';
import { ButtonColor, ButtonVariant, Button } from '../buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../typography/Typography';
import { PlusEntryArrow } from '../icons';
import { IconSize } from '../Icon';

type PlusBannerProps = {
  className?: string;
  leadIn?: string;
  copy: string;
  cta: string;
  arrow?: boolean;
};

const PlusMobileEntryBanner = ({
  leadIn,
  copy,
  cta,
  className,
  arrow,
}: PlusBannerProps): ReactElement => {
  return (
    <div className={classNames('absolute z-modal flex w-full p-4', className)}>
      <div className="bg-gradient-funnel-top absolute inset-0 -z-1 h-full w-full rotate-180 rounded-16" />
      {arrow && <PlusEntryArrow className="-mt-1" size={IconSize.Size16} />}
      <div className="flex w-full flex-col gap-2">
        <div className="relative">
          {leadIn && (
            <Typography
              tag={TypographyTag.Span}
              type={TypographyType.Callout}
              color={TypographyColor.Plus}
            >
              {leadIn}{' '}
            </Typography>
          )}
          <Typography tag={TypographyTag.Span} type={TypographyType.Callout}>
            {copy}
          </Typography>
        </div>
        <div className="flex justify-center">
          <Button color={ButtonColor.Avocado} variant={ButtonVariant.Primary}>
            {cta}
          </Button>
          <Button className="flex-grow" variant={ButtonVariant.Float}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlusMobileEntryBanner;
