import React, { ReactElement } from 'react';
import { SourceSubscribeButton } from './SourceSubscribeButton';
import SourceActionsBlock from './SourceActionsBlock';
import { useSourceActionsBlock } from '../../../hooks/source/useSourceActionsBlock';
import { Source } from '../../../graphql/sources';
import { ButtonVariant } from '../../buttons/common';
import { feature } from '../../../lib/featureManagement';
import { withExperiment } from '../../withExperiment';
import { SourceActionsWithNotifyExperiment } from './SourceActionsWithNotifyExperiment';

interface SourceActionsButton {
  className?: string;
  variant?: ButtonVariant;
}

interface SourceActionsProps {
  source: Source;
  hideBlock?: boolean;
  followProps?: SourceActionsButton;
}

const SourceActionsControl = (props: SourceActionsProps): ReactElement => {
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
  fallback: SourceActionsControl,
  feature: feature.sourceNotifyButton,
  value: true,
});

export default SourceActions;
