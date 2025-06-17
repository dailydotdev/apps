import React from 'react';
import classNames from 'classnames';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import {
  briefButtonBg,
  briefCardBg,
  briefCardBorder,
} from '../../../../styles/custom';
import type { BriefCardProps } from './BriefCard';
import { BriefGradientIcon } from '../../../icons';
import { IconSize } from '../../../Icon';
import { Button, ButtonSize, ButtonVariant } from '../../../buttons/Button';

export type BriefCardDefaultProps = BriefCardProps;

const rootStyle = {
  border: briefCardBorder,
  background: briefCardBg,
};

export const BriefCardDefault = ({
  className,
  title,
  children,
}: BriefCardDefaultProps): ReactElement => {
  return (
    <div
      style={rootStyle}
      className={classNames(
        'flex flex-col gap-4 rounded-16 px-6 py-4',
        'backdrop-blur-3xl',
        className,
      )}
    >
      <BriefGradientIcon secondary size={IconSize.Size48} />
      <Typography
        type={TypographyType.Title2}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      {children}
      <Button
        style={{
          background: briefButtonBg,
        }}
        className="mt-auto w-full text-black"
        tag="a"
        type="button"
        variant={ButtonVariant.Primary}
        size={ButtonSize.Small}
        onClick={() => {
          // TODO feat-brief start briefing generation
        }}
      >
        Generate
      </Button>
    </div>
  );
};
