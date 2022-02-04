import React, { ReactElement } from 'react';
import { DevCardFooterProps, DevCardTextProps } from './common';
import { ModalSection, ModalSubTitle, ModalText } from '../common';
import DevCardPlaceholder from '../../DevCardPlaceholder';
import GoToDevCardButton from '../../GoToDevCardButton';

const devCardText = ({ user, isLocked }: DevCardTextProps): string => {
  if (!user) {
    return 'DevCard is your developer ID. It showcases your achievements to the world. Sign up and read 50 articles to generate yours.';
  }
  return isLocked
    ? 'DevCard is your developer ID. It showcases your achievements to the world. Read 50 articles to generate yours.'
    : 'DevCard is your developer ID. It showcases your achievements to the world.';
};

export default function DevCardFooter({
  rank,
  user,
  reads,
  devCardLimit,
  isLocked,
}: DevCardFooterProps): ReactElement {
  return (
    <ModalSection className="pt-2 mb-4">
      <ModalSubTitle>Generate your DevCard</ModalSubTitle>
      <div className="flex mt-2">
        <DevCardPlaceholder
          profileImage={user?.image}
          height={80}
          rank={rank}
          isLocked={isLocked}
        />
        <div className="flex flex-col flex-1 items-start ml-6">
          <ModalText>{devCardText({ user, isLocked })}</ModalText>
          {user && isLocked ? (
            <div className="relative mt-2 flex w-full items-center">
              <strong className="typo-footnote">
                {reads}/{devCardLimit}
              </strong>
              <div className="ml-2 flex flex-1 relative h-2 rounded-full bg-theme-active">
                <div
                  className="absolute bottom-0 left-0 h-full rounded-full bg-theme-label-primary"
                  style={{ width: (100 * reads) / devCardLimit }}
                  data-testId="tagProgress"
                />
              </div>
            </div>
          ) : (
            <GoToDevCardButton
              origin="ranks instructions"
              className="mt-3"
              isLocked={isLocked}
            >
              Generate
            </GoToDevCardButton>
          )}
        </div>
      </div>
    </ModalSection>
  );
}
