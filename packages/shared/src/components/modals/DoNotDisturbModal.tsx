import React from 'react';
import classnames from 'classnames';
import dnd, {
  CustomTime,
  TimeFormat,
  getTotalMinutes,
  getTimeFormatValue,
} from '../../lib/dnd';
import { Radio } from '../fields/Radio';
import { Dropdown } from '../fields/Dropdown';
import { TextField } from '../fields/TextField';
import { ModalCloseButton } from './ModalCloseButton';
import { StyledModal, ModalProps } from './StyledModal';
import styles from './DoNotDisturbModal.module.css';

export interface DoNotDisturbModalProps extends ModalProps {
  defaultTimeFormat?: TimeFormat;
}

const timeFormatOptions = Object.values(TimeFormat).map((value) => ({
  label: value,
  value,
}));

const customTimeOptions = Object.values(CustomTime);

const DoNotDisturbModal: React.FC<DoNotDisturbModalProps> = ({
  defaultTimeFormat = TimeFormat.HALF_HOUR,
  onRequestClose,
  ...modalProps
}) => {
  const [link, setLink] = React.useState('');
  const [customNumber, setCustomNumber] = React.useState(0);
  const [customTimeIndex, setCustomTimeIndex] = React.useState(0);
  const [dndTime, setDndTime] = React.useState(defaultTimeFormat);

  const handleSubmit = (e: React.MouseEvent<Element, MouseEvent>) => {
    const minutes =
      dndTime === TimeFormat.CUSTOM
        ? getTotalMinutes(customTimeOptions[customTimeIndex], customNumber)
        : getTimeFormatValue(dndTime);
    const error = dnd.setDndMode({
      link,
      minutes,
      timestamp: new Date(),
    });

    if (!error) return;

    // display error here

    onRequestClose(e);
  };

  return (
    <StyledModal
      {...modalProps}
      style={{
        content: {
          paddingTop: '2rem',
          maxWidth: '27.5rem',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <ModalCloseButton onClick={onRequestClose} />
      <div className={styles.heading}>
        <h3 className={styles.title}>Do Not Disturb</h3>
        <p className={styles.description}>
          Choose your preferences while you&apos;re on Do Not Disturb mode
        </p>
      </div>
      <div className={styles.content}>
        <TextField
          className={styles.url}
          inputId="defaultURL"
          label="Default URL (optional)"
          valueChanged={(text) => setLink(text)}
        />
        <Radio
          className="mt-8 "
          name="timeOff"
          value={dndTime}
          options={timeFormatOptions}
          onChange={(value: TimeFormat) => setDndTime(value)}
        />
        {dndTime !== TimeFormat.CUSTOM ? null : (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <TextField
              className={styles.custom}
              inputId="defaultURL"
              label="Number"
              type="number"
              valueChanged={(number) => setCustomNumber(parseInt(number))}
            />
            <Dropdown
              className={styles.custom}
              options={customTimeOptions}
              selectedIndex={customTimeIndex}
              onChange={(_, index) => setCustomTimeIndex(index)}
            />
          </div>
        )}
      </div>
      <div className={classnames(styles.footer, styles.centered)}>
        <button
          className={classnames(styles.done, styles.centered)}
          onClick={handleSubmit}
        >
          Done
        </button>
      </div>
    </StyledModal>
  );
};

export default DoNotDisturbModal;
