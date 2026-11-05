import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import {
  SquadPlan,
  squadPlanDetails,
} from '@dailydotdev/shared/src/features/squads/lib/plans';
import { ProgressContext, StepId } from './shell';
import { ManageProposed } from './manage';
import { UpsellOnPage } from './upsellPage';
import type { AccountView, ExistingPage } from './screens';
import {
  AccountScreen,
  ActivatingScreen,
  CompanyScreen,
  PlanScreen,
  SetupScreen,
} from './screens';

export enum Stage {
  Upsell,
  Manage,
  Account,
  Company,
  Plan,
  Activating,
  Setup,
}

// The new flow, end to end. Nothing is saved and nothing is charged.
export const Flow = ({
  start = Stage.Account,
  existing,
  initialPlan = SquadPlan.Starter,
  initialCompany = 'Acme',
  accountView,
}: {
  /** Which account screen this person starts on. */
  accountView?: AccountView;
  /** Where this use case joins the flow. */
  start?: Stage;
  /** Pages this person already runs. */
  existing?: ExistingPage[];
  initialPlan?: SquadPlan;
  initialCompany?: string;
}): ReactElement => {
  const [stage, setStage] = useState(start);
  const [company, setCompany] = useState(initialCompany);
  const [plan, setPlan] = useState(initialPlan);

  useEffect(() => {
    globalThis.scrollTo?.({ top: 0 });

    if (stage !== Stage.Activating) {
      return undefined;
    }

    const timeout = setTimeout(() => setStage(Stage.Setup), 3600);

    return () => clearTimeout(timeout);
  }, [stage]);

  // Back to the company page from the plan. Nothing goes back after paying.
  const progress = {
    answers: {
      [StepId.Company]: company,
      [StepId.Plan]: squadPlanDetails[plan].title,
    },
    onSelect: () => setStage(Stage.Company),
    canSelect: (step: StepId) =>
      stage === Stage.Plan && step === StepId.Company,
  };

  const screen = (): ReactElement => {
    switch (stage) {
      case Stage.Upsell:
        return <UpsellOnPage onSeePlans={() => setStage(Stage.Plan)} />;
      case Stage.Manage:
        return (
          <div className="min-h-screen bg-background-default">
            <ManageProposed
              onChoose={(next) => {
                setPlan(next);
                setStage(Stage.Plan);
              }}
            />
          </div>
        );
      case Stage.Account:
        return (
          <AccountScreen
            initialView={accountView}
            onNext={() => setStage(Stage.Company)}
          />
        );
      case Stage.Company:
        return (
          <CompanyScreen
            existing={existing}
            initialName={company === 'Acme' ? '' : company}
            onNext={(name) => {
              setCompany(name);
              setStage(Stage.Plan);
            }}
          />
        );
      case Stage.Plan:
        return (
          <PlanScreen
            company={company}
            initialPlan={plan}
            onPaid={(next) => {
              setPlan(next);
              setStage(Stage.Activating);
            }}
          />
        );
      case Stage.Activating:
        return <ActivatingScreen company={company} plan={plan} />;
      default:
        return <SetupScreen company={company} plan={plan} />;
    }
  };

  return (
    <ProgressContext.Provider value={progress}>
      {screen()}
    </ProgressContext.Provider>
  );
};
