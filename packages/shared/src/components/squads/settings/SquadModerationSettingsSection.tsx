import type { ReactElement } from 'react';
import React, { useState } from 'react';
import { SquadSettingsSection } from './SquadSettingsSection';
import { Radio } from '../../fields/Radio';
import { SourceMemberRole } from '../../../graphql/sources';
import { Switch } from '../../fields/Switch';
import { WidgetCard } from '../../widgets/WidgetCard';
import { useToggle } from '../../../hooks/useToggle';
import { Tooltip } from '../../tooltip/Tooltip';

interface SquadModerationSettingsSectionProps {
  initialMemberPostingRole?: SourceMemberRole;
  initialMemberInviteRole?: SourceMemberRole;
  initialModerationRequired?: boolean;
}

const memberRoleOptions = [
  {
    label: 'All members (recommended)',
    value: SourceMemberRole.Member,
  },
  {
    label: 'Only moderators',
    value: SourceMemberRole.Moderator,
  },
];

export function SquadModerationSettingsSection({
  initialMemberInviteRole,
  initialMemberPostingRole,
  initialModerationRequired,
}: SquadModerationSettingsSectionProps): ReactElement {
  const [memberPostingRole, setMemberPostingRole] = useState(
    initialMemberPostingRole || SourceMemberRole.Moderator,
  );
  const [memberInviteRole, setMemberInviteRole] = useState(
    initialMemberInviteRole || SourceMemberRole.Member,
  );
  const [moderationRequired, setModerationRequired] = useToggle(
    initialModerationRequired,
  );

  const handleMemberPostingRole = (value: SourceMemberRole) => {
    setMemberPostingRole(value);
    if (value === SourceMemberRole.Moderator) {
      setModerationRequired(false);
    }
  };

  return (
    <WidgetCard heading="🔒 Moderation Settings">
      <div className="flex flex-col gap-6 px-4 py-2">
        <SquadSettingsSection
          title="Post content"
          description="Choose who is allowed to post new content in this Squad."
          className="flex"
        >
          <Radio
            name="memberPostingRole"
            options={memberRoleOptions}
            value={memberPostingRole}
            onChange={handleMemberPostingRole}
          />
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Require post approval"
          description="Turn this on to have admins or moderators approve every new post before it's published."
        >
          <Tooltip
            side="top"
            content="Only admins and moderators can post; their posts are auto-published."
            className="max-w-64 !p-2 text-center"
            visible={memberPostingRole === SourceMemberRole.Moderator}
          >
            <span className="max-w-fit cursor-pointer">
              <Switch
                className="max-w-min cursor-pointer"
                name="moderationRequired"
                inputId="moderationRequired"
                disabled={memberPostingRole === SourceMemberRole.Moderator}
                checked={moderationRequired}
                onToggle={() => setModerationRequired(!moderationRequired)}
              >
                <span>{moderationRequired ? 'On' : 'Off'}</span>
              </Switch>
            </span>
          </Tooltip>
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Invitation permissions"
          description="Choose who is allowed to invite new members to this Squad."
        >
          <Radio
            name="memberInviteRole"
            options={memberRoleOptions}
            value={memberInviteRole}
            onChange={(value) => setMemberInviteRole(value as SourceMemberRole)}
          />
        </SquadSettingsSection>
      </div>
    </WidgetCard>
  );
}
