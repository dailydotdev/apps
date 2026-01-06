import type { ReactElement } from 'react';
import React, { useCallback, useMemo } from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../typography/Typography';
import {
  OrganizationIcon,
  UserIcon,
  SlackIcon,
  VIcon,
  ArrowIcon,
} from '../icons';
import { IconSize } from '../Icon';
import { useAuthContext } from '../../contexts/AuthContext';
import { useLazyModal } from '../../hooks/useLazyModal';
import { LazyModal } from '../modals/common/types';
import { fallbackImages } from '../../lib/config';
import { settingsUrl, recruiterUrl } from '../../lib/constants';
import type { Organization } from '../../features/organizations/types';
import Link from '../utilities/Link';
import { anchorDefaultRel } from '../../lib/strings';

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  icon: ReactElement;
  completed: boolean;
  href?: string;
  onClick?: () => void;
};

export type RecruiterSetupChecklistProps = {
  organization?: Organization;
  className?: string;
};

const ChecklistItemRow = ({ item }: { item: ChecklistItem }): ReactElement => {
  const content = (
    <div
      className={classNames(
        'flex cursor-pointer items-center gap-3 rounded-8 border border-border-subtlest-tertiary bg-background-default p-3 transition-colors',
        item.completed
          ? 'border-status-success'
          : 'hover:border-border-subtlest-secondary hover:bg-surface-hover',
      )}
    >
      <div
        className={classNames(
          'flex size-10 shrink-0 items-center justify-center rounded-10',
          item.completed
            ? 'bg-status-success text-white'
            : 'bg-surface-float text-text-tertiary',
        )}
      >
        {item.completed ? <VIcon size={IconSize.Small} /> : item.icon}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Typography
          type={TypographyType.Callout}
          bold
          className={classNames(
            item.completed && 'text-text-disabled line-through',
          )}
        >
          {item.title}
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
          className={classNames(item.completed && 'line-through')}
        >
          {item.description}
        </Typography>
      </div>
      {!item.completed && (
        <ArrowIcon
          size={IconSize.Small}
          className="shrink-0 rotate-90 text-text-tertiary"
        />
      )}
    </div>
  );

  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className="w-full text-left">
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href}>
        <a href={item.href} rel={anchorDefaultRel} className="block">
          {content}
        </a>
      </Link>
    );
  }

  return content;
};

export const RecruiterSetupChecklist = ({
  organization,
  className,
}: RecruiterSetupChecklistProps): ReactElement => {
  const { user } = useAuthContext();
  const { openModal } = useLazyModal();

  // Company profile completion checks
  const isCompanyComplete = useMemo(() => {
    if (!organization) {
      return false;
    }
    return Boolean(
      organization.image &&
        organization.website &&
        organization.description &&
        organization.location,
    );
  }, [organization]);

  // Personal profile completion checks
  const hasVerifiedCompany = useMemo(
    () => Boolean(user?.companies && user.companies.length > 0),
    [user?.companies],
  );
  const hasProfileImage = useMemo(
    () => Boolean(user?.image && user.image !== fallbackImages.avatar),
    [user?.image],
  );
  const hasHeadline = useMemo(() => Boolean(user?.bio), [user?.bio]);
  const isProfileComplete =
    hasVerifiedCompany && hasProfileImage && hasHeadline;

  // Slack connection check
  const hasSlackConnection = Boolean(
    organization?.recruiterSubscriptionFlags?.hasSlackConnection,
  );

  const handleConnectSlack = useCallback(() => {
    if (!user || !organization) {
      return;
    }

    const baseName = organization.name;
    const sanitizedName = baseName
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 80);

    const channelName = `dailydev-${sanitizedName}`;

    openModal({
      type: LazyModal.SlackChannelConfirmation,
      props: {
        email: user.email || '',
        channelName,
        organizationId: organization.id,
      },
    });
  }, [user, organization, openModal]);

  const items: ChecklistItem[] = useMemo(
    () => [
      {
        id: 'company',
        title: 'Complete company profile',
        description:
          'Developers trust companies they can verify. Complete profiles build that trust.',
        icon: <OrganizationIcon size={IconSize.Small} />,
        completed: isCompanyComplete,
        href: organization?.id
          ? `${recruiterUrl}/organizations/${organization.id}`
          : undefined,
      },
      {
        id: 'profile',
        title: 'Verify your identity',
        description:
          'Developers share their real profiles. Earn their trust by doing the same.',
        icon: <UserIcon size={IconSize.Small} />,
        completed: isProfileComplete,
        href: `${settingsUrl}/profile`,
      },
      {
        id: 'slack',
        title: 'Connect on Slack',
        description: 'Direct line to our team. No tickets, real humans.',
        icon: <SlackIcon size={IconSize.Small} />,
        completed: hasSlackConnection,
        onClick: hasSlackConnection ? undefined : handleConnectSlack,
      },
    ],
    [
      isCompanyComplete,
      isProfileComplete,
      hasSlackConnection,
      organization?.id,
      handleConnectSlack,
    ],
  );

  const completedCount = items.filter((item) => item.completed).length;

  return (
    <div
      className={classNames(
        'flex w-full max-w-md flex-col gap-4 rounded-16 border border-border-subtlest-tertiary bg-background-subtle p-4',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Typography type={TypographyType.Body} bold>
          Maximize your response rates
        </Typography>
        <Typography
          type={TypographyType.Caption1}
          color={TypographyColor.Tertiary}
        >
          {completedCount}/{items.length} completed
        </Typography>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
