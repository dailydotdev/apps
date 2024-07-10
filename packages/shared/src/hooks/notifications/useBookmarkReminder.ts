import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { addDays, addHours } from 'date-fns';
import {
  setBookmarkReminder,
  SetBookmarkReminderProps,
} from '../../graphql/bookmarks';
import { useToastNotification } from '../useToastNotification';

export enum BookmarkReminderPreference {
  OneHour = 'In 1 hour',
  LaterToday = 'Later today',
  Tomorrow = 'Tomorrow',
  TwoDays = 'In 2 days',
  NextWeek = 'Next week',
}

interface MutateBookmarkProps extends SetBookmarkReminderProps {
  existingReminder?: Date;
  preference: BookmarkReminderPreference;
}

interface BookmarkReminderProps {
  postId: string;
  preference: BookmarkReminderPreference;
  existingReminder?: Date;
}

interface UseBookmarkReminder {
  onBookmarkReminder: (props: BookmarkReminderProps) => void;
}

export function getNextMonday(date: Date): Date {
  const nextMonday = new Date(date);
  const day = date.getDay();
  const daysUntilNextMonday = (8 - day) % 7 || 7; // 8 % 7 = 1 (if today is Monday, get the next Monday)
  nextMonday.setDate(date.getDate() + daysUntilNextMonday);
  return nextMonday;
}

const getRemindAt = (date: Date, preference: BookmarkReminderPreference) => {
  const isPastLaterToday = date.getHours() >= 19;
  if (
    !Object.values(BookmarkReminderPreference).includes(preference) ||
    (BookmarkReminderPreference.LaterToday === preference && isPastLaterToday)
  ) {
    throw new Error('Invalid preference');
  }

  switch (preference) {
    case BookmarkReminderPreference.OneHour:
      return addHours(date, 1);
    case BookmarkReminderPreference.LaterToday:
      return new Date(date.setHours(19));
    case BookmarkReminderPreference.Tomorrow:
      return addDays(date.setHours(9), 1);
    case BookmarkReminderPreference.TwoDays:
      return addDays(date.setHours(9), 2);
    case BookmarkReminderPreference.NextWeek:
      return new Date(getNextMonday(date).setHours(9));
    default:
      return addHours(date, 1);
  }
};

export const useBookmarkReminder = (): UseBookmarkReminder => {
  const { displayToast } = useToastNotification();
  const { mutateAsync: onUndoReminder } = useMutation(setBookmarkReminder);
  const { mutateAsync: onSetBookmarkReminder } = useMutation(
    ({ postId, remindAt }: MutateBookmarkProps) =>
      setBookmarkReminder({ postId, remindAt }),
    {
      onSuccess: (_, { postId, existingReminder, preference }) => {
        displayToast(`Reminder set for ${preference.toLowerCase()}`, {
          onUndo: () => onUndoReminder({ postId, remindAt: existingReminder }),
        });
      },
    },
  );

  const onBookmarkReminder = useCallback(
    (props: BookmarkReminderProps) => {
      const { preference } = props;
      const now = new Date();
      const isPastLaterToday = now.getHours() >= 19;

      if (
        !Object.values(BookmarkReminderPreference).includes(preference) ||
        (BookmarkReminderPreference.LaterToday === preference &&
          isPastLaterToday)
      ) {
        throw new Error('Invalid preference');
      }

      return onSetBookmarkReminder({
        ...props,
        remindAt: getRemindAt(now, preference),
      });
    },
    [onSetBookmarkReminder],
  );

  return { onBookmarkReminder };
};
