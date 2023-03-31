import React, { ReactElement, useContext } from 'react';
import SettingsContext, { ThemeMode } from '../../contexts/SettingsContext';
import useMedia from '../../hooks/useMedia';
import { cloudinary } from '../../lib/image';
import { tablet } from '../../styles/media';
import { Image } from '../image/Image';
import { FlexCentered } from '../utilities';

function SquadEmptyScreen(): ReactElement {
  const settings = useContext(SettingsContext);
  const isMobile = !useMedia([tablet.replace('@media ', '')], [true], false);

  return (
    <FlexCentered className="flex-col p-6 mt-12 w-full laptop:h-full text-center laptop:min-h-[calc(100vh-540px)] tablet:min-h-[calc(100vh-600px)] min-h-[calc(100vh-565px)]">
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
      <span className="max-w-lg text-theme-label-primary tablet:typo-title1 typo-headline">
        Get started by sharing your first post and inviting other developers you
        know and appreciate.
      </span>
    </FlexCentered>
  );
}

export default SquadEmptyScreen;
