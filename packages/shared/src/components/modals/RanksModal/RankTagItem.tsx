import React, { ReactElement } from 'react';
import classNames from 'classnames';
import RadialProgress from '../../RadialProgress';
import styles from '../../RankProgress.module.css';
import { RankTag, RankTagPill, RankTagProps } from './common';

const RankTagItem = ({ tag }: RankTagProps): ReactElement => {
  return (
    <RankTag>
      <RadialProgress
        progress={tag.count}
        steps={7}
        className={classNames('w-5 h-5', styles.radialProgress)}
      />
      <RankTagPill>#{tag.title}</RankTagPill>
    </RankTag>
  );
};
export default RankTagItem;
