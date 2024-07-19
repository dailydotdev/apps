import React from 'react';
import {
  SourceActions as SourceActionsWithNotifyExperiment,
  SourceActionsProps,
} from './SourceActions';
import { withExperiment } from '../../withExperiment';
import { feature } from '../../../lib/featureManagement';
import { SourceSubscribeButton } from '../SourceSubscribeButton';
import SourceActionsBlock from './SourceActionsBlock';
import { useSourceActionsBlock } from '../../../hooks/source/useSourceActionsBlock';

const SourceDefaultActions = (props: SourceActionsProps) => {
  const { source, hideBlock, notifyProps } = props;
  const { isBlocked, toggleBlock } = useSourceActionsBlock({
    source,
  });

  return (
    <>
      {!isBlocked && <SourceSubscribeButton source={source} {...notifyProps} />}
      {!hideBlock && (
        <SourceActionsBlock isBlocked={isBlocked} onClick={toggleBlock} />
      )}
    </>
  );
};

export const SourceActions = withExperiment(SourceActionsWithNotifyExperiment, {
  fallback: SourceDefaultActions,
  feature: feature.sourceNotifyButton,
  value: true,
});

export default SourceActions;
