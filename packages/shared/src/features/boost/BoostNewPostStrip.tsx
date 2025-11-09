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
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/buttons/Button';
import { useActions } from '../../hooks';
import { ActionType } from '../../graphql/actions';
import { TooltipArrow } from '../../svg/TooltipArrow';
import { Image } from '../../components/image/Image';
import type { WithClassNameProps } from '../../components/utilities';
import { useThemedAsset } from '../../hooks/utils';

export function BoostNewPostStrip({
  className,
}: WithClassNameProps): ReactElement {
  const { completeAction } = useActions();
  const { postBoostStrip } = useThemedAsset();

  return (
    <div
      className={classNames(
        'rounded-8 border-accent-blueCheese-default relative flex h-10 w-full flex-row border p-2',
        className,
      )}
    >
      <Image
        src={postBoostStrip}
        className="tablet:flex absolute inset-0 z-0 hidden h-full w-full"
      />
      <div className="z-1 tablet:justify-end flex w-full flex-row items-center gap-1">
        <TooltipArrow className="right-18 fill-accent-blueCheese-default absolute -top-2" />
        <TrendingIcon size={IconSize.Medium} />
        <Typography tag={TypographyTag.Span} type={TypographyType.Callout}>
          <span>Boost to reach</span>
          <strong className="mx-1">10k more devs</strong>
          <span>now!</span>
        </Typography>
        <Button
          className="tablet:ml-1 ml-auto"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ClearIcon secondary />}
          onClick={() => completeAction(ActionType.ClosedNewPostBoostBanner)}
        />
      </div>
    </div>
  );
}
