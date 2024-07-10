import { FormEventHandler, ReactElement, useState } from 'react';
import classNames from 'classnames';
import { addHours, format } from 'date-fns';
import { Modal, ModalProps } from '../modals/common/Modal';
import { ModalHeader } from '../modals/common/ModalHeader';
import { ModalBody } from '../modals/common/ModalBody';
import { ModalSize } from '../modals/common/types';
import { Button, ButtonVariant } from '../buttons/Button';

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

// todo: replace with one coming from hook
enum ReminderPreference {
  OneHour = 'In 1 hour',
  LaterToday = 'Later today',
  Tomorrow = 'Tomorrow',
  TwoDays = 'In 2 days',
  NextWeek = 'Next week',
}

const MODAL_OPTIONS: Array<ReminderModalItemProps['option']> = Object.entries(
  ReminderPreference,
).map(([value, label]) => ({
  value,
  label,
}));

const getRemindAt = (date: Date, preference: ReminderPreference) =>
  addHours(date, 1);

const ReminderModalOption = (props: ReminderModalItemProps) => {
  const { option, onClick, isActive } = props;
  const { label, value } = option;

  const now = new Date();
  const timeForOption = format(getRemindAt(now, label), 'h:mm a');

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
        <span className="text-text-quaternary"> ({timeForOption})</span>
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
