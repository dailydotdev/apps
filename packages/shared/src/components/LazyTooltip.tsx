import React, { useState, forwardRef, ReactElement } from 'react';
import Tippy, { TippyProps } from '@tippyjs/react/headless';

export default forwardRef<Element, TippyProps>(function LazyTippy(
  props,
  ref,
): ReactElement {
  const [mounted, setMounted] = useState(false);

  const lazyPlugin = {
    fn: () => ({
      onMount: () => setMounted(true),
      onHidden: () => setMounted(false),
    }),
  };

  const computedProps = { ...props };

  computedProps.plugins = [lazyPlugin, ...(props.plugins || [])];

  if (props.render) {
    computedProps.render = (...args) => (mounted ? props.render(...args) : '');
  } else {
    computedProps.content = mounted ? props.content : '';
  }

  return <Tippy {...computedProps} ref={ref} />;
});
