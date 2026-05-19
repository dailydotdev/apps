import type { ReactElement } from 'react';
import React from 'react';
import { TopicDigestCard } from './TopicDigestCard';
import type { TopicDigest } from './types';

interface TopicDigestGridProps {
  topics: TopicDigest[];
  readSet: Set<string>;
  onRead: (id: string) => void;
}

export const TopicDigestGrid = ({
  topics,
  readSet,
  onRead,
}: TopicDigestGridProps): ReactElement => (
  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
    {topics.map((topic) => (
      <TopicDigestCard
        key={topic.id}
        topic={topic}
        isRead={readSet.has(topic.id)}
        onRead={() => onRead(topic.id)}
      />
    ))}
  </div>
);
