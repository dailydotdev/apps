import React from 'react';
import classnames from 'classnames';
import {
  getDefaultLink,
  CustomTime,
  TimeFormat,
  getCustomExpiration,
  getTimeFormatExpiration,
} from './dnd';
import { Radio } from '../../../shared/src/components/fields/Radio';
import { Dropdown } from '../../../shared/src/components/fields/Dropdown';
import { TextField } from '../../../shared/src/components/fields/TextField';
import { ModalCloseButton } from '../../../shared/src/components/modals/ModalCloseButton';
import {
  StyledModal,
  ModalProps,
} from '../../../shared/src/components/modals/StyledModal';
import styles from './DoNotDisturbModal.module.css';
import DndContext from './DndContext';

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
  const { setDndSettings } = React.useContext(DndContext);
  const [link, setLink] = React.useState('');
  const [customNumber, setCustomNumber] = React.useState(0);
  const [customTimeIndex, setCustomTimeIndex] = React.useState(0);
  const [dndTime, setDndTime] = React.useState(defaultTimeFormat);

  const handleSubmit = async (e: React.MouseEvent<Element, MouseEvent>) => {
    const expiration =
      dndTime === TimeFormat.CUSTOM
        ? getCustomExpiration(customTimeOptions[customTimeIndex], customNumber)
        : getTimeFormatExpiration(dndTime);

    const fallback = link || getDefaultLink();

    await setDndSettings({ expiration, link: fallback });

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
