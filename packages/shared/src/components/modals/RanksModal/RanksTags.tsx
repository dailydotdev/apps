import React, { ReactElement } from 'react';
import { ModalSubTitle } from '../common';
import { RanksTagsProps, RanksTagsSection, RanksTagsList } from './common';
import RankTagItem from './RankTagItem';

const RanksTags = ({ tags }: RanksTagsProps): ReactElement => {
  return (
    <RanksTagsSection>
      <ModalSubTitle>Reading status per tag</ModalSubTitle>
      <RanksTagsList>
        {tags.map((tag) => (
          <RankTagItem tag={tag} key={tag.tag} />
        ))}
      </RanksTagsList>
    </RanksTagsSection>
  );
};
export default RanksTags;
