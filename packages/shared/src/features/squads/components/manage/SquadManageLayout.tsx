import type { ReactElement, ReactNode } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../../components/utilities/Link';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import {
  ArrowIcon,
  MoveToIcon,
  OpenLinkIcon,
} from '../../../../components/icons';
import { IconSize } from '../../../../components/Icon';
import {
  Typography,
  TypographyColor,
  TypographyTag,
  TypographyType,
} from '../../../../components/typography/Typography';
import { HorizontalSeparator } from '../../../../components/utilities/common';
import { SquadImage } from '../../../../components/squads/SquadImage';
import { useSquadPageContext } from '../../SquadPageContext';
import { hasSquadFeature } from '../../lib/features';
import type { SquadManageGroup } from '../../lib/manage';
import { getSquadManageGroups, squadManageTitles } from '../../lib/manage';
import type { SquadManageSection } from '../../lib/routes';
import { getSquadManageUrl, getSquadUrl } from '../../lib/routes';
import { VerifiedSquadBadge } from '../VerifiedSquad';

const MenuHeader = (): ReactElement => {
  const { squad } = useSquadPageContext();
  const url = getSquadUrl(squad.handle);

  return (
    <Link href={url} passHref>
      <a
        href={url}
        className="flex items-center gap-2 rounded-10 px-1 hover:bg-surface-float"
      >
        <SquadImage {...squad} className="size-8" />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1">
            <Typography
              type={TypographyType.Subhead}
              bold
              truncate
              className="min-w-0"
            >
              {squad.name}
            </Typography>
            {hasSquadFeature(squad, 'verified') && <VerifiedSquadBadge />}
          </span>
          <Typography
            type={TypographyType.Footnote}
            color={TypographyColor.Tertiary}
            truncate
          >
            @{squad.handle}
          </Typography>
        </span>
        <OpenLinkIcon className="text-text-quaternary" size={IconSize.Size16} />
      </a>
    </Link>
  );
};

const ManageMenu = ({
  groups,
  active,
  isLarge = false,
}: {
  groups: SquadManageGroup[];
  active?: SquadManageSection;
  /** The phone list: body type and a chevron per row. */
  isLarge?: boolean;
}): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <nav aria-label="Manage" className="flex flex-col gap-2">
      {groups.map((group, index) => (
        <React.Fragment key={group.title}>
          <section className="flex flex-col">
            <Typography
              bold
              color={TypographyColor.Quaternary}
              type={TypographyType.Footnote}
              className="p-1"
            >
              {group.title}
            </Typography>
            {group.items.map((item) => {
              const isActive = active === item.id;
              const href = getSquadManageUrl(squad.handle, item.id);

              return (
                <Link key={item.id} href={href} passHref>
                  <a
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    className={classNames(
                      'flex h-10 items-center gap-2 rounded-10 px-1 hover:bg-surface-float',
                      isLarge
                        ? 'text-text-secondary typo-body'
                        : 'text-text-tertiary typo-subhead tablet:h-8',
                      isActive && 'bg-theme-active text-text-primary',
                    )}
                  >
                    {React.cloneElement(item.icon, {
                      secondary: isActive,
                      size: isLarge ? IconSize.Small : IconSize.XSmall,
                    })}
                    <span>{item.label}</span>
                    {!!item.badge && (
                      <span className="ml-auto tabular-nums text-text-quaternary typo-footnote">
                        {item.badge}
                      </span>
                    )}
                    {isLarge && (
                      <ArrowIcon
                        size={IconSize.Size16}
                        className={classNames(
                          'rotate-90 text-text-quaternary',
                          !item.badge && 'ml-auto',
                        )}
                      />
                    )}
                  </a>
                </Link>
              );
            })}
          </section>
          {index < groups.length - 1 && <HorizontalSeparator />}
        </React.Fragment>
      ))}
    </nav>
  );
};

interface SquadManagePanelProps {
  title: string;
  backUrl: string;
  backLabel: string;
  /** The back button stays on laptop, where the menu does not lead back. */
  hasLaptopBack?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export const SquadManagePanel = ({
  title,
  backUrl,
  backLabel,
  hasLaptopBack = false,
  action,
  children,
}: SquadManagePanelProps): ReactElement => (
  <>
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border-subtlest-tertiary px-4 tablet:px-6">
      <span className={classNames('flex', !hasLaptopBack && 'laptop:hidden')}>
        <Link href={backUrl} passHref>
          <Button
            tag="a"
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<MoveToIcon className="rotate-180" />}
            aria-label={backLabel}
          />
        </Link>
      </span>
      <Typography
        tag={TypographyTag.H1}
        type={TypographyType.Body}
        bold
        truncate
        className="min-w-0 flex-1 tablet:typo-title3"
      >
        {title}
      </Typography>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {children}
  </>
);

export const SquadManageSectionPanel = ({
  section,
  action,
  children,
}: {
  section: SquadManageSection;
  action?: ReactNode;
  children: ReactNode;
}): ReactElement => {
  const { squad } = useSquadPageContext();

  return (
    <SquadManagePanel
      title={squadManageTitles[section]}
      backUrl={getSquadManageUrl(squad.handle)}
      backLabel="Back to Manage"
      action={action}
    >
      {children}
    </SquadManagePanel>
  );
};

export const SquadManageSaveButton = ({
  formId,
  isLoading,
}: {
  formId: string;
  isLoading: boolean;
}): ReactElement => (
  <Button
    type="submit"
    form={formId}
    variant={ButtonVariant.Primary}
    size={ButtonSize.Small}
    loading={isLoading}
    disabled={isLoading}
  >
    Save
  </Button>
);

interface SquadManageLayoutProps {
  section?: SquadManageSection;
  /** The open section, or the first one the viewer may see. */
  children: ReactNode;
}

// The profile's settings pattern: on laptop a grouped menu beside the open
// section; on a phone the menu is a list and each section is its own page.
export const SquadManageLayout = ({
  section,
  children,
}: SquadManageLayoutProps): ReactElement => {
  const { squad, viewer } = useSquadPageContext();
  const groups = getSquadManageGroups(squad, viewer);
  const squadUrl = getSquadUrl(squad.handle);

  return (
    <div className="mx-auto flex w-full gap-4 laptop:max-w-5xl laptop:p-4 laptop:pb-6 laptopL:max-w-6xl">
      <aside className="hidden w-64 shrink-0 flex-col gap-2 self-start rounded-16 border border-border-subtlest-tertiary p-2 laptop:flex">
        <MenuHeader />
        <HorizontalSeparator />
        <ManageMenu groups={groups} active={section} />
      </aside>
      <main
        className={classNames(
          'min-w-0 flex-1 flex-col border-border-subtlest-tertiary laptop:flex laptop:rounded-16 laptop:border',
          section ? 'flex' : 'hidden',
        )}
      >
        {children}
      </main>
      {!section && (
        <div className="flex min-w-0 flex-1 flex-col laptop:hidden">
          <SquadManagePanel
            title={`Manage ${squad.name}`}
            backUrl={squadUrl}
            backLabel={`Back to ${squad.name}`}
            hasLaptopBack
          >
            <div className="flex flex-col gap-2 p-4">
              <MenuHeader />
              <HorizontalSeparator />
              <ManageMenu groups={groups} isLarge />
            </div>
          </SquadManagePanel>
        </div>
      )}
    </div>
  );
};
