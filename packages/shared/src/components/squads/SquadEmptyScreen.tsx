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
    <FlexCentered className="flex-col tablet:self-center py-14 w-full laptop:h-full text-center laptop:min-h-[calc(100vh-442px)]">
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
      <span className="text-theme-label-primary tablet:typo-title1 typo-headline">
        Nothing has been posted yet
      </span>
    </FlexCentered>
  );
}

export default SquadEmptyScreen;
