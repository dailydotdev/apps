import React from 'react';
import ProgressCircle from '../../ProgressCircle';

export const ProfileCompletion = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <ProgressCircle progress={50} size={50} showPercentage />
    </div>
  );
};
