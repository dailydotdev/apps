import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../../../../components/typography/Typography';
import { Tooltip } from '../../../../../components/tooltip/Tooltip';
import type { RepositoryLanguage } from './types';

interface LanguageBarProps {
  languages: RepositoryLanguage[];
  showLegend?: boolean;
}

export function LanguageBar({
  languages,
  showLegend = true,
}: LanguageBarProps): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      {/* Progress bar */}
      <div className="flex h-2 w-full overflow-hidden rounded-max">
        {languages.map((lang) => (
          <Tooltip
            key={lang.name}
            content={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
          >
            <div
              className="hover:opacity-80 h-full transition-all duration-200"
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color,
              }}
            />
          </Tooltip>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-3">
          {languages.map((lang) => (
            <div key={lang.name} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: lang.color }}
              />
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Secondary}
              >
                {lang.name}
              </Typography>
              <Typography
                type={TypographyType.Caption1}
                color={TypographyColor.Tertiary}
              >
                {lang.percentage.toFixed(1)}%
              </Typography>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
