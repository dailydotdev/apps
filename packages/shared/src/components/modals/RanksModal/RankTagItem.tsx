import React, { ReactElement } from 'react';
import classNames from 'classnames';
import RadialProgress from '../../RadialProgress';
import styles from '../../RankProgress.module.css';
import { RankTag, RankTagPill, RankTagProps } from './common';

const RankTagItem = ({ tag, isColorPrimary }: RankTagProps): ReactElement => {
  const isPlaceholder = tag === undefined || tag === null;
  const className = isPlaceholder
    ? 'w-24 rounded-8 border border-theme-divider-secondary'
    : 'flex-shrink w-auto bg-theme-float';

  return (
    <RankTag>
      <RadialProgress
        progress={isPlaceholder ? 0 : tag.readingDays}
        steps={7}
        className={classNames('w-5 h-5', styles.radialProgress)}
        isColorPrimary={isColorPrimary}
      />
      <RankTagPill className={className}>
        {isPlaceholder ? '' : `#${tag.tag}`}
      </RankTagPill>
    </RankTag>
  );
};
export default RankTagItem;
