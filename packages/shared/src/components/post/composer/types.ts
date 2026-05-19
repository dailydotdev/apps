export type ComposerKind = 'text' | 'link' | 'poll' | 'standup';

export type StandupScheduleChoice = 'now' | 'later';

export interface StandupFormState {
  topic: string;
  scheduleChoice: StandupScheduleChoice;
  scheduledStart: string;
  description: string;
}

export interface TextFormState {
  title: string;
  body: string;
}

export interface LinkFormState {
  url: string;
  commentary: string;
}

export interface PollFormState {
  question: string;
  options: string[];
  durationDays: number | undefined;
}

export const DEFAULT_TEXT: TextFormState = { title: '', body: '' };
export const DEFAULT_LINK: LinkFormState = { url: '', commentary: '' };
export const DEFAULT_POLL: PollFormState = {
  question: '',
  options: ['', ''],
  durationDays: 7,
};

export const POLL_OPTIONS_MIN = 2;
export const POLL_OPTIONS_MAX = 4;
export const POLL_OPTION_MAX_LENGTH = 35;
export const TITLE_MAX_LENGTH = 250;

export const STANDUP_TOPIC_MAX_LENGTH = 280;
export const STANDUP_DESCRIPTION_MAX_LENGTH = 4000;

export const DEFAULT_STANDUP: StandupFormState = {
  topic: '',
  scheduleChoice: 'now',
  scheduledStart: '',
  description: '',
};
