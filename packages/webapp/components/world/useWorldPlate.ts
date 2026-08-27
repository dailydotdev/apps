import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlClient } from '@dailydotdev/shared/src/graphql/common';
import type { MutableRefObject } from 'react';
import type {
  UploadUserWorldPlateData,
  WorldDistrict,
  WorldSettings,
} from '../../graphql/world';
import { UPLOAD_USER_WORLD_PLATE_MUTATION } from '../../graphql/world';
import { userWorldQueryKey } from './useUserWorld';
import type { WorldEngine } from './worldState';

/**
 * A plate is only worth capturing off a window that can hold a landscape card.
 * A phone in portrait produces something that cannot be cropped to 1.91:1
 * without gutting it, so those readers leave the stored plate alone and the
 * card falls back to the profile image.
 */
const MIN_PLATE_WIDTH = 1024;
const MIN_PLATE_ASPECT = 1.4;

/**
 * What the plate is a picture OF. Deliberately not a TTL: a world grows by a
 * few articles most days and re-rendering millions of them nightly would buy
 * nothing a reader could see. It covers only what changes the PICTURE, so the
 * name is absent (the card draws it as live text) and so is `private` (which
 * decides whether a card is served at all, not what it looks like).
 */
export const worldPlateVersion = (
  districts: WorldDistrict[] | undefined,
  settings: WorldSettings | null | undefined,
): string => {
  const shape = {
    // Level drives the monuments, so district sizes matter, but only coarsely:
    // one more article never changes a skyline.
    d: (districts ?? [])
      .map(
        (district) =>
          `${district.niche.slug}:${Math.floor(district.reads / 25)}`,
      )
      .sort()
      .join(','),
    sky: settings?.sky ? `${settings.sky.pal}/${settings.sky.hour}` : '',
    crest: settings?.crest
      ? `${settings.crest.charge}/${settings.crest.div}/${settings.crest.a}/${settings.crest.b}`
      : '',
    look: settings?.look
      ? [
          settings.look.id,
          settings.look.mine,
          settings.look.ol,
          settings.look.bl,
          settings.look.duo,
          settings.look.warm,
          settings.look.sat,
          settings.look.grain,
          settings.look.vig,
        ].join('/')
      : '',
  };

  const serialised = JSON.stringify(shape);
  // Bounded string hash, kept under a prime so it stays exact without bitwise
  // ops. A collision only costs a plate that is one revision stale.
  let hash = 0;
  for (let i = 0; i < serialised.length; i += 1) {
    hash = (hash * 31 + serialised.charCodeAt(i)) % 2147483647;
  }
  return `1.${hash.toString(36)}`;
};

interface UseWorldPlateProps {
  userId: string;
  isOwn: boolean;
  isPrivate: boolean;
  isReady: boolean;
  engineRef: MutableRefObject<WorldEngine | null>;
  districts: WorldDistrict[] | undefined;
  settings: WorldSettings | null | undefined;
}

/**
 * Keeps the share card's plate current, from the one machine that has already
 * drawn the world on real hardware. Rendering this server-side means a headless
 * browser with software GL: seconds of CPU and most of a gigabyte for a frame
 * the owner's GPU produced for free.
 *
 * Owners only, and their own row only, which is what stops a visitor putting an
 * arbitrary image on someone else's card.
 */
export const useWorldPlate = ({
  userId,
  isOwn,
  isPrivate,
  isReady,
  engineRef,
  districts,
  settings,
}: UseWorldPlateProps): void => {
  const client = useQueryClient();
  // One attempt per mount. A failed upload should not retry on every re-render,
  // and a succeeded one must not fire again when the cache write re-renders us.
  const attemptedRef = useRef<string | null>(null);

  const { mutate } = useMutation({
    mutationFn: async ({ blob, version }: { blob: Blob; version: string }) => {
      const res = await gqlClient.request<UploadUserWorldPlateData>(
        UPLOAD_USER_WORLD_PLATE_MUTATION,
        { image: blob, version },
      );
      return res.uploadUserWorldPlate;
    },
    onSuccess: (updated) =>
      client.setQueryData<{
        districts: WorldDistrict[];
        settings: WorldSettings | null;
      }>(userWorldQueryKey(userId), (previous) =>
        previous ? { ...previous, settings: updated ?? null } : previous,
      ),
  });

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !isOwn || isPrivate || !isReady || !districts?.length) {
      return;
    }

    // An unbuilt world has nothing to photograph.
    if (
      globalThis.innerWidth < MIN_PLATE_WIDTH ||
      globalThis.innerWidth / globalThis.innerHeight < MIN_PLATE_ASPECT
    ) {
      return;
    }

    const version = worldPlateVersion(districts, settings);
    if (
      attemptedRef.current === version ||
      settings?.plateVersion === version
    ) {
      return;
    }
    attemptedRef.current = version;

    const dataUrl = engine.capture();
    if (!dataUrl) {
      return;
    }

    // The synchronous part is over: the pixels are out of the drawing buffer
    // and into a string, so everything from here can be async.
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => mutate({ blob, version }))
      .catch(() => {
        // A missing plate is a card that falls back to the profile image, not a
        // broken world. Nothing on screen should change because this failed.
      });
  }, [engineRef, isOwn, isPrivate, isReady, districts, settings, mutate]);
};
