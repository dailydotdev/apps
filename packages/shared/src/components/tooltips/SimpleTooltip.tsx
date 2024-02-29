import React, { ReactElement, useMemo } from 'react';
import dynamicParent, {
  DynamicParentPlaceholder,
} from '../../lib/dynamicParent';
import { getShouldLoadTooltip, TooltipProps } from './BaseTooltip';

const BaseTooltipLoader = () =>
  import(/* webpackChunkName: "lazyTooltip" */ './BaseTooltip');

const TippyTooltip = dynamicParent<TooltipProps>(
  () => BaseTooltipLoader().then((mod) => mod.BaseTooltip),
  DynamicParentPlaceholder,
);

export function SimpleTooltip({
  show = true,
  children,
  content,
  onTrigger,
  onShow,
  forceLoad,
  ...props
}: TooltipProps & { show?: boolean }): ReactElement {
  /**
   * We introduced the `shouldShow` variable to manage a re-focus issue
   * The old implementation would re-focus the tooltip whenever a modal would close
   * Read more on the PR: https://github.com/dailydotdev/apps/pull/713
   */
  let shouldShow = true;
  const component = useMemo(() => {
    const tooltipProps = {};
    if (typeof content === 'string') {
      tooltipProps['aria-label'] = content;
    }

    return React.cloneElement(children, {
      ...tooltipProps,
      ...children.props,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const onTooltipTrigger = (_, event) => {
    shouldShow = event.type !== 'focus';

    onTrigger?.(_, event);
  };

  const onUntrigger = (_, event) => {
    const eventPath = event.path || event.composedPath?.();
    const bodyPath = eventPath.filter((path) => document.body === path)[0];
    if (bodyPath?.className === 'ReactModal__Body--open') {
      shouldShow = false;
      return;
    }
    shouldShow = true;
  };

  const onTooltipShow = (_) => {
    if (shouldShow) {
      return onShow?.(_);
    }

    return false;
  };

  if (!show) {
    return component;
  }

  return (
    <TippyTooltip
      {...props}
      shouldLoad={forceLoad || getShouldLoadTooltip()}
      content={content}
      onTrigger={onTooltipTrigger}
      onUntrigger={onUntrigger}
      onShow={onTooltipShow}
    >
      {component}
    </TippyTooltip>
  );
}

export default SimpleTooltip;
