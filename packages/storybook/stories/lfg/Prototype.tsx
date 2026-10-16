import type { ReactElement } from 'react';
import React, { useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { RefreshIcon } from '@dailydotdev/shared/src/components/icons/Refresh';
import { VIcon } from '@dailydotdev/shared/src/components/icons/V';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import ExtensionProviders from '../extension/_providers';
import type { ProtoApi, ProtoState, Scenario } from './store';
import { ProtoProvider, useProto } from './store';
import { AppShell } from './shell';
import { BoardScreen } from './screens/Board';
import { PrelaunchBoard } from './screens/Prelaunch';
import { PostScreen } from './screens/Post';
import { CreateScreen } from './screens/Create';
import { MessagesScreen } from './screens/Messages';
import { ActivityScreen } from './screens/Activity';
import { ReachOutModal } from './screens/ReachOut';
import { DiscussionScreen } from './screens/Discussion';
import { ProfileScreen } from './screens/Profile';

export interface FlowStep {
  label: string;
  done: (state: ProtoState) => boolean;
}

export interface FlowAction {
  label: string;
  show: (state: ProtoState) => boolean;
  run: (api: ProtoApi) => void;
}

export interface Flow {
  title: string;
  scenario: Scenario;
  steps: FlowStep[];
  actions?: FlowAction[];
}

export const happened =
  (...events: string[]) =>
  (state: ProtoState): boolean =>
    events.some((event) => state.events.includes(event));

const FlowGuide = ({
  flow,
  onRestart,
}: {
  flow: Flow;
  onRestart: () => void;
}): ReactElement => {
  const api = useProto();
  const { state } = api;
  const current = flow.steps.findIndex((step) => !step.done(state));
  const isComplete = current === -1;
  const isFree = flow.steps.length === 0;
  const actions = (flow.actions ?? []).filter((action) => action.show(state));

  return (
    // Above the modal overlay, so its buttons work while a modal is open.
    <div className="relative z-max flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-border-subtlest-tertiary bg-background-subtle px-4 py-2">
      <Typography
        type={TypographyType.Footnote}
        bold
        className="hidden shrink-0 tablet:block"
      >
        {flow.title}
      </Typography>
      {isFree && (
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
          className="min-w-0 flex-1 truncate"
        >
          Everything is wired: your post with responses, a sent request and a
          risky chat.
        </Typography>
      )}
      <ol
        className={classNames(
          'no-scrollbar hidden min-w-0 flex-1 items-center gap-3 overflow-x-auto',
          !isFree && 'laptop:flex',
        )}
      >
        {flow.steps.map((step, index) => {
          const isDone = isComplete || index < current;
          const isCurrent = index === current;
          return (
            <li
              key={step.label}
              className={classNames(
                'flex shrink-0 items-center gap-1.5 typo-footnote',
                isCurrent && 'font-bold text-text-primary',
                isDone && 'text-text-tertiary',
                !isDone && !isCurrent && 'text-text-quaternary',
              )}
            >
              <span
                className={classNames(
                  'flex size-5 items-center justify-center rounded-6 typo-caption2',
                  isDone &&
                    'bg-action-upvote-float text-accent-avocado-default',
                  isCurrent && 'bg-surface-invert text-surface-primary',
                  !isDone && !isCurrent && 'bg-surface-float',
                )}
              >
                {isDone ? <VIcon size={IconSize.XXSmall} /> : index + 1}
              </span>
              {step.label}
            </li>
          );
        })}
      </ol>
      <Typography
        type={TypographyType.Footnote}
        color={TypographyColor.Secondary}
        className={classNames(
          'min-w-0 flex-1 truncate laptop:hidden',
          isFree && 'hidden',
        )}
      >
        {isComplete
          ? 'All steps done'
          : `${current + 1}/${flow.steps.length}: ${flow.steps[current].label}`}
      </Typography>
      <div className="flex shrink-0 items-center gap-2">
        {actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            onClick={() => action.run(api)}
          >
            {action.label}
          </Button>
        ))}
        <Button
          type="button"
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.XSmall}
          icon={<RefreshIcon />}
          onClick={onRestart}
        >
          Restart
        </Button>
      </div>
    </div>
  );
};

const Screens = (): ReactElement => {
  const { state } = useProto();
  const { route } = state;

  if (route.name === 'messages') {
    return (
      <AppShell scrolls={false} hideBar={!!route.peerId}>
        <MessagesScreen tab={route.tab} peerId={route.peerId} />
      </AppShell>
    );
  }

  return (
    <AppShell
      hideBar={route.name === 'create'}
      routeKey={JSON.stringify(route)}
    >
      {route.name === 'board' &&
        (state.phase === 'prelaunch' ? <PrelaunchBoard /> : <BoardScreen />)}
      {route.name === 'post' && <PostScreen key={route.id} id={route.id} />}
      {route.name === 'create' && <CreateScreen />}
      {route.name === 'activity' && <ActivityScreen />}
      {route.name === 'discussion' && <DiscussionScreen />}
      {route.name === 'profile' && (
        <ProfileScreen key={route.userId} userId={route.userId} />
      )}
    </AppShell>
  );
};

export const Prototype = ({ flow }: { flow: Flow }): ReactElement => {
  const [run, setRun] = useState(0);

  return (
    <ExtensionProviders key={run}>
      <ProtoProvider scenario={flow.scenario}>
        <div
          id="__next"
          className="flex h-screen flex-col overflow-hidden bg-background-default text-text-primary"
        >
          <FlowGuide
            flow={flow}
            onRestart={() => setRun((value) => value + 1)}
          />
          <Screens />
        </div>
        <ReachOutModal />
        <Toast autoDismissNotifications />
      </ProtoProvider>
    </ExtensionProviders>
  );
};
