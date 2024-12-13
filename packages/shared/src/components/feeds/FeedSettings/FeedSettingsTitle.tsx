import React, { ReactElement, useContext } from 'react';
import classNames from 'classnames';
import { IconSize } from '../../Icon';
import { HashtagIcon } from '../../icons';
import { Typography, TypographyType } from '../../typography/Typography';
import { FeedSettingsEditContext } from './FeedSettingsEditContext';

export type FeedSettingsTitleProps = {
  className?: string;
};

export const FeedSettingsTitle = ({
  className,
}: FeedSettingsTitleProps): ReactElement => {
  const { feed } = useContext(FeedSettingsEditContext);

  return (
    <Typography
      className={classNames(
        'flex items-center justify-center gap-2',
        className,
      )}
      type={TypographyType.Body}
      bold
    >
      <div>
        {feed.flags.icon ? (
          <Typography type={TypographyType.Title2}>
            {feed.flags.icon}
          </Typography>
        ) : (
          <HashtagIcon size={IconSize.Medium} />
        )}
      </div>
      {/* TODO AS-814 - check if main feed for "My feed" */}
      {feed.flags.name || 'My feed'}
    </Typography>
  );
};
