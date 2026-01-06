import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import {
  Typography,
  TypographyType,
  TypographyColor,
} from '../../typography/Typography';
import { EditIcon, EyeIcon } from '../../icons';
import { IconSize } from '../../Icon';

export enum EditPreviewTab {
  Edit = 'edit',
  Preview = 'preview',
}

export interface EditPreviewTabsProps {
  activeTab: EditPreviewTab;
  onTabChange: (tab: EditPreviewTab) => void;
  className?: string;
}

/**
 * Mobile tab switcher for toggling between Edit and Preview modes.
 */
export function EditPreviewTabs({
  activeTab,
  onTabChange,
  className,
}: EditPreviewTabsProps): ReactElement {
  const tabs = [
    {
      id: EditPreviewTab.Edit,
      label: 'Edit',
      icon: EditIcon,
    },
    {
      id: EditPreviewTab.Preview,
      label: 'Preview',
      icon: EyeIcon,
    },
  ];

  return (
    <div
      className={classNames(
        'z-10 sticky top-0 flex border-b border-border-subtlest-tertiary bg-background-default',
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={classNames(
              'flex flex-1 items-center justify-center gap-2 px-4 py-3 transition-colors',
              isActive
                ? 'border-b-2 border-accent-cabbage-default text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            <Icon
              size={IconSize.Small}
              className={isActive ? 'text-accent-cabbage-default' : undefined}
            />
            <Typography
              type={TypographyType.Callout}
              color={
                isActive ? TypographyColor.Primary : TypographyColor.Tertiary
              }
              bold={isActive}
            >
              {tab.label}
            </Typography>
          </button>
        );
      })}
    </div>
  );
}

export default EditPreviewTabs;
