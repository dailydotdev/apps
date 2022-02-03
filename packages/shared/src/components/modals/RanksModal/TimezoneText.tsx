import React, { ReactElement } from 'react';
import { ClickableText } from '../../buttons/ClickableText';
import { ModalText } from '../common';
import { IntroSectionProps } from './common';
import { SimpleTooltip } from '../../tooltips/SimpleTooltip';

const classes = 'typo-callout text-theme-label-tertiary';

const TimezoneText = ({
  onShowAccount,
  user,
}: IntroSectionProps): ReactElement => {
  if (!user) {
    return (
      <ModalText className={classes}>
        To fit the weekly goal to your time zone, please sign up and add it in
        the account details.
      </ModalText>
    );
  }

  if (!user?.timezone) {
    return (
      <ModalText className={classes}>
        To fit the weekly goal to your time zone, please add it in your{' '}
        <SimpleTooltip content="Open account details">
          <ClickableText
            tag="a"
            className="inline-flex text-theme-label-link"
            onClick={() => onShowAccount()}
          >
            account details.
          </ClickableText>
        </SimpleTooltip>
      </ModalText>
    );
  }

  return null;
};
export default TimezoneText;
