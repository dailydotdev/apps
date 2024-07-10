import React, { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { format } from 'date-fns';
import { Modal, ModalProps } from '../modals/common/Modal';
import { ModalHeader } from '../modals/common/ModalHeader';
import { ModalBody } from '../modals/common/ModalBody';
import { ModalSize } from '../modals/common/types';
import { Button, ButtonVariant } from '../buttons/Button';
import {
  getRemindAt,
  ReminderPreference,
} from '../../hooks/notifications/useBookmarkReminder';

export type ReminderModalProps = {
  onReminderSet: (reminder: string) => void;
} & Pick<ModalProps, 'isOpen' | 'onRequestClose'>;

type ReminderModalItemProps = {
  onClick: () => void;
  isActive: boolean;
  option: {
    label: ReminderPreference;
    value: string;
  };
};

const MODAL_OPTIONS: Array<ReminderModalItemProps['option']> = Object.entries(
  ReminderPreference,
).map(([value, label]) => ({
  value,
  label,
}));

const TIME_FOR_OPTION_FORMAT_MAP = {
  [ReminderPreference.OneHour]: null,
  [ReminderPreference.LaterToday]: 'h:mm a',
  [ReminderPreference.Tomorrow]: 'eee, h:mm a',
  [ReminderPreference.TwoDays]: 'eee, h:mm a',
  [ReminderPreference.NextWeek]: 'eee, MMM d, h:mm a',
};

const ReminderModalOption = (props: ReminderModalItemProps) => {
  const { option, onClick, isActive } = props;
  const { label, value } = option;

  const now = new Date();
  const timeFormat = TIME_FOR_OPTION_FORMAT_MAP[label];
  const timeForOption =
    timeFormat && format(getRemindAt(now, label), timeFormat);

  return (
    <Button
      aria-checked={isActive}
      aria-label={label}
      className="w-full"
      name="bookmarkReminder"
      onClick={onClick}
      role="radio"
      type="button"
      value={value}
      variant={isActive ? ButtonVariant.Float : ButtonVariant.Option}
    >
      <span
        className={classNames('flex-1 text-left', { 'text-white': isActive })}
      >
        {label}
        {timeForOption && (
          <span className="text-text-quaternary"> ({timeForOption})</span>
        )}
      </span>
    </Button>
  );
};

export const ReminderModal = (props: ReminderModalProps): ReactElement => {
  const { isOpen, onRequestClose, onReminderSet } = props;
  const defaultOption = 'OneHour';
  const [selectedOption, setSelectedOption] = useState<string>(defaultOption);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    onReminderSet(selectedOption);
  };

  return (
    <>
      <Modal
        size={ModalSize.Small}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
      >
        <ModalHeader title="Set reminder" />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <div
              role="radiogroup"
              aria-required
              aria-label="Reminder time options"
              tabIndex={0}
            >
              {MODAL_OPTIONS.map((option) => (
                <ReminderModalOption
                  key={option.value}
                  onClick={() => setSelectedOption(option.value)}
                  isActive={selectedOption === option.value}
                  option={option}
                />
              ))}
            </div>
            <div className="mt-5 flex flex-row justify-center">
              <Button variant={ButtonVariant.Primary}>Set reminder</Button>
            </div>
          </form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default ReminderModal;
