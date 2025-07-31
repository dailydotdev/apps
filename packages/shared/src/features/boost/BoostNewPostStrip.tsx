import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { IconSize } from '../../components/Icon';
import { ClearIcon, TrendingIcon } from '../../components/icons';
import {
  Typography,
  TypographyTag,
  TypographyType,
} from '../../components/typography/Typography';
import { boostNewPostBanner } from '../../lib/image';

import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { TooltipArrow } from '../../svg/TooltipArrow';
import { Image } from '../../components/image/Image';

interface BoostNewPostStripProps {
  className?: string;
}

export function BoostNewPostStrip({
  className,
}: BoostNewPostStripProps): ReactElement {
  const { completeAction } = useActions();

  return (
    <div
      className={classNames(
        'relative flex h-10 w-full flex-row rounded-8 border border-accent-blueCheese-default p-2',
        className,
      )}
    >
      <Image
        src={boostNewPostBanner}
        className="absolute inset-0 z-0 hidden h-full w-full tablet:flex"
      />
      <div className="z-1 flex w-full flex-row items-center gap-1 tablet:justify-end">
        <TooltipArrow className="absolute -top-2 right-18" />
        <TrendingIcon size={IconSize.Medium} />
        <Typography tag={TypographyTag.Span} type={TypographyType.Callout}>
          <span>Boost to reach</span>
          <strong className="mx-1">10k more devs</strong>
          <span>now!</span>
        </Typography>
        <Button
          className="ml-auto tablet:ml-1"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ClearIcon secondary />}
          onClick={() => completeAction(ActionType.ClosedNewPostBoostBanner)}
        />
      </div>
    </div>
  );
}
