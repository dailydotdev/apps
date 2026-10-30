import { ButtonSize } from '../../buttons/common';
import { IconSize } from '../../Icon';

// Six actions with counters have to fit the 272px min card width on their
// intrinsic widths alone, because buttons never shrink (global flex-shrink: 0).
export const FEED_ACTION_BUTTON_SIZE = ButtonSize.XSmall;
export const FEED_ACTION_ICON_SIZE = IconSize.Size16;

export const actionCounterClassName = 'tabular-nums typo-footnote';
export const actionCounterLabelClassName = '!pl-0.5 pr-0.5';
// List cards in list_card_large_actions: the number sits 4px from the 20px
// icon, over the button's own padding, at regular weight with nothing after.
export const largeListActionCounterLabelClassName =
  '!pl-0 -ml-0.5 pr-0 !font-normal';
