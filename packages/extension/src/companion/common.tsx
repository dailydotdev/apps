import React from 'react';
import { PointedAlertCopy } from '@dailydotdev/shared/src/components/alert/common';

export const getCompanionWrapper = (): HTMLElement =>
  document
    .querySelector('daily-companion-app')
    .shadowRoot.querySelector('#daily-companion-wrapper');

export const companionAlertMessage = (
  <PointedAlertCopy>
    Meet your new superpower! 🦸
    <br />
    We prepared a <strong>TLDR</strong> for you inside
  </PointedAlertCopy>
);
