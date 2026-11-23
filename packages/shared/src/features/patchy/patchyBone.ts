import { useCallback, useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLogContext } from '../../contexts/LogContext';
import { LogEvent, TargetType } from '../../lib/log';
import { storageWrapper } from '../../lib/storageWrapper';
import { emitPatchyEvent } from './patchyEvents';

const freeBoneKey = (userId: string) => `patchy_free_bone:${userId}`;
const bonesGivenKey = (userId: string) => `patchy_bones_given:${userId}`;

export const getPatchyBoneDay = (date: Date): string =>
  `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

const readBonesGiven = (userId: string): number => {
  const count = Number(storageWrapper.getItem(bonesGivenKey(userId)));
  return Number.isFinite(count) && count > 0 ? count : 0;
};

interface UsePatchyBone {
  // The day's free bone is still there.
  hasFreeBone: boolean;
  bonesGiven: number;
  giveFreeBone: () => void;
}

// One free bone a local day. Per device for now, like his other settings:
// keeping count on the server needs an API change.
export const usePatchyBone = (): UsePatchyBone => {
  const { user } = useAuthContext();
  const { logEvent } = useLogContext();
  const userId = user?.id ?? '';
  const [, setVersion] = useState(0);
  const hasFreeBone =
    !!userId &&
    storageWrapper.getItem(freeBoneKey(userId)) !==
      getPatchyBoneDay(new Date());
  const bonesGiven = userId ? readBonesGiven(userId) : 0;

  const giveFreeBone = useCallback(() => {
    if (!userId) {
      return;
    }
    const today = getPatchyBoneDay(new Date());
    if (storageWrapper.getItem(freeBoneKey(userId)) === today) {
      return;
    }
    storageWrapper.setItem(freeBoneKey(userId), today);
    storageWrapper.setItem(
      bonesGivenKey(userId),
      String(readBonesGiven(userId) + 1),
    );
    setVersion((version) => version + 1);
    emitPatchyEvent({ type: 'bone' });
    logEvent({
      event_name: LogEvent.Click,
      target_type: TargetType.Patchy,
      target_id: 'free_bone',
    });
  }, [userId, logEvent]);

  return { hasFreeBone, bonesGiven, giveFreeBone };
};
