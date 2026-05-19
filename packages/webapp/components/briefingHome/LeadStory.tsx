import type { ReactElement } from 'react';
import React from 'react';
import { StoryRow } from './StoryRow';
import type { StoryItem } from './types';

interface LeadStoryProps {
  story: StoryItem;
  isRead: boolean;
  onRead: () => void;
}

export const LeadStory = ({
  story,
  isRead,
  onRead,
}: LeadStoryProps): ReactElement => (
  <StoryRow story={story} isRead={isRead} onRead={onRead} isLead />
);
