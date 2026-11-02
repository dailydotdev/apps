import type { ComponentType, ReactElement, ReactNode } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import { ArrowIcon, TourIcon } from '@dailydotdev/shared/src/components/icons';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { introQuests, mockUser } from '../data';
import { ProgressRing } from '../kit';
import { useSim } from '../sim';
import type { Frame } from '../finalists/kit';
import { ClassicLayout, RailLayout } from './layouts';

// Five homes for the button that opens setup. Each one is a real, clickable
// trigger in the layout it belongs to, and opens whichever finalist is picked
// in the controls. None of them shake: the progress ring is the reminder, and
// a dot appears only when there is a reward waiting to be claimed.

export type PanelComponent = ComponentType<{
  frame?: Frame;
  onClose?: () => void;
}>;

export type Layout = 'classic' | 'rail';

interface EntryProps {
  Panel: PanelComponent;
  layout?: Layout;
}

const useTrigger = () => {
  const [open, setOpen] = useState(true);

  return {
    open,
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
  };
};

const ClaimDot = (): ReactElement | null => {
  const { claimableCount } = useSim();

  if (!claimableCount) {
    return null;
  }

  return (
    <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-max border-2 border-background-default bg-accent-avocado-default" />
  );
};

const PanelSlot = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}): ReactElement => (
  <div className={classNames('absolute z-3 flex flex-col', className)}>
    {children}
  </div>
);

const Count = (): ReactElement => {
  const { doneCount } = useSim();

  return (
    <span className="iq-tabular">
      {doneCount}/{introQuests.length}
    </span>
  );
};

const ChipTrigger = ({
  open,
  onClick,
  label,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={open}
    className={classNames(
      'iq-press relative flex h-10 items-center gap-2 rounded-12 pl-2 pr-3 font-bold text-text-primary typo-callout',
      open ? 'bg-surface-hover' : 'bg-surface-float hover:bg-surface-hover',
    )}
  >
    <ProgressRing size={24} />
    {label}
    <Count />
    <ClaimDot />
  </button>
);

export const HeaderEntry = ({ Panel }: EntryProps): ReactElement => {
  const { open, toggle, close } = useTrigger();

  return (
    <ClassicLayout
      headerRight={<ChipTrigger open={open} onClick={toggle} label="Setup" />}
      overlay={
        open && (
          <PanelSlot className="right-4 top-16 max-h-[calc(100%-5rem)]">
            <Panel frame="panel" onClose={close} />
          </PanelSlot>
        )
      }
    />
  );
};

export const StripEntry = ({ Panel }: EntryProps): ReactElement => {
  const { open, toggle, close } = useTrigger();

  return (
    <RailLayout
      stripRight={
        <ChipTrigger open={open} onClick={toggle} label="Set up daily.dev" />
      }
      overlay={
        open && (
          <PanelSlot className="right-6 top-16 max-h-[calc(100%-5rem)]">
            <Panel frame="panel" onClose={close} />
          </PanelSlot>
        )
      }
    />
  );
};

export const RailEntry = ({ Panel }: EntryProps): ReactElement => {
  const { open, toggle, close } = useTrigger();
  const { doneCount } = useSim();

  return (
    <RailLayout
      railExtra={
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label="Finish setting up daily.dev"
          title="Finish setting up"
          className={classNames(
            'iq-press relative mb-1 flex size-10 items-center justify-center rounded-12',
            open ? 'bg-background-default' : 'hover:bg-surface-hover',
          )}
        >
          <span className="absolute inset-0 flex items-center justify-center">
            <ProgressRing size={36} />
          </span>
          <TourIcon size={IconSize.Small} className="text-text-primary" />
          <span className="iq-tabular absolute -bottom-1 -right-1 rounded-max bg-text-primary px-1 font-bold text-surface-invert typo-caption2">
            {introQuests.length - doneCount}
          </span>
          <ClaimDot />
        </button>
      }
      overlay={
        open && (
          <PanelSlot className="bottom-4 left-[4.5rem] max-h-[calc(100%-2rem)]">
            <Panel frame="panel" onClose={close} />
          </PanelSlot>
        )
      }
    />
  );
};

export const FloatingEntry = ({
  Panel,
  layout = 'rail',
}: EntryProps): ReactElement => {
  const { open, toggle, close } = useTrigger();
  const sim = useSim();
  const overlay = (
    <div className="absolute bottom-6 right-6 z-3 flex max-h-[calc(100%-3rem)] flex-col items-end gap-3">
      {open && (
        <div className="flex min-h-0 shrink flex-col">
          <Panel frame="panel" onClose={close} />
        </div>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="iq-press iq-elevated relative flex h-12 shrink-0 items-center gap-2 rounded-max border border-border-subtlest-tertiary bg-background-popover pl-2 pr-4 font-bold text-text-primary typo-callout"
      >
        <ProgressRing size={32} />
        Set up daily.dev
        <span className="text-text-tertiary">
          <Count />
        </span>
        <ArrowIcon
          size={IconSize.Size16}
          className={classNames(
            'transition-transform duration-200',
            open ? 'rotate-180' : 'rotate-0',
          )}
        />
        {sim.claimableCount > 0 && <ClaimDot />}
      </button>
    </div>
  );

  return layout === 'classic' ? (
    <ClassicLayout overlay={overlay} />
  ) : (
    <RailLayout overlay={overlay} />
  );
};

const RingedAvatar = ({
  onClick,
  open,
}: {
  onClick: () => void;
  open: boolean;
}): ReactElement => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={open}
    aria-label="Your profile and setup"
    className="iq-press relative flex size-10 items-center justify-center"
  >
    <span className="absolute inset-0 flex items-center justify-center">
      <ProgressRing size={40} />
    </span>
    <img
      src={mockUser.image}
      alt=""
      className="size-7 rounded-max object-cover"
    />
    <ClaimDot />
  </button>
);

const AvatarMenu = ({
  onOpenSetup,
  className,
}: {
  onOpenSetup: () => void;
  className: string;
}): ReactElement => {
  const sim = useSim();
  const left = introQuests.length - sim.doneCount;

  return (
    <div
      className={classNames(
        'iq-rise iq-elevated absolute z-3 flex w-64 flex-col gap-1 rounded-16 border border-border-subtlest-tertiary bg-background-popover p-2',
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2 py-2">
        <img
          src={mockUser.image}
          alt=""
          className="size-8 rounded-10 object-cover"
        />
        <div>
          <p className="font-bold text-text-primary typo-callout">
            {mockUser.name}
          </p>
          <p className="text-text-tertiary typo-caption1">@maya</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenSetup}
        className="iq-press flex items-center gap-3 rounded-12 bg-surface-float p-3 text-left hover:bg-surface-hover"
      >
        <ProgressRing size={32} />
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-text-primary typo-footnote">
            Finish setting up
          </span>
          <span className="block text-text-tertiary typo-caption1">
            {left} {left === 1 ? 'step' : 'steps'} left
          </span>
        </span>
        <ArrowIcon
          size={IconSize.Size16}
          className="rotate-90 text-text-tertiary"
        />
      </button>
      {['Profile', 'Settings', 'Log out'].map((item) => (
        <span
          key={item}
          className="flex h-9 items-center rounded-10 px-2 text-text-secondary typo-callout"
        >
          {item}
        </span>
      ))}
    </div>
  );
};

export const AvatarEntry = ({
  Panel,
  layout = 'classic',
}: EntryProps): ReactElement => {
  const [state, setState] = useState<'closed' | 'menu' | 'panel'>('menu');
  const avatar = (
    <RingedAvatar
      open={state !== 'closed'}
      onClick={() =>
        setState((value) => (value === 'closed' ? 'menu' : 'closed'))
      }
    />
  );
  const isRail = layout === 'rail';
  const overlay = (
    <>
      {state === 'menu' && (
        <AvatarMenu
          onOpenSetup={() => setState('panel')}
          className={isRail ? 'left-[4.5rem] top-[19rem]' : 'right-4 top-16'}
        />
      )}
      {state === 'panel' && (
        <PanelSlot
          className={
            isRail
              ? 'left-[4.5rem] top-6 max-h-[calc(100%-3rem)]'
              : 'right-4 top-16 max-h-[calc(100%-5rem)]'
          }
        >
          <Panel frame="panel" onClose={() => setState('closed')} />
        </PanelSlot>
      )}
    </>
  );

  return isRail ? (
    <RailLayout avatar={avatar} overlay={overlay} />
  ) : (
    <ClassicLayout avatar={avatar} overlay={overlay} />
  );
};
