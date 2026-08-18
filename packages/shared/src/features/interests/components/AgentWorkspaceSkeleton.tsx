import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import { FlexCol, FlexRow } from '../../../components/utilities';
import { ElementPlaceholder } from '../../../components/ElementPlaceholder';
import { useAgentShellHeight } from '../shell';
import { composerBar, composerColumn, composerFrame } from './AgentComposer';

const Block = ({ className }: { className: string }): ReactElement => (
  <ElementPlaceholder
    className={classNames('agent-skeleton rounded-8', className)}
  />
);

export const AgentWorkspaceSkeleton = ({
  isStandalone,
}: {
  isStandalone?: boolean;
}): ReactElement => {
  const shellHeight = useAgentShellHeight(isStandalone);

  return (
    <FlexCol
      className={classNames('w-full overflow-hidden', shellHeight)}
      aria-busy
      aria-label="Loading the agent"
    >
      <FlexRow className="h-12 shrink-0 items-center gap-2 px-3 tablet:px-4">
        <Block className="size-8 rounded-10" />
        <Block className="size-8 rounded-12" />
        <Block className="h-4 w-40" />
        <span className="flex-1" />
        <Block className="size-8 rounded-10" />
        <Block className="size-8 rounded-10" />
      </FlexRow>

      <div className="min-h-0 flex-1 overflow-hidden px-5 tablet:px-8 laptop:px-10">
        {/* Padding kept in sync with the transcript's, or the page shifts when
            the real one lands. */}
        <FlexCol className="mx-auto w-full max-w-[45rem] gap-8 pb-14 pt-6">
          <FlexCol className="gap-2 border-b border-border-subtlest-quaternary pb-4">
            <Block className="h-3 w-72 max-w-full" />
          </FlexCol>

          <FlexRow className="justify-end">
            <Block className="h-10 w-3/5 rounded-12" />
          </FlexRow>

          <FlexCol className="gap-2.5">
            <Block className="h-3.5 w-full" />
            <Block className="h-3.5 w-11/12" />
            <Block className="h-3.5 w-2/3" />
          </FlexCol>

          <Block className="h-16 w-full rounded-12" />

          <FlexCol className="gap-2.5">
            <Block className="h-3.5 w-5/6" />
            <Block className="h-3.5 w-1/2" />
          </FlexCol>
        </FlexCol>
      </div>

      <div className={composerBar}>
        <div className={classNames(composerColumn, composerFrame, 'flex')}>
          {/* `w-full` because the composer frame centres its children. */}
          <span className="flex w-full items-center">
            <Block className="h-4 w-48" />
          </span>
        </div>
      </div>
    </FlexCol>
  );
};
