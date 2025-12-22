import type { ReactElement } from 'react';
import React from 'react';
import styles from './Log.module.css';
import ShareStatButton from './ShareStatButton';
import type { BaseCardProps } from './types';
import { TrackList } from './primitives';

export default function CardRecords({
  data,
  isActive,
  cardType,
  imageCache,
  onImageFetched,
}: BaseCardProps): ReactElement {
  return (
    <>
      {/* Main content - centered vertically */}
      <div className={styles.cardContent}>
        <TrackList records={data.records} animated />
      </div>

      {/* Share button - pushed to bottom with margin-top: auto */}
      <ShareStatButton
        delay={1.4}
        isActive={isActive}
        cardType={cardType}
        imageCache={imageCache}
        onImageFetched={onImageFetched}
        statText="my 2025 greatest records on daily.dev"
      />
    </>
  );
}
