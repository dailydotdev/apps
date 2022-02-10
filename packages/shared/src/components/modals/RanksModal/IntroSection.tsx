import React, { ReactElement } from 'react';
import { ClickableText } from '../../buttons/ClickableText';
import { ModalSection, ModalSubTitle, ModalText } from '../common';

const IntroSection = (): ReactElement => {
  return (
    <ModalSection className="mb-4">
      <ModalSubTitle>Reading status</ModalSubTitle>
      <ModalText>
        Read content you love to stay updated.{' '}
        <ClickableText
          tag="a"
          target="_blank"
          href="https://docs.daily.dev/docs/your-profile/weekly-goal"
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
