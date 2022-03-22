import React, { ReactElement } from 'react';
import { DevCardFooterProps, DevCardTextProps } from './common';
import { ModalSection, ModalSubTitle, ModalText } from '../common';
import DevCardPlaceholder from '../../DevCardPlaceholder';
import GoToDevCardButton from '../../GoToDevCardButton';

const devCardText = ({
  user,
  isLocked,
  devCardLimit,
}: DevCardTextProps): string => {
  if (!user) {
    return `DevCard is your developer ID. It showcases your achievements to the world. Sign up and read ${devCardLimit} articles to generate yours.`;
  }
  return isLocked
    ? `DevCard is your developer ID. It showcases your achievements to the world. Read ${devCardLimit} articles to generate yours.`
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
          <ModalText>{devCardText({ user, isLocked, devCardLimit })}</ModalText>
          {user && isLocked ? (
            <div className="flex relative items-center mt-2 w-full">
              <strong className="typo-footnote">
                {reads}/{devCardLimit}
              </strong>
              <div className="flex relative flex-1 ml-2 h-2 bg-theme-active rounded-full">
                <div
                  className="absolute bottom-0 left-0 h-full rounded-full bg-theme-label-primary"
                  style={{ width: (100 * reads) / devCardLimit }}
                  data-testId="tagProgress"
                />
              </div>
            </div>
          ) : (
            <GoToDevCardButton className="mt-3" isLocked={isLocked}>
              Generate
            </GoToDevCardButton>
          )}
        </div>
      </div>
    </ModalSection>
  );
}
