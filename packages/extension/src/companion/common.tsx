import React from 'react';
import { AlertPointerCopy } from '@dailydotdev/shared/src/components/alert/common';
import { getCompanion } from '@dailydotdev/shared/src/hooks/companion/common';

export const getCompanionWrapper = getCompanion;

export const companionAlertMessage = (
  <AlertPointerCopy>
    Meet your new superpower! 🦸
    <br />
    We prepared a <strong>TLDR</strong> for you inside
  </AlertPointerCopy>
);
