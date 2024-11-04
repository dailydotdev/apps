import React, { ReactElement } from 'react';
import { TruncateText, type WithClassNameProps } from './utilities';
import type { TopReader } from './badges/TopReaderBadge';
import ConditionalWrapper from './ConditionalWrapper';
import { SimpleTooltip } from './tooltips';
import { formatDate, TimeFormatType } from '../lib/dateFormat';

type TopReaderInProps = WithClassNameProps & {
  topReader: Partial<TopReader>;
  tooltip?: boolean;
};

export const TopReaderIn = ({
  topReader,
  tooltip = false,
}: TopReaderInProps): ReactElement => {
  if (!topReader) {
    return null;
  }

  return (
    <ConditionalWrapper
      condition={tooltip}
      wrapper={(child) => {
        return (
          <SimpleTooltip
            content={formatDate({
              value: topReader.issuedAt,
              type: TimeFormatType.TopReaderBadge,
            })}
          >
            {child as ReactElement}
          </SimpleTooltip>
        );
      }}
    >
      <TruncateText>
        Top reader in {topReader.keyword?.flags?.title}
      </TruncateText>
    </ConditionalWrapper>
  );
};
