import React, { ReactElement } from 'react';
import { ModalSubTitle } from '../common';
import { RanksTagsProps, RanksTagsSection, RanksTagsList } from './common';
import RankTagItem from './RankTagItem';

const RanksTags = ({
  tags,
  isAtModal,
  limit = 6,
}: RanksTagsProps): ReactElement => {
  return (
    <RanksTagsSection>
      <ModalSubTitle>Reading status per tag</ModalSubTitle>
      <RanksTagsList style={{ gridTemplateRows: '1fr 1fr 1fr' }}>
        {Array(limit)
          .fill(0)
          .map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <RankTagItem tag={tags[i]} key={i} isAtModal={isAtModal} />
          ))}
      </RanksTagsList>
    </RanksTagsSection>
  );
};
export default RanksTags;
