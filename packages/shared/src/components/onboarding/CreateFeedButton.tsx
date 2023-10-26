import React, { HTMLAttributes, ReactElement } from 'react';
import classNames from 'classnames';
import useFeedSettings from '../../hooks/useFeedSettings';
import { Button, ButtonElementType } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips';
import useMedia from '../../hooks/useMedia';
import { tablet } from '../../styles/media';
import { isTesting } from '../../lib/constants';

export type CreateFeedButtonProps = {
  className?: string;
  requiredTagsThreshold: number;
} & Pick<HTMLAttributes<ButtonElementType<'button'>>, 'onClick'>;

export const CreateFeedButton = ({
  className,
  requiredTagsThreshold,
  onClick,
}: CreateFeedButtonProps): ReactElement => {
  const { feedSettings } = useFeedSettings();
  const tagsCount = feedSettings?.includeTags?.length || 0;
  const canCreateFeed = tagsCount >= requiredTagsThreshold;
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);

  return (
    <SimpleTooltip
      content={
        canCreateFeed ? '' : `Choose at least ${requiredTagsThreshold} tags`
      }
      forceLoad={!isTesting}
    >
      <div>
        <Button
          className={classNames('btn btn-primary', className)}
          disabled={!canCreateFeed}
          onClick={onClick}
        >
          Create {isMobile ? '' : 'personalized'} feed ➔
        </Button>
      </div>
    </SimpleTooltip>
  );
};
