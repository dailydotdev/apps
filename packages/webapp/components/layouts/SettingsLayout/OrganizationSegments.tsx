import type { ReactElement } from 'react';
import React from 'react';
import { useRouter } from 'next/router';
import {
  Segments,
  ShellRow,
} from '@dailydotdev/shared/src/components/shell/ShellRow';
import { settingsUrl } from '@dailydotdev/shared/src/lib/constants';

const sections = ['General', 'Members', 'Billing'];

// An organization's settings are one place with three views on a phone.
export function OrganizationSegments({
  active,
}: {
  active: string;
}): ReactElement {
  const { query } = useRouter();

  return (
    <ShellRow>
      <Segments
        items={sections.map((section) => ({
          key: section,
          label: section,
          href: `${settingsUrl}/organization/${
            query.orgId
          }/${section.toLowerCase()}`,
          active: section === active,
          replace: true,
        }))}
      />
    </ShellRow>
  );
}
