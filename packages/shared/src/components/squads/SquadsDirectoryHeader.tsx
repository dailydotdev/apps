import React, { ReactElement } from 'react';
import classNames from 'classnames';
import { cloudinary } from '../../lib/image';
import { Button, ButtonVariant } from '../buttons/Button';
import SourceBetaIcon from '../../../icons/source_beta.svg';
import { Origin } from '../../lib/log';
import { useSquadNavigation } from '../../hooks';

interface SquadsDirectoryHeaderProps {
  className?: string;
}

export const SquadsDirectoryHeader = ({
  className,
}: SquadsDirectoryHeaderProps): ReactElement => {
  const { openNewSquad } = useSquadNavigation();

  return (
    <div
      className={classNames(
        'relative mb-16 flex flex-col items-center rounded-24 bg-background-default bg-cover bg-center p-6 pb-1 text-center',
        className,
      )}
      style={{
        backgroundImage: `url(${cloudinary.squads.directory.banner})`,
      }}
    >
      <div className="relative z-1 flex flex-col items-center">
        <SourceBetaIcon
          height="3rem"
          className="mb-4 w-full translate-x-[1.125rem] text-white"
        />
        <h1 className="mb-3 flex items-center justify-center font-bold text-white typo-large-title">
          Public Squads
        </h1>
        <div className="mb-4 max-w-[40rem] font-normal text-raw-salt-50 typo-title3">
          Unleashing the magic of developer communities with Squads. An
          opportunity to dive deep and go niche together with like-minded devs.
        </div>
        <Button
          className="mb-6"
          variant={ButtonVariant.Primary}
          tag="a"
          onClick={() => openNewSquad({ origin: Origin.SquadDirectory })}
          data-testid="squad-directory-join-waitlist"
        >
          New Squad
        </Button>
        <div className="text-center text-text-quaternary typo-footnote">
          Squads are just getting started.
          <br className="inline-block tablet:hidden" /> More awesomeness coming
          soon.
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-0 h-full bg-gradient-to-t from-background-default to-transparent" />
    </div>
  );
};
