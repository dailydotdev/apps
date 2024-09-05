import React, { ReactElement, useState } from 'react';
import { SquadSettingsSection } from './SquadSettingsSection';
import { Radio } from '../../fields/Radio';
import { SourceMemberRole } from '../../../graphql/sources';
import { Typography, TypographyType } from '../../typography/Typography';

interface PermissionSectionProps {
  initialMemberPostingRole?: SourceMemberRole;
  initialMemberInviteRole?: SourceMemberRole;
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

export function PermissionSection({
  initialMemberInviteRole,
  initialMemberPostingRole,
}: PermissionSectionProps): ReactElement {
  const [memberPostingRole, setMemberPostingRole] = useState(
    () => initialMemberPostingRole || SourceMemberRole.Member,
  );
  const [memberInviteRole, setMemberInviteRole] = useState(
    () => initialMemberInviteRole || SourceMemberRole.Member,
  );

  return (
    <div className="mt-2 flex flex-col gap-4 rounded-16 border border-border-subtlest-tertiary">
      <Typography
        bold
        type={TypographyType.Body}
        className="flex items-center border-b border-border-subtlest-tertiary p-4"
      >
        🔒 Permissions
      </Typography>
      <span className="flex flex-col gap-6 px-4 py-2 tablet:flex-row">
        <SquadSettingsSection
          title="Post content"
          description="Choose who is allowed to post new content in this Squad."
          className="flex"
        >
          <Radio
            name="memberPostingRole"
            options={memberRoleOptions}
            value={memberPostingRole}
            onChange={(value) =>
              setMemberPostingRole(value as SourceMemberRole)
            }
          />
        </SquadSettingsSection>
        <SquadSettingsSection
          title="Invitation others"
          description="Choose who is allowed to invite new members to this Squad."
        >
          <Radio
            name="memberInviteRole"
            options={memberRoleOptions}
            value={memberInviteRole}
            onChange={(value) => setMemberInviteRole(value as SourceMemberRole)}
          />
        </SquadSettingsSection>
      </span>
    </div>
  );
}
