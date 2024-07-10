import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { addDays, addHours, nextMonday, setHours } from 'date-fns';
import {
  setBookmarkReminder,
  SetBookmarkReminderProps,
} from '../../graphql/bookmarks';
import { useToastNotification } from '../useToastNotification';

export enum ReminderPreference {
  OneHour = 'In 1 hour',
  LaterToday = 'Later today',
  Tomorrow = 'Tomorrow',
  TwoDays = 'In 2 days',
  NextWeek = 'Next week',
}

interface MutateBookmarkProps extends SetBookmarkReminderProps {
  existingReminder?: Date;
  preference: ReminderPreference;
}

interface BookmarkReminderProps {
  postId: string;
  preference: ReminderPreference;
  existingReminder?: Date;
}

interface UseBookmarkReminder {
  onBookmarkReminder: (props: BookmarkReminderProps) => void;
}

const getRemindAt = (date: Date, preference: ReminderPreference) => {
  switch (preference) {
    case ReminderPreference.OneHour:
      return addHours(date, 1);
    case ReminderPreference.LaterToday:
      return setHours(date, 19);
    case ReminderPreference.Tomorrow:
      return addDays(date.setHours(9), 1);
    case ReminderPreference.TwoDays:
      return addDays(date.setHours(9), 2);
    case ReminderPreference.NextWeek:
      return nextMonday(date.setHours(9));
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
      const isValidPreference =
        Object.values(ReminderPreference).includes(preference);
      const isPastLaterToday = now.getHours() >= 19;
      const isInvalidLaterToday =
        ReminderPreference.LaterToday === preference && isPastLaterToday;

      if (!isValidPreference || isInvalidLaterToday) {
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
