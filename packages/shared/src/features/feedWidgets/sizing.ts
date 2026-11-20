/**
 * A widget's full height: the feed's usual card, one with a three-line title,
 * so a widget lines up with the cards around it. Feed cards run from
 * `min-h-card` to `max-h-cardLarge` with their content; most rows land here.
 */
export const RAIL_HEIGHT = '25.375rem';
/** Half the rail, less the row gap: a Small widget, or one row of a Tall one. */
export const RAIL_CELL_HEIGHT = `calc((${RAIL_HEIGHT} - 1.5rem) / 2)`;
