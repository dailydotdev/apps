import React, { ReactElement } from 'react';
import EyeIcon from '../../../icons/eye.svg';
import EmptyScreen from '../EmptyScreen';

function ReadingHistoryEmptyScreen(): ReactElement {
  return (
    <EmptyScreen
      icon={EyeIcon}
      title="Your reading history is empty."
      description="Go back to your feed and read posts that spark your interest. Each
          post you read will be listed here."
    />
  );
}

export default ReadingHistoryEmptyScreen;
