import React, { Children } from 'react';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import { LottieAnimation } from '../../LottieAnimation';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../typography/Typography';
import { ProgressBar } from '../../fields/ProgressBar';
import { briefCardBg, briefCardBorder } from '../../../styles/custom';

export type BriefCardProps = {
  className?: string;
  animationSrc: string;
  progressPercentage?: number;
  headnote: ReactNode;
  title: ReactNode;
  children?: ReactNode;
};

const rootStyle = {
  border: briefCardBorder,
  background: briefCardBg,
};

export const BriefCard = ({
  className,
  animationSrc,
  progressPercentage,
  headnote,
  title,
  children,
}: BriefCardProps): ReactElement => {
  return (
    <div
      style={rootStyle}
      className={classNames(
        'flex flex-col items-center gap-4 rounded-16 p-4 text-center',
        'backdrop-blur-3xl',
        className,
      )}
    >
      <LottieAnimation className="-mb-6 h-20 w-20" src={animationSrc} />
      <div className="w-20">
        <ProgressBar
          shouldShowBg
          percentage={progressPercentage}
          className={{
            wrapper: 'rounded-12 bg-border-subtlest-tertiary',
            bar: 'h-1',
            barColor: 'bg-accent-blueCheese-default',
          }}
        />
      </div>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {headnote}
      </Typography>
      <Typography
        type={TypographyType.Title3}
        color={TypographyColor.Primary}
        bold
      >
        {title}
      </Typography>
      <div className="flex flex-col gap-2">
        {Children.map(children, (child, index) => {
          return (
            <Typography
              className={classNames(index !== 0 && 'opacity-32')}
              type={TypographyType.Body}
              color={TypographyColor.Primary}
            >
              {child}
            </Typography>
          );
        })}
      </div>
    </div>
  );
};
