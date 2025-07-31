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
        'relative flex h-10 w-full flex-row items-center justify-end gap-1 rounded-8 border border-accent-blueCheese-default bg-cover p-2',
        className,
      )}
      style={{ backgroundImage: `url('${boostNewPostBanner}')` }}
    >
      <TooltipArrow className="absolute -top-2 right-18" />
      <TrendingIcon size={IconSize.Medium} />
      <Typography tag={TypographyTag.Span} type={TypographyType.Callout}>
        <span>Boost to reach</span>
        <strong className="mx-1">10k</strong>
        <span>now!</span>
      </Typography>
      <Button
        className="ml-1"
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<ClearIcon secondary />}
        onClick={() => completeAction(ActionType.ClosedNewPostBoostBanner)}
      />
    </div>
  );
}
