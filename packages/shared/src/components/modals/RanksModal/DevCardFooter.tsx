import React, { ReactElement } from 'react';
import { DevCardFooterProps, DevCardTextProps } from './common';
import { ModalSection, ModalSubTitle, ModalText } from '../common';
import DevCardPlaceholder from '../../DevCardPlaceholder';
import GoToDevCardButton from '../../GoToDevCardButton';

const devCardText = ({ user }: DevCardTextProps): string => {
  if (!user) {
    return `DevCard is your developer ID. It showcases your achievements to the world. Sign up to generate yours.`;
  }
  return 'DevCard is your developer ID. It showcases your achievements to the world.';
};

export default function DevCardFooter({
  rank,
  user,
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
          <ModalText>{devCardText({ user })}</ModalText>
          <GoToDevCardButton className="mt-3" isLocked={isLocked}>
            Generate
          </GoToDevCardButton>
        </div>
      </div>
    </ModalSection>
  );
}
