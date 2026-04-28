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
  Button,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
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

const LIVE_TITLE = 'Live rooms | daily.dev';
const LIVE_DESCRIPTION =
  'Join live debates with developers happening right now on daily.dev.';

const seo: NextSeoProps = {
  title: LIVE_TITLE,
  description: LIVE_DESCRIPTION,
  openGraph: {
    ...defaultOpenGraph,
    title: LIVE_TITLE,
    description: LIVE_DESCRIPTION,
    type: 'website',
  },
  ...defaultSeo,
};

const LivePage = (): ReactElement => {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { user, showLogin } = useAuthContext();
  const { data: rooms, isLoading } = useActiveLiveRooms();

  const handleJoin = (room: LiveRoom): void => {
    router.push(`/live/${room.id}`);
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
            Live rooms
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Hop into a debate or start one of your own.
          </Typography>
        </div>
        <Button
          variant={ButtonVariant.Primary}
          icon={<PlusIcon />}
          onClick={handleCreateClick}
        >
          New room
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader />
        </div>
      ) : null}

      {!isLoading && (!rooms || rooms.length === 0) ? (
        <div className="flex flex-col items-center gap-3 rounded-16 border border-border-subtlest-tertiary bg-surface-float px-4 py-10 text-center">
          <Typography type={TypographyType.Title3} bold>
            No live rooms right now
          </Typography>
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Be the first to start a debate.
          </Typography>
          <Button
            className="mt-2"
            variant={ButtonVariant.Primary}
            onClick={handleCreateClick}
          >
            Start a room
          </Button>
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
            router.push(`/live/${joinToken.room.id}`);
          }}
        />
      ) : null}
    </main>
  );
};

const getLivePageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

LivePage.getLayout = getLivePageLayout;
LivePage.layoutProps = {
  screenCentered: false,
  seo,
};

export default LivePage;
