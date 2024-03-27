import React, { ReactElement, useContext } from 'react';
import SettingsContext, { ThemeMode } from '../../contexts/SettingsContext';
import { useViewSize, ViewSize } from '../../hooks';
import { cloudinary } from '../../lib/image';
import { Image } from '../image/Image';
import { FlexCentered } from '../utilities';

function SquadEmptyScreen(): ReactElement {
  const settings = useContext(SettingsContext);
  const isMobile = useViewSize(ViewSize.MobileL);

  return (
    <FlexCentered className="mt-12 min-h-[calc(100vh-565px)] w-full flex-col p-6 text-center tablet:min-h-[calc(100vh-600px)] laptop:h-full laptop:min-h-[calc(100vh-540px)]">
      <Image
        className="mb-3 tablet:mb-8"
        width={isMobile ? 180 : 314}
        height={isMobile ? 91 : 152}
        src={
          settings.themeMode === ThemeMode.Light
            ? cloudinary.squads.emptySquadLight
            : cloudinary.squads.emptySquad
        }
      />
      <span className="max-w-lg text-text-primary typo-body tablet:typo-title1">
        Get started by sharing your first post and inviting other developers you
        know and appreciate.
      </span>
    </FlexCentered>
  );
}

export default SquadEmptyScreen;
