import React, { ReactElement, useState } from 'react';
import { SquadSettingsSection } from './SquadSettingsSection';
import { Radio } from '../../fields/Radio';
import { SourceMemberRole } from '../../../graphql/sources';
import { Switch } from '../../fields/Switch';
import { WidgetCard } from '../../widgets/WidgetCard';
import { SimpleTooltip } from '../../tooltips';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { MiniCloseIcon } from '../../icons';

interface PermissionSectionProps {
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
}: PermissionSectionProps): ReactElement {
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const isMobile = useViewSize(ViewSize.MobileL);
  const [memberPostingRole, setMemberPostingRole] = useState(
    () => initialMemberPostingRole || SourceMemberRole.Moderator,
  );
  const [memberInviteRole, setMemberInviteRole] = useState(
    () => initialMemberInviteRole || SourceMemberRole.Member,
  );
  const [moderationRequired, setModerationRequired] = useState(
    initialModerationRequired,
  );

  const handleSetMemberPostingRole = (value: SourceMemberRole) => {
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
            onChange={handleSetMemberPostingRole}
          />
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Require post approval"
          description="Turn this on to have admins or moderators approve every new post before it's published."
        >
          <SimpleTooltip
            placement={isMobile ? 'bottom' : 'right'}
            interactive
            content={
              <button
                className="flex cursor-pointer"
                type="button"
                onClick={() => setTooltipDismissed(true)}
              >
                <span className="mr-1">
                  Cannot be enabled in moderator only mode
                </span>
                <MiniCloseIcon />
              </button>
            }
            visible={
              !tooltipDismissed &&
              memberPostingRole === SourceMemberRole.Moderator
            }
          >
            <Switch
              className="max-w-min"
              name="moderationRequired"
              inputId="moderationRequired"
              disabled={memberPostingRole === SourceMemberRole.Moderator}
              checked={moderationRequired}
              onToggle={() => setModerationRequired(!moderationRequired)}
            >
              <span>{moderationRequired ? 'On' : 'Off'}</span>
            </Switch>
          </SimpleTooltip>
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Invite others"
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
