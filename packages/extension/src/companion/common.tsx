import React, { ReactElement } from 'react';
import {
  Pointer,
  PointerColor,
} from '@dailydotdev/shared/src/components/Pointer';

export const getCompanionWrapper = (): HTMLElement =>
  document
    .querySelector('daily-companion-app')
    .shadowRoot.querySelector('#daily-companion-wrapper');

export const CompanionHelper = (): ReactElement => {
  return (
    <div className="absolute top-0 right-full py-2.5 px-4 mr-2 whitespace-nowrap rounded-10 border border-theme-status-cabbage bg-theme-bg-primary typo-subhead">
      <div className="relative">
        <Pointer
          className="top-1 -right-7 rotate-90"
          color={PointerColor.Cabbage}
        />
      </div>
      <p>
        Meet your new superpower! 🦸
        <br />
        We prepared a <strong>TLDR</strong> for you inside
      </p>
    </div>
  );
};
