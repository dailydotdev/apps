import type { ReactElement } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { useQuery } from '@tanstack/react-query';
import Link from '../utilities/Link';
import { ProfilePicture, ProfileImageSize } from '../ProfilePicture';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { ArrowIcon, MicrophoneIcon } from '../icons';
import { IconSize } from '../Icon';
import type { ActiveLiveRoom } from '../../graphql/liveRooms';
import { LiveRoomStatus } from '../../graphql/liveRooms';
import { BOOT_QUERY_KEY } from '../../contexts/common';
import type { Boot } from '../../lib/boot';
import { useActiveLiveRooms } from '../../hooks/liveRooms/useActiveLiveRooms';
import { useLogContext } from '../../contexts/LogContext';
import useLogEventOnce from '../../hooks/log/useLogEventOnce';
import { LogEvent } from '../../lib/log';
import styles from './LiveStandupsStrip.module.css';

const STRIP_SURFACE = 'home_strip';

const HOLD_MS = 5000;
const SLIDE_MS = 1200;
const ACTIVE_ROOMS_LIMIT = 5;

const StandupItem = ({
  item,
  ariaHidden = false,
  onItemClick,
}: {
  item: ActiveLiveRoom;
  ariaHidden?: boolean;
  onItemClick?: (item: ActiveLiveRoom) => void;
}): ReactElement => (
  <Link href={`/standups/${item.id}`}>
    <a
      href={`/standups/${item.id}`}
      aria-hidden={ariaHidden}
      tabIndex={ariaHidden ? -1 : undefined}
      onClick={() => onItemClick?.(item)}
      onAuxClick={() => onItemClick?.(item)}
      className="flex w-full min-w-0 items-center gap-2 rounded-8 px-2 py-0.5 transition-colors hover:bg-surface-hover"
    >
      <ProfilePicture
        user={item.host}
        size={ProfileImageSize.Small}
        rounded="full"
        nativeLazyLoading
        className="shrink-0"
      />
      <Typography
        type={TypographyType.Footnote}
        bold
        className="min-w-0 truncate whitespace-nowrap"
      >
        {item.topic}
      </Typography>
      <Typography
        type={TypographyType.Caption2}
        color={TypographyColor.Tertiary}
        className="hidden shrink-0 whitespace-nowrap tabular-nums tablet:inline"
      >
        with {item.host.name}
        {item.participantCount ? ` · ${item.participantCount} watching` : ''}
      </Typography>
    </a>
  </Link>
);

interface LiveStandupsStripProps {
  items?: ActiveLiveRoom[];
  className?: string;
}

export const LiveStandupsStrip = ({
  items,
  className,
}: LiveStandupsStripProps): ReactElement | null => {
  const { data: boot } = useQuery<Partial<Boot>>({
    queryKey: BOOT_QUERY_KEY,
    queryFn: () => Promise.resolve({} as Partial<Boot>),
    enabled: false,
  });
  const hasLiveRoomsHint = boot?.liveRooms?.hasLive === true;
  const shouldFetchLiveRooms = !items && hasLiveRoomsHint;
  const { data: activeRooms, isLoading: isFetchingActive } = useActiveLiveRooms(
    {
      enabled: shouldFetchLiveRooms,
      limit: ACTIVE_ROOMS_LIMIT,
    },
  );
  const liveItems = useMemo(
    () =>
      (items ?? activeRooms ?? []).filter(
        (item) => item.status === LiveRoomStatus.Live,
      ),
    [activeRooms, items],
  );

  const totalLive = liveItems.length;
  const liveItemsFingerprint = useMemo(
    () => liveItems.map((item) => item.id).join('|'),
    [liveItems],
  );
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [withTransition, setWithTransition] = useState(true);
  const rafIdsRef = useRef<number[]>([]);
  const { logEvent } = useLogContext();

  useLogEventOnce(
    () => ({
      event_name: LogEvent.ImpressionStandupsStrip,
      extra: JSON.stringify({
        surface: STRIP_SURFACE,
        total: totalLive,
        room_ids: liveItems.map((item) => item.id),
      }),
    }),
    { condition: totalLive > 0 },
  );

  const onItemClick = (room: ActiveLiveRoom) => {
    logEvent({
      event_name: LogEvent.ClickStandupsStrip,
      target_id: room.id,
      extra: JSON.stringify({
        surface: STRIP_SURFACE,
        position: liveItems.findIndex((item) => item.id === room.id),
        total: totalLive,
      }),
    });
  };

  const scheduleRaf = (cb: () => void): void => {
    const id = window.requestAnimationFrame(() => {
      rafIdsRef.current = rafIdsRef.current.filter((rid) => rid !== id);
      cb();
    });
    rafIdsRef.current.push(id);
  };

  useEffect(
    () => () => {
      rafIdsRef.current.forEach((id) => window.cancelAnimationFrame(id));
      rafIdsRef.current = [];
    },
    [],
  );

  useEffect(() => {
    setIndex(0);
    setWithTransition(true);
  }, [liveItemsFingerprint]);

  useEffect(() => {
    if (totalLive <= 1 || isPaused) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setIndex((current) => (current >= totalLive ? current : current + 1));
    }, HOLD_MS + SLIDE_MS);
    return () => window.clearInterval(interval);
  }, [totalLive, isPaused]);

  useEffect(() => {
    if (totalLive === 0 || index !== totalLive) {
      return undefined;
    }
    const t = window.setTimeout(() => {
      setWithTransition(false);
      setIndex(0);
      scheduleRaf(() => {
        scheduleRaf(() => setWithTransition(true));
      });
    }, SLIDE_MS + 50);
    return () => window.clearTimeout(t);
  }, [index, totalLive]);

  if (!items && !hasLiveRoomsHint) {
    return null;
  }

  if (!liveItems.length && !isFetchingActive) {
    return null;
  }

  const isLoading = !liveItems.length && isFetchingActive;
  const hasPagination = totalLive > 1;
  const trackItems = hasPagination ? [...liveItems, liveItems[0]] : liveItems;
  const displayIndex = totalLive === 0 ? 0 : (index % totalLive) + 1;

  const goNext = () => {
    if (index >= totalLive) {
      return;
    }
    setIndex((current) => current + 1);
  };
  const goPrev = () => {
    if (index >= totalLive) {
      return;
    }
    if (index === 0 && totalLive > 1) {
      setWithTransition(false);
      setIndex(totalLive);
      scheduleRaf(() => {
        scheduleRaf(() => {
          setWithTransition(true);
          setIndex(totalLive - 1);
        });
      });
      return;
    }
    setIndex((current) => current - 1);
  };

  return (
    <section
      aria-label="Live standups"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={classNames(
        styles.strip,
        'relative w-full overflow-hidden rounded-b-12 tablet:h-10 tablet:w-fit tablet:max-w-full tablet:rounded-12',
        className,
      )}
    >
      <div className="relative flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 p-1 tablet:h-full tablet:flex-nowrap">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-6 bg-accent-ketchup-default px-2 py-0.5 font-bold uppercase tracking-wide text-white typo-caption2">
          <span className="size-1.5 animate-pulse rounded-full bg-white" />
          Live
        </span>

        <Typography
          type={TypographyType.Caption2}
          bold
          className="inline-flex shrink-0 items-center gap-1.5 uppercase tracking-[0.18em] text-accent-bacon-default"
        >
          <MicrophoneIcon size={IconSize.XSmall} secondary />
          Standup
        </Typography>

        <div aria-hidden className="basis-full tablet:hidden" />

        <div
          className={classNames(
            styles.carouselViewport,
            'w-[11rem] flex-none tablet:w-[17.5rem] laptop:w-[21rem]',
          )}
        >
          {isLoading && (
            <div aria-hidden className={styles.loadingBar}>
              <span />
            </div>
          )}
          <div
            className={styles.marqueeTrack}
            style={{
              transform: `translate3d(-${index * 100}%, 0, 0)`,
              transition: withTransition
                ? `transform ${SLIDE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : 'none',
            }}
          >
            {trackItems.map((item, i) => {
              const isDuplicate = i >= totalLive;
              return (
                <div
                  key={isDuplicate ? `dup-${item.id}` : item.id}
                  className={styles.slide}
                >
                  <StandupItem
                    item={item}
                    ariaHidden={isDuplicate}
                    onItemClick={isDuplicate ? undefined : onItemClick}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {hasPagination ? (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous live standup"
              className="flex size-6 items-center justify-center rounded-6 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <ArrowIcon className="-rotate-90" size={IconSize.XSmall} />
            </button>
            <Typography
              type={TypographyType.Caption2}
              color={TypographyColor.Tertiary}
              className="px-0.5 tabular-nums"
            >
              {displayIndex}/{totalLive}
            </Typography>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next live standup"
              className="flex size-6 items-center justify-center rounded-6 text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <ArrowIcon className="rotate-90" size={IconSize.XSmall} />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
};
