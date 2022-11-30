import React, { ReactElement } from 'react';
import { ClickableText } from '../../buttons/ClickableText';
import { weeklyGoal } from '../../../lib/constants';
import { Modal } from '../common/Modal';

const IntroSection = (): ReactElement => {
  return (
    <div className="mb-4">
      <Modal.Subtitle>Reading status</Modal.Subtitle>
      <Modal.Text>
        Read content you love to stay updated.{' '}
        <ClickableText
          tag="a"
          target="_blank"
          href={weeklyGoal}
          rel="noopener"
          className="inline-flex text-theme-label-link"
        >
          Learn more.
        </ClickableText>
      </Modal.Text>
    </div>
  );
};
export default IntroSection;
