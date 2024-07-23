import React from 'react';
import {
  SourceActionsWithNotifyExperiment,
  SourceActionsProps,
} from './SourceActionsWithNotifyExperiment';
import { withExperiment } from '../../withExperiment';
import { feature } from '../../../lib/featureManagement';
import { SourceSubscribeButton } from './SourceSubscribeButton';
import SourceActionsBlock from './SourceActionsBlock';
import { useSourceActionsBlock } from '../../../hooks/source/useSourceActionsBlock';

const SourceDefaultActions = (props: SourceActionsProps) => {
  const { source, hideBlock, followProps } = props;
  const { isBlocked, toggleBlock } = useSourceActionsBlock({
    source,
  });

  return (
    <>
      {!isBlocked && <SourceSubscribeButton source={source} {...followProps} />}
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
