import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { AiIcon } from '../icons';
import { IconSize } from '../Icon';

export interface SearchBarSuggestionProps {
  suggestion: string;
  onClick: () => void;
}

export const SearchBarSuggestion = ({
  suggestion,
  onClick,
}: SearchBarSuggestionProps): ReactElement => {
  return (
    <Button
      className="btn-secondary border-theme-divider-tertiary typo-subhead text-theme-label-tertiary"
      onClick={onClick}
      buttonSize={ButtonSize.XLarge}
      icon={<AiIcon size={IconSize.Small} />}
    >
      {suggestion}
    </Button>
  );
};
