import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import dynamicParent, {
  DynamicParentPlaceholder,
} from '../../lib/dynamicParent';
import type { TooltipProps, BaseTooltipProps } from './BaseTooltip';
import { getShouldLoadTooltip } from './BaseTooltip';

type TippyInstance = Parameters<NonNullable<BaseTooltipProps['onTrigger']>>[0];

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
  ariaLabel,
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
    if (ariaLabel) {
      tooltipProps['aria-label'] = ariaLabel;
    } else if (typeof content === 'string') {
      tooltipProps['aria-label'] = content;
    }

    return React.cloneElement(children, {
      ...tooltipProps,
      ...children.props,
    });
    // @NOTE see https://dailydotdev.atlassian.net/l/cp/dK9h1zoM
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const onTooltipTrigger = (inst: TippyInstance, event: Event) => {
    shouldShow = event.type !== 'focus';

    onTrigger?.(inst, event);
  };

  const onUntrigger = (_inst: TippyInstance, event: Event) => {
    const eventPath =
      (event as Event & { path?: EventTarget[] }).path ||
      event.composedPath?.();
    const bodyPath = eventPath.filter(
      (path: EventTarget) => document.body === path,
    )[0];
    if ((bodyPath as HTMLElement)?.className === 'ReactModal__Body--open') {
      shouldShow = false;
      return;
    }
    shouldShow = true;
  };

  const onTooltipShow = (inst: TippyInstance) => {
    if (shouldShow) {
      return onShow?.(inst);
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
