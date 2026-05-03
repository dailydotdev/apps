import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import type { NextSeoProps } from 'next-seo';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import {
  ButtonV2,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/ButtonV2';
import { PlusIcon } from '@dailydotdev/shared/src/components/icons';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { LiveRoomCard } from '@dailydotdev/shared/src/components/liveRooms/LiveRoomCard';
import { CreateLiveRoomModal } from '@dailydotdev/shared/src/components/liveRooms/CreateLiveRoomModal';
import { useAuthContext } from '@dailydotdev/shared/src/contexts/AuthContext';
import { useActiveLiveRooms } from '@dailydotdev/shared/src/hooks/liveRooms/useActiveLiveRooms';
import type { LiveRoom } from '@dailydotdev/shared/src/graphql/liveRooms';
import { AuthTriggers } from '@dailydotdev/shared/src/lib/auth';
import classNames from 'classnames';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';
import { defaultOpenGraph, defaultSeo } from '../../next-seo';

const STANDUPS_TITLE = 'Standups | daily.dev';
const STANDUPS_DESCRIPTION =
  'Join developer standups happening right now on daily.dev.';

const seo: NextSeoProps = {
  title: STANDUPS_TITLE,
  description: STANDUPS_DESCRIPTION,
  openGraph: {
    ...defaultOpenGraph,
    title: STANDUPS_TITLE,
    description: STANDUPS_DESCRIPTION,
    type: 'website',
  },
  ...defaultSeo,
};

const StandupsPage = (): ReactElement => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user, showLogin } = useAuthContext();
  const { data: rooms, isLoading } = useActiveLiveRooms();

  const handleJoin = (room: LiveRoom): void => {
    router.push(`/standups/${room.id}`);
  };

  const handleCreateClick = (): void => {
    if (!user) {
      showLogin({ trigger: AuthTriggers.MainButton });
      return;
    }

    setIsCreateOpen(true);
  };

  return (
    <main
      className={classNames(
        pageContainerClassNames,
        pageBorders,
        'min-h-page py-6',
      )}
    >
      <header className="mb-6 flex items-center justify-between gap-4 px-4 tablet:px-0">
        <div className="flex flex-col gap-1">
          <Typography type={TypographyType.LargeTitle} bold>
            Standups
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Hop into a moderated standup or open the stage to everyone.
          </Typography>
        </div>
        <ButtonV2
          variant={ButtonVariant.Primary}
          icon={<PlusIcon />}
          onClick={handleCreateClick}
        >
          New standup
        </ButtonV2>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : null}

      {!isLoading && (!rooms || rooms.length === 0) ? (
        <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-10 text-center">
          <Typography type={TypographyType.Title3} bold>
            No standups right now
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Be the first to start a standup.
          </Typography>
          <ButtonV2
            className="mt-2"
            variant={ButtonVariant.Primary}
            onClick={handleCreateClick}
          >
            Start a standup
          </ButtonV2>
        </div>
      ) : null}

      {rooms && rooms.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 laptop:grid-cols-3">
          {rooms.map((room) => (
            <LiveRoomCard key={room.id} room={room} onJoin={handleJoin} />
          ))}
        </div>
      ) : null}

      {isCreateOpen ? (
        <CreateLiveRoomModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onCreated={(joinToken) => {
            router.push(`/standups/${joinToken.room.id}`);
          }}
        />
      ) : null}
    </main>
  );
};

const getStandupsPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

StandupsPage.getLayout = getStandupsPageLayout;
StandupsPage.layoutProps = {
  screenCentered: false,
  seo,
};

export default StandupsPage;
