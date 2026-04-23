import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../components/typography/Typography';
import { describeWeather, useWeather } from './useWeather';

interface ZenWeatherProps {
  className?: string;
}

export const ZenWeather = ({
  className,
}: ZenWeatherProps): ReactElement | null => {
  const { data, isError } = useWeather(true);

  if (!data || isError) {
    // Silent failure — weather is ambient, not load-bearing. If geo is denied
    // and IP fallback fails, we just omit the widget.
    return null;
  }

  const { label, symbol } = describeWeather(data.weatherCode, data.isDay);

  return (
    <div
      aria-label={`${label}, ${data.temperatureC} degrees Celsius in ${data.locationLabel}`}
      className={classNames(
        'flex items-center gap-2 rounded-full border border-border-subtlest-tertiary bg-surface-float px-3 py-1.5',
        className,
      )}
    >
      <span aria-hidden="true" className="text-lg">
        {symbol}
      </span>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Secondary}
      >
        {data.temperatureC}&deg;C &middot; {data.locationLabel}
      </Typography>
    </div>
  );
};
