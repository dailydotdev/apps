import React from 'react';
import { Button, ButtonSize } from '../buttons/Button';
import { AiIcon } from '../icons';
import { IconSize } from '../Icon';

export interface SearchBarSuggestionProps {
  suggestion: string;
  onClick: () => void;
}

export const SearchBarSuggestion = ({ suggestion, onClick }: SearchBarSuggestionProps) => {

  return (
    <Button
      className='btn-secondary border-theme-divider-tertiary typo-subhead text-theme-label-tertiary'
      onClick={onClick}
      buttonSize={ButtonSize.XLarge}
      icon={
        <AiIcon size={IconSize.Small} />
      }
    >
      {suggestion}
    </Button>
  )

  // return (
  //   <div className='flex items-center justify-between px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100' onClick={onClick}>
  //     <span className='flex-1'>{suggestion}</span>
  //     <span className='flex-shrink-0 text-gray-500'>1 day ago</span>
  //   </div>
  // )
}