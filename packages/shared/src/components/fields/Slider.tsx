import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import classNames from 'classnames';

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  /**
   * Names the handle for assistive tech. It goes on the THUMB rather than the
   * root, because the thumb is what carries `role="slider"` — an `aria-label`
   * on the root reaches nothing, so a screen would otherwise read a bench of
   * these as a row of identical unnamed sliders.
   */
  thumbLabel?: string;
  /**
   * For a bench of several sliders in a narrow column, where the default's
   * 28px handle and 192px floor add up to a wall. One slider you are deciding
   * something with wants the big handle; seven you are nudging do not.
   */
  compact?: boolean;
}

const Slider = ({ className, thumbLabel, compact, ...props }: SliderProps) => {
  return (
    <SliderPrimitive.Root
      {...props}
      className={classNames(
        'relative flex touch-none select-none items-center',
        compact ? 'h-4 min-w-0' : 'h-5 min-w-48',
        className,
      )}
    >
      <SliderPrimitive.Track
        className={classNames(
          'relative flex-1 rounded-max bg-surface-disabled',
          compact ? 'h-1' : 'h-2',
        )}
      >
        <SliderPrimitive.Range className="absolute h-full rounded-max bg-brand-default" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={thumbLabel}
        className={classNames(
          'block rounded-max border-accent-cabbage-default bg-accent-cabbage-subtlest',
          compact ? 'h-3.5 w-3.5 border-2' : 'h-7 w-7 border-4',
        )}
      />
    </SliderPrimitive.Root>
  );
};

export { Slider };
