import type { ReactElement } from 'react';
import React, { useState } from 'react';
import type ReactModal from 'react-modal';
import { Modal } from '../../components/modals/common/Modal';
import { ModalKind, ModalSize } from '../../components/modals/common/types';
import { ModalHeader } from '../../components/modals/common/ModalHeader';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../components/typography/Typography';
import { Switch } from '../../components/fields/Switch';

interface DigestOption {
  id: string;
  topic: string;
  description: string;
}

const DIGEST_CATALOG: DigestOption[] = [
  {
    id: 'ai-agents',
    topic: 'AI & Agents',
    description: 'Model releases, agent frameworks, prompting research.',
  },
  {
    id: 'databases',
    topic: 'Databases',
    description: 'Postgres, distributed storage, query engines.',
  },
  {
    id: 'web-development',
    topic: 'Web Development',
    description: 'Frameworks, browser APIs, performance.',
  },
  {
    id: 'backend',
    topic: 'Backend',
    description: 'Servers, APIs, runtimes, infra patterns.',
  },
  {
    id: 'devops',
    topic: 'DevOps & Infra',
    description: 'CI/CD, Kubernetes, observability, cloud spend.',
  },
  {
    id: 'security',
    topic: 'Security',
    description: 'CVEs, supply chain, auth, threat research.',
  },
  {
    id: 'mobile',
    topic: 'Mobile',
    description: 'iOS, Android, cross-platform, app store changes.',
  },
  {
    id: 'data-ml',
    topic: 'Data & ML',
    description: 'Pipelines, training infra, evaluation, benchmarks.',
  },
  {
    id: 'languages',
    topic: 'Languages & Compilers',
    description: 'Rust, Go, TS, language design, compiler advances.',
  },
  {
    id: 'open-source',
    topic: 'Open Source',
    description: 'Governance, licensing, maintainer drama, big releases.',
  },
  {
    id: 'career',
    topic: 'Career & Industry',
    description: 'Hiring trends, layoffs, salary data, engineering culture.',
  },
  {
    id: 'tools',
    topic: 'Developer Tools',
    description: 'Editors, terminals, CLI utilities, productivity setups.',
  },
];

const DEFAULT_SUBSCRIBED = new Set([
  'ai-agents',
  'databases',
  'web-development',
  'backend',
]);

interface HeadlinesSettingsModalProps
  extends Omit<ReactModal.Props, 'children'> {
  onRequestClose: () => void;
}

export const HeadlinesSettingsModal = ({
  onRequestClose,
  ...props
}: HeadlinesSettingsModalProps): ReactElement => {
  const [subscribed, setSubscribed] = useState<Set<string>>(
    () => new Set(DEFAULT_SUBSCRIBED),
  );

  const toggle = (id: string): void => {
    setSubscribed((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Modal
      kind={ModalKind.FlexibleCenter}
      size={ModalSize.Medium}
      onRequestClose={onRequestClose}
      isDrawerOnMobile
      {...props}
    >
      <ModalHeader title="Manage Headlines" />
      <div className="px-4 pb-3 pt-4">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          Pick which topical digests show up in your Headlines section. Changes
          apply to tomorrow&apos;s brief.
        </Typography>
      </div>
      <ul className="flex flex-col divide-y divide-border-subtlest-quaternary border-t border-border-subtlest-quaternary">
        {DIGEST_CATALOG.map((digest) => {
          const isOn = subscribed.has(digest.id);
          const inputId = `headline-toggle-${digest.id}`;
          return (
            <li
              key={digest.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <Typography
                  type={TypographyType.Callout}
                  color={TypographyColor.Primary}
                  bold
                >
                  {digest.topic}
                </Typography>
                <Typography
                  type={TypographyType.Footnote}
                  color={TypographyColor.Tertiary}
                  className="!leading-snug"
                >
                  {digest.description}
                </Typography>
              </div>
              <Switch
                inputId={inputId}
                name={inputId}
                checked={isOn}
                onToggle={() => toggle(digest.id)}
                aria-label={`${isOn ? 'Unsubscribe from' : 'Subscribe to'} ${
                  digest.topic
                }`}
              />
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between gap-4 border-t border-border-subtlest-quaternary px-4 py-3">
        <Typography
          type={TypographyType.Footnote}
          color={TypographyColor.Tertiary}
        >
          {subscribed.size} subscribed
        </Typography>
      </div>
    </Modal>
  );
};
