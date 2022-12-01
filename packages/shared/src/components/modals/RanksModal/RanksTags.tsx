import React, { ReactElement } from 'react';
import { Modal } from '../common/Modal';
import { RanksTagsProps, RanksTagsSection, RanksTagsList } from './common';
import RankTagItem from './RankTagItem';

const RanksTags = ({
  tags,
  isColorPrimary,
  limit = 6,
}: RanksTagsProps): ReactElement => {
  return (
    <RanksTagsSection>
      <Modal.Subtitle>Reading status per tag</Modal.Subtitle>
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
