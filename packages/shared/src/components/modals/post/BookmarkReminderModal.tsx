import type { FormEventHandler, ReactElement } from 'react';
import React, { useMemo, useState } from 'react';
import { addDays, format, set } from 'date-fns';
import classNames from 'classnames';
import type { LazyModalCommonProps } from '../common/Modal';
import { Modal } from '../common/Modal';
import { ModalHeader } from '../common/ModalHeader';
import { ModalBody } from '../common/ModalBody';
import { ModalSize } from '../common/types';
import { Button, ButtonVariant } from '../../buttons/Button';
import styles from '../../fields/dateTimeInput.module.css';
import {
  getRemindAt,
  MAX_CUSTOM_REMINDER_DAYS,
  ReminderPreference,
  useBookmarkReminder,
} from '../../../hooks/notifications';
import type { Post } from '../../../graphql/posts';
import type { ActiveFeedContextValue } from '../../../contexts/ActiveFeedContext';
import { ActiveFeedContext } from '../../../contexts/ActiveFeedContext';

export interface BookmarkReminderProps extends LazyModalCommonProps {
  onReminderSet?: (reminder: string) => void;
  feedContextData?: ActiveFeedContextValue;
  post: Post;
}

interface BookmarkReminderModalOptionProps {
  isActive: boolean;
  onClick: () => void;
  option: {
    key: ReminderPreference;
    value: ReminderPreference;
  };
}

const MODAL_OPTION_ORDER: ReminderPreference[] = [
  ReminderPreference.OneHour,
  ReminderPreference.Tomorrow,
  ReminderPreference.TwoDays,
  ReminderPreference.NextWeek,
  ReminderPreference.Custom,
];

const DATETIME_LOCAL_FORMAT = "yyyy-MM-dd'T'HH:mm";

const MODAL_OPTIONS: Array<BookmarkReminderModalOptionProps['option']> =
  MODAL_OPTION_ORDER.filter((option) => {
    const now = new Date();
    const isPastLaterToday = now.getHours() >= 19;
    const isInvalidLaterToday =
      ReminderPreference.LaterToday === option && isPastLaterToday;
    return !isInvalidLaterToday;
  }).map((value) => ({
    key: value,
    value,
  }));

const TIME_FOR_OPTION_FORMAT_MAP = {
  [ReminderPreference.OneHour]: 'eee, h:mm a',
  [ReminderPreference.LaterToday]: null,
  [ReminderPreference.Tomorrow]: 'eee, h:mm a',
  [ReminderPreference.TwoDays]: 'eee, h:mm a',
  [ReminderPreference.NextWeek]: 'eee, MMM d, h:mm a',
  [ReminderPreference.Custom]: null,
};

const BookmarkReminderModalOption = (
  props: BookmarkReminderModalOptionProps,
) => {
  const { option, onClick, isActive } = props;
  const { value } = option;

  const now = new Date();
  const timeFormat = TIME_FOR_OPTION_FORMAT_MAP[value];
  const timeForOption =
    timeFormat && format(getRemindAt(now, value), timeFormat);

  return (
    <Button
      aria-checked={isActive}
      aria-label={value}
      className="w-full"
      name="bookmarkReminder"
      onClick={onClick}
      role="radio"
      type="button"
      value={value}
      variant={isActive ? ButtonVariant.Float : ButtonVariant.Option}
    >
      <span className="flex-1 text-left">
        {value}
        {timeForOption && (
          <span className="text-text-quaternary"> ({timeForOption})</span>
        )}
      </span>
    </Button>
  );
};

export const BookmarkReminderModal = (
  props: BookmarkReminderProps,
): ReactElement => {
  const { post, onReminderSet, isOpen, onRequestClose } = props;
  const [selectedOption, setSelectedOption] = useState<ReminderPreference>(
    ReminderPreference.NextWeek,
  );

  const { minCustom, maxCustom, defaultCustom } = useMemo(() => {
    const now = new Date();
    return {
      minCustom: format(now, DATETIME_LOCAL_FORMAT),
      maxCustom: format(
        addDays(now, MAX_CUSTOM_REMINDER_DAYS),
        DATETIME_LOCAL_FORMAT,
      ),
      defaultCustom: format(
        set(addDays(now, 1), { hours: 9, minutes: 0 }),
        DATETIME_LOCAL_FORMAT,
      ),
    };
  }, []);
  const [customDate, setCustomDate] = useState<string>(defaultCustom);

  const isCustom = selectedOption === ReminderPreference.Custom;
  const customRemindAt = customDate ? new Date(customDate) : null;
  const isCustomValid =
    !isCustom ||
    (!!customRemindAt &&
      !Number.isNaN(customRemindAt.getTime()) &&
      customRemindAt > new Date(minCustom) &&
      customRemindAt <= new Date(maxCustom));

  const { onBookmarkReminder } = useBookmarkReminder({ post });

  const handleSubmit: FormEventHandler = async (e) => {
    e.preventDefault();

    if (!isCustomValid) {
      return;
    }

    onReminderSet?.(selectedOption);
    onBookmarkReminder({
      existingReminder: post.bookmark?.remindAt,
      postId: post.id,
      preference: selectedOption,
      remindAt: isCustom && customRemindAt ? customRemindAt : undefined,
    }).then(() => {
      onRequestClose();
    });
  };

  return (
    <Modal
      drawerProps={{
        title: 'Set a reminder',
        className: {
          title: '!block text-center border-transparent !typo-title2 pb-2',
        },
      }}
      isDrawerOnMobile={isOpen}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      size={ModalSize.Small}
    >
      <ModalHeader title="Set a reminder" />
      <ModalBody>
        <form onSubmit={handleSubmit}>
          <div
            role="radiogroup"
            aria-required
            aria-label="Reminder time options"
            tabIndex={0}
          >
            {MODAL_OPTIONS.map((option) => (
              <BookmarkReminderModalOption
                key={option.key}
                onClick={() => setSelectedOption(option.value)}
                isActive={selectedOption === option.value}
                option={option}
              />
            ))}
          </div>
          {isCustom && (
            <label
              className="mt-2 flex flex-col gap-1 px-3"
              htmlFor="customReminder"
            >
              <span className="text-text-tertiary typo-footnote">
                Pick a date and time (up to {MAX_CUSTOM_REMINDER_DAYS} days
                ahead)
              </span>
              <input
                aria-label="Custom reminder date and time"
                className={classNames(
                  styles.dateTimeInput,
                  'rounded-10 border border-border-subtlest-tertiary bg-transparent px-3 py-2 text-text-primary typo-callout',
                )}
                id="customReminder"
                max={maxCustom}
                min={minCustom}
                name="customReminder"
                onChange={(e) => setCustomDate(e.target.value)}
                type="datetime-local"
                value={customDate}
              />
            </label>
          )}
          <div className="mt-5 flex flex-row justify-center">
            <Button
              className="w-full responsiveModalBreakpoint:w-auto"
              disabled={!isCustomValid}
              variant={ButtonVariant.Primary}
            >
              Set reminder
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
};

const ModalComponent: typeof BookmarkReminderModal = ({
  feedContextData,
  ...props
}) =>
  feedContextData ? (
    <ActiveFeedContext.Provider value={feedContextData}>
      <BookmarkReminderModal {...props} />
    </ActiveFeedContext.Provider>
  ) : (
    <BookmarkReminderModal {...props} />
  );

export default ModalComponent;
