import type { ReactElement } from 'react';
import React from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import { Switch } from '../fields/Switch';
import { Dropdown } from '../fields/Dropdown';
import { ButtonSize, ButtonVariant } from '../buttons/common';
import { useChannelHighlightPreferences } from '../../hooks/notifications/useChannelHighlightPreferences';
import { HighlightSignificance } from '../../graphql/highlights';
import { NotificationContainer, NotificationSection } from './utils';

const SIGNIFICANCE_ORDER: HighlightSignificance[] = [
  HighlightSignificance.Breaking,
  HighlightSignificance.Major,
  HighlightSignificance.Notable,
  HighlightSignificance.Routine,
];

const SIGNIFICANCE_LABELS: Record<HighlightSignificance, string> = {
  [HighlightSignificance.Breaking]: 'Breaking only',
  [HighlightSignificance.Major]: 'Major and above',
  [HighlightSignificance.Notable]: 'Notable and above',
  [HighlightSignificance.Routine]: 'Routine and above (everything)',
};

const DEFAULT_SIGNIFICANCE = HighlightSignificance.Major;

const MajorHeadlinesNotificationSection = (): ReactElement | null => {
  const {
    channels,
    isLoading,
    isPending,
    setChannelPreference,
    getMinSignificance,
  } = useChannelHighlightPreferences();

  if (isLoading || channels.length === 0) {
    return null;
  }

  return (
    <NotificationSection>
      <Typography type={TypographyType.Body} bold>
        Happening Now
      </Typography>
      <Typography
        color={TypographyColor.Tertiary}
        type={TypographyType.Footnote}
      >
        Choose how often you hear from each channel. Lower significance levels
        mean more notifications.
      </Typography>
      <NotificationContainer>
        {channels.map((channel) => {
          const current = getMinSignificance(channel.channel);
          const isOn = !!current;
          const inputId = `major-headlines-${channel.channel}`;
          const selectedIndex = current
            ? SIGNIFICANCE_ORDER.indexOf(current as HighlightSignificance)
            : -1;
          const dropdownOptions = SIGNIFICANCE_ORDER.map(
            (level) => SIGNIFICANCE_LABELS[level],
          );

          return (
            <div
              key={channel.channel}
              className="flex flex-col gap-2 border-b border-border-subtlest-tertiary pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex flex-row justify-between gap-3">
                <Typography type={TypographyType.Callout}>
                  {channel.displayName}
                </Typography>
                <Switch
                  inputId={inputId}
                  name={inputId}
                  aria-label={channel.displayName}
                  checked={isOn}
                  compact={false}
                  disabled={isPending}
                  onToggle={() =>
                    setChannelPreference(
                      channel.channel,
                      isOn ? null : DEFAULT_SIGNIFICANCE,
                    )
                  }
                />
              </div>
              {isOn && (
                <Dropdown
                  selectedIndex={selectedIndex >= 0 ? selectedIndex : 1}
                  options={dropdownOptions}
                  buttonSize={ButtonSize.Small}
                  buttonVariant={ButtonVariant.Float}
                  disabled={isPending}
                  onChange={(_label, index) =>
                    setChannelPreference(
                      channel.channel,
                      SIGNIFICANCE_ORDER[index],
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </NotificationContainer>
    </NotificationSection>
  );
};

export default MajorHeadlinesNotificationSection;
