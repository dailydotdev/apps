import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import { FilterIcon } from './icons';
import { PageContainer } from './utilities';
import { ButtonSize } from './buttons/common';

function FollowingFeedEmptyScreen(): ReactElement {
  return (
    <PageContainer className="mx-auto">
      <EmptyScreenContainer>
        <FilterIcon
          className={EmptyScreenIcon.className}
          style={EmptyScreenIcon.style}
        />
        <EmptyScreenTitle>Start following.</EmptyScreenTitle>
        <EmptyScreenDescription>
          You need to follow more people
        </EmptyScreenDescription>
        <EmptyScreenButton size={ButtonSize.Large}>
          Find sources
        </EmptyScreenButton>
      </EmptyScreenContainer>
    </PageContainer>
  );
}

export default FollowingFeedEmptyScreen;
