import type { ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { EditPreviewTabs, EditPreviewTab } from './EditPreviewTabs';

export interface SideBySideEditLayoutProps {
  /**
   * Edit panel content (~1/3 width on desktop)
   */
  editPanel: ReactNode;
  /**
   * Live preview content (~2/3 width on desktop)
   */
  previewPanel: ReactNode;
  /**
   * Header content (above both panels)
   */
  header?: ReactNode;
  /**
   * Completeness bar or other content between header and panels
   */
  subHeader?: ReactNode;
  /**
   * Additional className for the container
   */
  className?: string;
}

/**
 * Side-by-side editing layout for opportunities.
 *
 * Desktop (laptop+): Shows edit panel (~1/3 width) and preview (~2/3 width) side by side
 * Mobile (< laptop): Shows tab switcher between Edit and Preview modes
 */
export function SideBySideEditLayout({
  editPanel,
  previewPanel,
  header,
  subHeader,
  className,
}: SideBySideEditLayoutProps): ReactElement {
  const isLaptop = useViewSize(ViewSize.Laptop);
  const [activeTab, setActiveTab] = useState<EditPreviewTab>(
    EditPreviewTab.Edit,
  );

  // Desktop layout: side-by-side panels
  if (isLaptop) {
    return (
      <div className={classNames('flex min-h-screen flex-col', className)}>
        {header}
        {subHeader}
        <div className="flex flex-1">
          {/* Edit Panel - 1/3 width */}
          <div className="sticky top-0 h-screen w-1/3 min-w-80 max-w-md overflow-y-auto border-r border-border-subtlest-tertiary bg-background-default">
            {editPanel}
          </div>
          {/* Preview Panel - 2/3 width */}
          <div className="flex-1 overflow-y-auto bg-background-subtle">
            {previewPanel}
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout: tabbed interface
  return (
    <div className={classNames('flex min-h-screen flex-col', className)}>
      {header}
      <EditPreviewTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {subHeader}
      <div className="flex-1">
        {activeTab === EditPreviewTab.Edit ? (
          <div className="bg-background-default">{editPanel}</div>
        ) : (
          <div className="bg-background-subtle">{previewPanel}</div>
        )}
      </div>
    </div>
  );
}

export default SideBySideEditLayout;
