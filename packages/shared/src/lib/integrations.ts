import { FunctionComponent } from 'react';

import { ButtonColor } from '../components/buttons/Button';
import { IconProps } from '../components/Icon';
import { AppIcon, SlackIcon } from '../components/icons';
import { UserIntegrationType } from '../graphql/integrations';
import { PromptOptions } from '../hooks/usePrompt';
import { labels } from './labels';

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
