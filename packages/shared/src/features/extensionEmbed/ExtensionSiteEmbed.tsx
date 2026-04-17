import type { ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useExtensionSiteEmbed } from './useExtensionSiteEmbed';
import type {
  UseExtensionSiteEmbedOptions,
  UseExtensionSiteEmbedResult,
} from './useExtensionSiteEmbed';

interface ExtensionSiteEmbedProps extends UseExtensionSiteEmbedOptions {
  className?: string;
  permissionFrameTitle?: string;
  targetFrameTitle?: string;
  renderState?: (state: UseExtensionSiteEmbedResult) => ReactNode;
  onStateChange?: (state: UseExtensionSiteEmbedResult) => void;
  onTargetFrameLoad?: () => void;
}

const hiddenPermissionFrameClassName =
  'pointer-events-none absolute h-0 w-0 opacity-0';
const visibleFrameClassName = 'h-full w-full';
const frameBaseLayerClassName = 'relative z-0';

export const ExtensionSiteEmbed = ({
  className = visibleFrameClassName,
  permissionFrameTitle = 'Extension permission frame',
  targetFrameTitle = 'Embedded site',
  renderState,
  onStateChange,
  onTargetFrameLoad,
  ...options
}: ExtensionSiteEmbedProps): ReactElement | null => {
  const state = useExtensionSiteEmbed(options);
  const stateRef = useRef(state);
  stateRef.current = state;
  const view = renderState?.(state);
  const hasAnyFrame = !!state.permissionFrameSrc || !!state.targetFrameSrc;

  useEffect(() => {
    onStateChange?.(stateRef.current);
  }, [onStateChange, state.status, state.errorReason]);

  if (!hasAnyFrame && !view) {
    return null;
  }

  return (
    <>
      {view}
      {hasAnyFrame ? (
        <div className="relative z-0">
          {state.permissionFrameSrc ? (
            <iframe
              ref={state.permissionFrameRef}
              key={state.permissionFrameKey}
              src={state.permissionFrameSrc}
              title={permissionFrameTitle}
              className={
                state.showPermissionFrame
                  ? classNames(className, frameBaseLayerClassName)
                  : hiddenPermissionFrameClassName
              }
            />
          ) : null}
          {state.showTargetFrame ? (
            <iframe
              key={state.targetFrameKey}
              src={state.targetFrameSrc}
              title={targetFrameTitle}
              className={classNames(className, frameBaseLayerClassName)}
              onLoad={onTargetFrameLoad}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
};
