import React, { ReactElement } from 'react';
import {
  EmptyScreenButton,
  EmptyScreenContainer,
  EmptyScreenDescription,
  EmptyScreenIcon,
  EmptyScreenTitle,
} from './EmptyScreen';
import { PageContainer } from './utilities';
import { ButtonSize, ButtonVariant } from './buttons/common';
import { SquadIcon } from './icons';
import { webappUrl } from '../lib/constants';
import Link from './utilities/Link';

function FollowingFeedEmptyScreen(): ReactElement {
  return (
    <PageContainer className="mx-auto">
      <EmptyScreenContainer>
        <SquadIcon
          className={EmptyScreenIcon.className}
          style={EmptyScreenIcon.style}
        />
        <EmptyScreenTitle>Nothing to See Here—Yet!</EmptyScreenTitle>
        <EmptyScreenDescription>
          Your feed is empty because you haven’t followed any Squads or Sources
          or there is not enough content. Explore more Squads and Sources
        </EmptyScreenDescription>
        <div className="flex flex-col gap-4 tablet:flex-row">
          <Link href={`${webappUrl}squads`}>
            <EmptyScreenButton size={ButtonSize.Large}>
              Find Squads
            </EmptyScreenButton>
          </Link>
          <Link href={`${webappUrl}sources`}>
            <EmptyScreenButton
              size={ButtonSize.Large}
              variant={ButtonVariant.Secondary}
            >
              Discover Sources
            </EmptyScreenButton>
          </Link>
        </div>
      </EmptyScreenContainer>
    </PageContainer>
  );
}

export default FollowingFeedEmptyScreen;
