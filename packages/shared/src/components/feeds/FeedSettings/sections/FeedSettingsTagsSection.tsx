import React, { ReactElement, useContext } from 'react';
import { FeedSettingsEditContext } from '../FeedSettingsEditContext';
import { TagSelection } from '../../../tags/TagSelection';
import { Origin } from '../../../../lib/log';

export const FeedSettingsTagsSection = (): ReactElement => {
  const { feed, onTagClick } = useContext(FeedSettingsEditContext);

  return (
    <>
      <div className="flex w-full max-w-full flex-col">
        <TagSelection
          className="mt-10 px-4 pt-0 tablet:px-10"
          shouldUpdateAlerts={false}
          shouldFilterLocally
          feedId={feed?.id}
          onClickTag={onTagClick}
          // TODO AS-814 - check if main feed for origins
          origin={Origin.CustomFeed}
          searchOrigin={Origin.CustomFeed}
        />
      </div>
    </>
  );
};
