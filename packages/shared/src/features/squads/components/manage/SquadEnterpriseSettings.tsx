import type { ReactElement } from 'react';
import React from 'react';
import { Switch } from '../../../../components/fields/Switch';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../../components/typography/Typography';
import { isSourceAdFree } from '../../../../lib/ads';
import { useSquadPageContext } from '../../SquadPageContext';
import { useUpdateSquadSettings } from '../../hooks/useUpdateSquadSettings';
import { hasSquadFeature, showsVerifiedBadge } from '../../lib/features';
import { SquadEnterpriseGate } from './SquadEnterpriseGate';

interface SettingRowProps {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}

const SettingRow = ({
  id,
  title,
  description,
  checked,
  disabled,
  onToggle,
}: SettingRowProps): ReactElement => (
  <div className="flex items-start justify-between gap-4">
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <Typography type={TypographyType.Callout} bold>
        {title}
      </Typography>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Tertiary}
      >
        {description}
      </Typography>
    </div>
    <Switch
      inputId={id}
      name={id}
      checked={checked}
      disabled={disabled}
      onToggle={onToggle}
      compact={false}
      aria-label={title}
    />
  </div>
);

const badgeCopy = {
  title: 'Verified badge',
  description: 'Show the verified badge next to your name.',
};

const adFreeCopy = {
  title: 'Ad-free',
  description: 'No ads on your page, feed and posts.',
};

/**
 * Enterprise settings, saved as they are toggled. Squads whose plan doesn't
 * include one see it locked, so they know Enterprise has it.
 */
export const SquadEnterpriseSettings = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const { mutate: onUpdate, isPending } = useUpdateSquadSettings(squad);
  const hasBadge = hasSquadFeature(squad, 'verified');
  const hasAdFree = hasSquadFeature(squad, 'adFree');

  return (
    <div className="flex flex-col gap-4">
      <Typography type={TypographyType.Body} bold>
        Enterprise
      </Typography>
      {hasBadge ? (
        <SettingRow
          id="squad-verified-badge"
          {...badgeCopy}
          checked={showsVerifiedBadge(squad)}
          disabled={isPending}
          onToggle={() =>
            onUpdate({ showVerifiedBadge: !showsVerifiedBadge(squad) })
          }
        />
      ) : (
        <SquadEnterpriseGate {...badgeCopy} />
      )}
      {hasAdFree ? (
        <SettingRow
          id="squad-ad-free"
          {...adFreeCopy}
          checked={isSourceAdFree(squad)}
          disabled={isPending}
          onToggle={() => onUpdate({ hideAds: !isSourceAdFree(squad) })}
        />
      ) : (
        <SquadEnterpriseGate {...adFreeCopy} />
      )}
    </div>
  );
};
