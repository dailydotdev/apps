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
      <SliderPrimitive.Track className="relative h-2 flex-1 rounded-max bg-surface-disabled">
        <SliderPrimitive.Range className="absolute h-full rounded-max bg-brand-default" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-7 w-7 rounded-max border-4 border-accent-cabbage-default bg-accent-cabbage-subtlest" />
    </SliderPrimitive.Root>
  );
};

export { Slider };
