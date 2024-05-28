import * as React from 'react';
import classNames from 'classnames';
import { hypeLink } from './HypeCampaign';
import { DevCardTheme, themeToLinearGradient } from '../profile/devcard';

export const HypeButton = ({
  className,
}: {
  className?: string;
}): JSX.Element => {
  return (
    <a
      href={hypeLink}
      className={classNames('rounded-12 p-1', className)}
      style={{
        backgroundImage: themeToLinearGradient[DevCardTheme.Diamond],
      }}
    >
      <div className="flex rounded-8 bg-background-default px-3 !leading-10 typo-title3">
        👕
      </div>
    </a>
  );
};
