import { ReactNode } from 'react';

export interface FeedSurveyProps {
  title: string;
  postFeedbackMessage?: string;
  max: number;
  lowScore: {
    value: number;
    message: string;
    cta: ReactNode;
  };
}
