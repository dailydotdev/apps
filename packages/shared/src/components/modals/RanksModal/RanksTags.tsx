import React, { ReactElement } from 'react';
import { ModalSubTitle } from '../common';
import { RanksTagsProps, RanksTagsSection, RanksTagsList } from './common';
import RankTagItem from './RankTagItem';

const RanksTags = ({
  tags,
  isColorPrimary,
  limit = 6,
}: RanksTagsProps): ReactElement => {
  return (
    <RanksTagsSection>
      <ModalSubTitle>Reading status per tag</ModalSubTitle>
      <RanksTagsList>
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            <RankTagItem
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              tag={tags[i]}
              isColorPrimary={isColorPrimary}
            />
          ))}
      </RanksTagsList>
    </RanksTagsSection>
  );
};
export default RanksTags;
