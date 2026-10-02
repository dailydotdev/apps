import type { FunctionComponent } from 'react';
import type { IconProps } from '../components/Icon';
import { AppIcon, SlackIcon } from '../components/icons';
import type { SlackDigest } from '../graphql/integrations';
import { UserIntegrationType } from '../graphql/integrations';
import type { PromptOptions } from '../hooks/usePrompt';
import { labels } from './labels';
import { ButtonColor } from '../components/buttons/Button';

const integrationTypeToIconMap: Record<
  UserIntegrationType,
  FunctionComponent<IconProps>
> = {
  [UserIntegrationType.Slack]: SlackIcon,
};

export const getIconForIntegration = (
  type: UserIntegrationType,
): FunctionComponent<IconProps> => {
  return integrationTypeToIconMap[type] || AppIcon;
};

export const deleteSourceIntegrationPromptOptions: PromptOptions = {
  title: labels.integrations.prompt.deleteSourceIntegration.title,
  description: labels.integrations.prompt.deleteSourceIntegration.description,
  okButton: {
    title: labels.integrations.prompt.deleteSourceIntegration.okButton,
    color: ButtonColor.Ketchup,
  },
};

export const deleteIntegrationPromptOptions: PromptOptions = {
  title: labels.integrations.prompt.deleteIntegration.title,
  description: labels.integrations.prompt.deleteIntegration.description,
  okButton: {
    title: labels.integrations.prompt.deleteIntegration.okButton,
    color: ButtonColor.Ketchup,
  },
};

export const getSlackChannelLabel = (name: string): string =>
  name.startsWith('#') ? name : `#${name}`;

export const slackDigestWeekdays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const defaultSlackDigestSchedule = { weekday: 1, hour: 9 };

export const formatSlackDigestSchedule = ({
  weekday,
  hour,
}: Pick<SlackDigest, 'weekday' | 'hour'>): string =>
  `${slackDigestWeekdays[weekday]}s ${hour}:00`;

export const formatSlackDigestTopics = ({
  tags,
}: Pick<SlackDigest, 'tags'>): string =>
  tags.length ? tags.map((tag) => `#${tag}`).join(', ') : 'All topics';
