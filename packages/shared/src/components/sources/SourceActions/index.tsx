import React, { ReactElement } from 'react';
import { SourceSubscribeButton } from './SourceSubscribeButton';
import SourceActionsBlock from './SourceActionsBlock';
import { useSourceActionsBlock } from '../../../hooks/source/useSourceActionsBlock';
import { Source } from '../../../graphql/sources';
import { ButtonVariant } from '../../buttons/common';

interface SourceActionsButton {
  className?: string;
  variant?: ButtonVariant;
}

interface SourceActionsProps {
  source: Source;
  hideBlock?: boolean;
  followProps?: SourceActionsButton;
}

export const SourceActions = (props: SourceActionsProps): ReactElement => {
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

export default SourceActions;
