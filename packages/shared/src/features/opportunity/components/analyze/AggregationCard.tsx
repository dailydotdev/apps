import type { ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { ElementPlaceholder } from '../../../../components/ElementPlaceholder';

type AggregationCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentColor: 'avocado' | 'water' | 'cabbage';
  children: ReactNode;
  isLoading?: boolean;
  delay?: number;
};

const accentColorMap = {
  avocado: {
    iconBg: 'bg-accent-avocado-subtlest',
    iconColor: 'text-accent-avocado-default',
  },
  water: {
    iconBg: 'bg-accent-water-subtlest',
    iconColor: 'text-accent-water-default',
  },
  cabbage: {
    iconBg: 'bg-accent-cabbage-subtlest',
    iconColor: 'text-accent-cabbage-default',
  },
};

export const AggregationCard = ({
  title,
  subtitle,
  icon,
  accentColor,
  children,
  isLoading,
  delay = 0,
}: AggregationCardProps) => {
  const colors = accentColorMap[accentColor];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4">
        <div className="flex items-center gap-3">
          <ElementPlaceholder className="size-9 rounded-10" />
          <div className="flex flex-col gap-1">
            <ElementPlaceholder className="h-4 w-24 rounded-4" />
            <ElementPlaceholder className="h-3 w-32 rounded-4" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <ElementPlaceholder className="h-5 w-full rounded-6" />
          <ElementPlaceholder className="h-5 w-3/4 rounded-6" />
          <ElementPlaceholder className="h-5 w-2/3 rounded-6" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-default p-4 opacity-0"
      style={{
        animation: `slideUp 0.4s ease-out ${delay}ms forwards`,
      }}
    >
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div
          className={classNames(
            'flex size-9 items-center justify-center rounded-10',
            colors.iconBg,
            colors.iconColor,
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <Typography type={TypographyType.Callout} bold>
            {title}
          </Typography>
          <Typography
            type={TypographyType.Caption1}
            color={TypographyColor.Tertiary}
          >
            {subtitle}
          </Typography>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

// CSS keyframe animation for the slide up effect
export const AggregationCardStyles = () => (
  <style>{`
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `}</style>
);
