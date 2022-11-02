import React, { ReactElement } from 'react';
import { ClickableText } from '../../buttons/ClickableText';
import { ModalSection, ModalSubTitle, ModalText } from '../common';
import { weeklyGoal } from '../../../lib/constants';

const IntroSection = (): ReactElement => {
  return (
    <ModalSection className="mb-4">
      <ModalSubTitle>Reading status</ModalSubTitle>
      <ModalText>
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
      </ModalText>
    </ModalSection>
  );
};
export default IntroSection;
