import React, { ReactElement } from 'react';
import { FeaturesData } from '../../contexts/FeaturesContext';
import { ListIcon, SidebarMenuItem } from './common';
import { Section, SectionCommonProps } from './Section';
import SquadIcon from '../icons/Squad';

interface SquadSectionProps
  extends SectionCommonProps,
    Pick<FeaturesData, 'popularFeedCopy'> {
  squadButton: string;
  squadForm: string;
  isItemsButton?: boolean;
  onSquadClick: () => void;
}

export function SquadSection({
  isItemsButton,
  popularFeedCopy,
  squadButton,
  squadForm,
  onSquadClick,
  ...defaultRenderSectionProps
}: SquadSectionProps): ReactElement {
  const squadMenuItems: SidebarMenuItem[] = [
    {
      icon: () => <ListIcon Icon={() => <SquadIcon secondary />} />,
      title: squadButton,
      path: squadForm,
      className: { text: 'text-theme-status-cabbage' },
      action: onSquadClick,
    },
  ];

  return (
    <Section
      {...defaultRenderSectionProps}
      title="Squad"
      items={squadMenuItems}
      isItemsButton={isItemsButton}
    />
  );
}
