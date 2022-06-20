import React, { ReactElement } from 'react';
import classed from '../lib/classed';

const BetaBadgeContainer = classed(
  'div',
  'bg-theme-overlay-cabbage py-1 px-3 ml-2 rounded-10 text-theme-status-cabbage font-bold typo-body',
);

export function BetaBadge(): ReactElement {
  return <BetaBadgeContainer>Beta</BetaBadgeContainer>;
}
