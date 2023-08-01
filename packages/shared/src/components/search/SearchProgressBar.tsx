import React from 'react';

export interface SearchProgressBarProps {
  progress: number;
}

export const SearchProgressBar = ({progress}: SearchProgressBarProps) => {
  return (
    <div className='relative flex gap-6 h-2' data-testId="SearchProgressBar">
      <div className='relative flex-1 h-full bg-white rounded-full'>
        <div
          className={`absolute left-0 h-full bg-theme-status-cabbage rounded-full ${progress >= 33 ? 'w-full' : ''}`}
          style={{ width: progress < 33 ? `${progress * 3}%` : '' }} 
        ></div>
      </div>
      <div className='relative flex-1 h-full bg-white rounded-full'>
        <div
          className={`absolute left-0 h-full bg-theme-status-cabbage rounded-full ${progress >= 66 ? 'w-full' : ''}`}
          style={{ width: progress >= 33 && progress < 66 ? `${(progress - 33) * 3}%` : '' }} 
          ></div>
      </div>
      <div className='relative flex-1 h-full bg-white rounded-full'>
        <div
          className={`absolute left-0 h-full bg-theme-status-cabbage rounded-full ${progress >= 100 ? 'w-full' : ''}`}
          style={{ width: progress >= 66 && progress < 100 ? `${(progress - 66) * 3}%` : '' }} 
        ></div>
      </div>
    </div>
  )
};