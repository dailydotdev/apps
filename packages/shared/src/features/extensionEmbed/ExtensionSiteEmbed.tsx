import type { ReactElement, ReactNode } from 'react';
import React, { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { useExtensionSiteEmbed } from './useExtensionSiteEmbed';
import type {
  UseExtensionSiteEmbedOptions,
  UseExtensionSiteEmbedResult,
} from './useExtensionSiteEmbed';

interface ExtensionSiteEmbedProps extends UseExtensionSiteEmbedOptions {
  className?: string;
  isTargetLoaded?: boolean;
  permissionFrameTitle?: string;
  targetFrameTitle?: string;
  renderState?: (state: UseExtensionSiteEmbedResult) => ReactNode;
  onStateChange?: (state: UseExtensionSiteEmbedResult) => void;
  onTargetDomReady?: () => void;
  onTargetFrameLoad?: () => void;
}

const hiddenPermissionFrameClassName =
  'pointer-events-none absolute h-0 w-0 opacity-0';
const visibleFrameClassName = 'h-full w-full';
const frameBaseLayerClassName = 'relative z-0';
const targetFrameStyle = {
  colorScheme: 'normal',
} as const;
const loadingFrameContainerStyle = {
  backgroundColor: 'transparent',
} as const;
const readyFrameContainerStyle = {
  backgroundColor: 'Canvas',
  colorScheme: 'normal',
} as const;
const frameContainerClassName = 'relative z-0 flex min-h-0 flex-1 flex-col';
const permissionFrameVisibleReasons = new Set([
  'missing-permission',
  'permission-denied',
  'permission-request-failed',
]);

export const ExtensionSiteEmbed = ({
  className = visibleFrameClassName,
  isTargetLoaded = false,
  permissionFrameTitle = 'Extension permission frame',
  targetFrameTitle = 'Embedded site',
  renderState,
  onStateChange,
  onTargetDomReady,
  onTargetFrameLoad,
  ...options
}: ExtensionSiteEmbedProps): ReactElement | null => {
  const state = useExtensionSiteEmbed(options);
  const stateRef = useRef(state);
  stateRef.current = state;
  const view = renderState?.(state);
  const isTargetReady = isTargetLoaded || state.isTargetDomReady;
  const frameContainerStyle =
    state.showTargetFrame && isTargetReady
      ? readyFrameContainerStyle
      : loadingFrameContainerStyle;
  const hasAnyFrame = !!state.permissionFrameSrc || !!state.targetFrameSrc;
  const shouldShowPermissionFrame =
    state.showPermissionFrame &&
    (state.status === 'permission-required' ||
      permissionFrameVisibleReasons.has(state.errorReason ?? ''));

  useEffect(() => {
    onStateChange?.(stateRef.current);
  }, [onStateChange, state.status, state.errorReason, state.isTargetDomReady]);

  useEffect(() => {
    if (state.isTargetDomReady) {
      onTargetDomReady?.();
    }
  }, [onTargetDomReady, state.isTargetDomReady]);

  const handleTargetFrameLoad = useCallback(() => {
    onTargetFrameLoad?.();
  }, [onTargetFrameLoad]);

  if (!hasAnyFrame && !view) {
    return null;
  }

  return (
    <>
      {view}
      {hasAnyFrame ? (
        <div className={frameContainerClassName} style={frameContainerStyle}>
          {state.permissionFrameSrc ? (
            <iframe
              ref={state.permissionFrameRef}
              key={state.permissionFrameKey}
              src={state.permissionFrameSrc}
              title={permissionFrameTitle}
              className={
                shouldShowPermissionFrame
                  ? classNames(className, frameBaseLayerClassName)
                  : hiddenPermissionFrameClassName
              }
            />
          ) : null}
          {state.showTargetFrame ? (
            <iframe
              ref={state.targetFrameRef}
              key={state.targetFrameKey}
              src={state.targetFrameSrc}
              title={targetFrameTitle}
              className={classNames(className, frameBaseLayerClassName)}
              onLoad={handleTargetFrameLoad}
              style={targetFrameStyle}
            />
          ) : null}
        </div>
      ) : null}
    </>
  );
};
