import classed from '../../../lib/classed';
import { FlexCol, FlexRow } from '../../utilities';

export const previewImageClass =
  'w-28 h-16 rounded-12 bg-text-disabled object-cover';

export const WritePreviewContainer = classed(
  FlexCol,
  'rounded-16 border border-border-subtlest-tertiary',
);

export const WritePreviewContent = classed(
  FlexRow,
  'relative gap-3 items-center py-5 px-4',
);
