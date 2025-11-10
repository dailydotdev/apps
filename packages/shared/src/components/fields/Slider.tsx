import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import classNames from 'classnames';

const Slider = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>) => {
  return (
    <SliderPrimitive.Root
      {...props}
      className={classNames(
        'relative flex h-5 min-w-48 touch-none select-none items-center',
        className,
      )}
    >
      <SliderPrimitive.Track className="rounded-max bg-surface-disabled relative h-2 flex-1">
        <SliderPrimitive.Range className="rounded-max bg-brand-default absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="rounded-max border-accent-cabbage-default bg-accent-cabbage-subtlest block h-7 w-7 border-4" />
    </SliderPrimitive.Root>
  );
};

export { Slider };
