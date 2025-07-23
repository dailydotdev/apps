import { ButtonColor, ButtonSize } from '../components/buttons/Button';
import { IconSize } from '../components/Icon';
import { useFeature } from '../components/GrowthBookProvider';
import {
  featureCardUiButtons,
  featureCardUiColors,
} from '../lib/featureManagement';

export interface CardExperimentConfig {
  useNewExperience: boolean;
  showAwardAction: boolean;
  copyButtonColor: ButtonColor;
  copyButtonClassName: string | undefined;
  background: string;
  iconSize: IconSize;
  buttonSize: ButtonSize;
  buttonRowPadding: string;
  showVoteButtonsInActions?: boolean;
  showVoteButtonsInCard?: boolean;
  cardBaseClassName?: string;
}

export type CardVariant = 'grid' | 'list' | 'postActions';

export function useCardExperimentConfig(
  variant: CardVariant = 'grid',
): CardExperimentConfig {
  const buttonExp = useFeature(featureCardUiButtons);
  const colorExp = useFeature(featureCardUiColors);

  let background: string;
  if (colorExp) {
    background =
      variant === 'list' ? 'bg-transparent' : 'bg-background-default';
  } else {
    background = 'bg-surface-float';
  }

  let iconSize: IconSize;
  if (variant === 'list') {
    iconSize = IconSize.Medium;
  } else {
    iconSize = buttonExp ? IconSize.XSmall : IconSize.Small;
  }

  const config: CardExperimentConfig = {
    useNewExperience: buttonExp || colorExp,
    showAwardAction: buttonExp,
    copyButtonColor: colorExp ? ButtonColor.Water : ButtonColor.Cabbage,
    copyButtonClassName: colorExp ? 'hover:text-text-link' : undefined,
    background,
    iconSize,
    buttonSize: buttonExp ? ButtonSize.Small : ButtonSize.Small,
    buttonRowPadding: buttonExp ? ' px-1 pb-1' : '',
  };

  if (variant === 'postActions') {
    config.showVoteButtonsInActions = buttonExp || colorExp;
    config.showVoteButtonsInCard = !buttonExp && !colorExp;
    config.copyButtonClassName = colorExp
      ? 'group text-text-tertiary group-hover:text-text-link'
      : 'btn-tertiary-cabbage';
    config.cardBaseClassName =
      'flex !flex-row gap-2 hover:border-border-subtlest-tertiary';
  }

  return config;
}
