import React, { ReactElement } from 'react';
import { cloudinary } from '../../lib/image';
import { Button } from '../buttons/Button';
import SourceBetaIcon from '../../../icons/source_beta.svg';
import { Origin } from '../../lib/analytics';
import { useSquadNavigation } from '../../hooks';

export const SquadsDirectoryHeader = (): ReactElement => {
  const { openNewSquad } = useSquadNavigation();

  return (
    <div className="mb-4">
      <div
        className="flex relative flex-col items-center p-6 pb-1 mb-16 text-center bg-center bg-cover rounded-24 bg-theme-bg-primary"
        style={{
          backgroundImage: `url(${cloudinary.squads.directory.banner})`,
        }}
      >
        <div className="flex relative z-1 flex-col items-center">
          <SourceBetaIcon
            width="auto"
            height="3rem"
            className="mb-4 text-white translate-x-[1.125rem]"
          />
          <div className="flex justify-center items-center mb-3 font-bold text-white typo-large-title">
            Public Squads
          </div>
          <div className="mb-4 font-normal text-salt-50 typo-title3 max-w-[40rem]">
            Unleashing the magic of developer communities with Squads. An
            opportunity to dive deep and go niche together with like-minded
            devs.
          </div>
          <Button
            className="mb-6 btn-primary"
            tag="a"
            onClick={() => openNewSquad({ origin: Origin.SquadDirectory })}
            data-testid="squad-directory-join-waitlist"
          >
            New Squad
          </Button>
          <div className=" text-center typo-footnote text-theme-label-quaternary">
            Squads are just getting started.
            <br className="inline-block tablet:hidden" /> More awesomeness
            coming soon.
          </div>
        </div>
        <div className="absolute right-0 bottom-0 left-0 z-0 h-full bg-gradient-to-t to-transparent from-theme-bg-primary" />
      </div>
    </div>
  );
};
