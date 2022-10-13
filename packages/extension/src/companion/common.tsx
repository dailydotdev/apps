import React from 'react';
import { AlertPointerCopy } from '@dailydotdev/shared/src/components/alert/common';

export const getCompanionWrapper = (): HTMLElement =>
  document
    .querySelector('daily-companion-app')
    .shadowRoot.querySelector('#daily-companion-wrapper');

export const companionAlertMessage = (
  <AlertPointerCopy>
    Meet your new superpower! 🦸
    <br />
    We prepared a <strong>TLDR</strong> for you inside
  </AlertPointerCopy>
);
