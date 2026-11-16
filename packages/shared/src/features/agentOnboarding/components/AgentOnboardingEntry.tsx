import type { ReactElement } from 'react';
import React from 'react';
import classNames from 'classnames';
import Link from '../../../components/utilities/Link';
import { useLogContext } from '../../../contexts/LogContext';
import { useConditionalFeature } from '../../../hooks/useConditionalFeature';
import { useViewSize, ViewSize } from '../../../hooks/useViewSize';
import { webappUrl } from '../../../lib/constants';
import { featureAgentOnboardingEntry } from '../../../lib/featureManagement';
import { LogEvent } from '../../../lib/log';

const agentOnboardingUrl = `${webappUrl}agents/onboarding`;

type AgentOnboardingEntryProps = {
  className?: string;
};

// Agents run on a computer, so smaller screens are left out of the experiment.
export const AgentOnboardingEntry = ({
  className,
}: AgentOnboardingEntryProps): ReactElement | null => {
  const { logEvent } = useLogContext();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { value: isEnabled } = useConditionalFeature({
    feature: featureAgentOnboardingEntry,
    shouldEvaluate: isLaptop,
  });

  if (!isLaptop || !isEnabled) {
    return null;
  }

  return (
    <span className={classNames('text-text-tertiary typo-callout', className)}>
      Use a coding agent?{' '}
      <Link href={agentOnboardingUrl} passHref>
        <a
          href={agentOnboardingUrl}
          className="text-text-primary underline underline-offset-4"
          onClick={() =>
            logEvent({ event_name: LogEvent.ClickAgentOnboardingEntry })
          }
        >
          Let it set up daily.dev for you
        </a>
      </Link>
    </span>
  );
};
