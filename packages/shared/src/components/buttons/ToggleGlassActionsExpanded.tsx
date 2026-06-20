import type { ReactElement } from 'react';
import React from 'react';
import type { ButtonProps } from './Button';
import { Button, ButtonSize, ButtonVariant } from './Button';
import { LayoutIcon } from '../icons';
import type { IconSize } from '../Icon';
import { Tooltip } from '../tooltip/Tooltip';
import { useLayoutVariant } from '../../hooks/layout/useLayoutVariant';
import { useFeedCardGlassActions } from '../../hooks/useFeedCardGlassActions';
import { useGlassActionsExpanded } from '../../hooks/useGlassActionsExpanded';

export const ToggleGlassActionsExpanded = ({
  buttonProps = {},
  iconSize,
}: {
  buttonProps?: ButtonProps<'button'>;
  iconSize?: IconSize;
}): ReactElement | null => {
  const glassActions = useFeedCardGlassActions();
  const [expanded, setExpanded] = useGlassActionsExpanded();
  const { isV2 } = useLayoutVariant();

  if (!glassActions) {
    return null;
  }

  const icon = <LayoutIcon secondary={expanded} size={iconSize} />;

  return (
    <Tooltip
      side="bottom"
      content={`${expanded ? 'Hide' : 'Always show'} post actions`}
    >
      <Button
        size={ButtonSize.Medium}
        variant={isV2 ? ButtonVariant.Tertiary : ButtonVariant.Float}
        {...buttonProps}
        pressed={expanded}
        icon={icon}
        onClick={() => setExpanded(!expanded)}
      />
    </Tooltip>
  );
};
