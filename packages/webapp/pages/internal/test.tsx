import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import type { NextSeoProps } from 'next-seo';
import type { GetServerSideProps } from 'next';
import classNames from 'classnames';
import {
  pageBorders,
  pageContainerClassNames,
} from '@dailydotdev/shared/src/components/utilities';
import { getLayout as getFooterNavBarLayout } from '../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../components/layouts/MainLayout';

interface ServerInfo {
  headers: Record<string, string>;
}

interface ClientInfo {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  cookieEnabled: boolean;
  doNotTrack: string | null;
  hardwareConcurrency: number | null;
  maxTouchPoints: number | null;
  vendor: string;
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  colorDepth: number;
  pixelRatio: number;
  viewportWidth: number;
  viewportHeight: number;
  timezone: string;
  timezoneOffset: number;
  online: boolean;
  connection: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } | null;
}

type TestPageProps = {
  serverInfo: ServerInfo;
};

export const getServerSideProps: GetServerSideProps<TestPageProps> = async ({
  req,
}) => {
  const headers: Record<string, string> = {};
  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers[key] = value;
    } else if (Array.isArray(value)) {
      headers[key] = value.join(', ');
    }
  });

  return {
    props: {
      serverInfo: { headers },
    },
  };
};

function getClientInfo(): ClientInfo {
  const nav = navigator;
  const conn = (nav as unknown as Record<string, unknown>).connection as
    | Record<string, unknown>
    | undefined;

  return {
    userAgent: nav.userAgent,
    platform: nav.platform,
    language: nav.language,
    languages: [...nav.languages],
    cookieEnabled: nav.cookieEnabled,
    doNotTrack: nav.doNotTrack,
    hardwareConcurrency: nav.hardwareConcurrency ?? null,
    maxTouchPoints: nav.maxTouchPoints ?? null,
    vendor: nav.vendor,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    screenAvailWidth: window.screen.availWidth,
    screenAvailHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    online: nav.onLine,
    connection: conn
      ? {
          effectiveType: conn.effectiveType as string | undefined,
          downlink: conn.downlink as number | undefined,
          rtt: conn.rtt as number | undefined,
          saveData: conn.saveData as boolean | undefined,
        }
      : null,
  };
}

const sectionClass =
  'rounded-16 border border-border-subtlest-tertiary bg-surface-float p-4';
const headingClass = 'mb-3 font-bold typo-title3';
const tableClass = 'w-full text-left typo-callout';
const cellClass = 'border-b border-border-subtlest-tertiary px-3 py-2';

function InfoTable({
  data,
}: {
  data: Record<string, string | number | boolean | null>;
}): ReactElement {
  return (
    <table className={tableClass}>
      <thead>
        <tr>
          <th className={classNames(cellClass, 'font-bold text-text-tertiary')}>
            Property
          </th>
          <th className={classNames(cellClass, 'font-bold text-text-tertiary')}>
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, value]) => (
          <tr key={key}>
            <td
              className={classNames(cellClass, 'font-bold text-text-secondary')}
            >
              {key}
            </td>
            <td
              className={classNames(cellClass, 'break-all text-text-primary')}
            >
              {String(value ?? 'N/A')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TestPage = ({ serverInfo }: TestPageProps): ReactElement => {
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);

  useEffect(() => {
    setClientInfo(getClientInfo());
  }, []);

  return (
    <main
      className={classNames(
        pageBorders,
        pageContainerClassNames,
        'flex flex-col gap-6 p-6 pb-12',
      )}
    >
      <h1 className="font-bold typo-title1">Client Test Page</h1>
      <p className="text-text-tertiary typo-body">
        Diagnostic page showing all available client and server information.
      </p>

      {clientInfo && (
        <>
          <section className={sectionClass}>
            <h2 className={headingClass}>Browser</h2>
            <InfoTable
              data={{
                'User Agent': clientInfo.userAgent,
                Platform: clientInfo.platform,
                Vendor: clientInfo.vendor,
                Language: clientInfo.language,
                Languages: clientInfo.languages.join(', '),
                'Cookies Enabled': clientInfo.cookieEnabled,
                'Do Not Track': clientInfo.doNotTrack,
                Online: clientInfo.online,
              }}
            />
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>Screen & Viewport</h2>
            <InfoTable
              data={{
                'Screen Resolution': `${clientInfo.screenWidth}x${clientInfo.screenHeight}`,
                'Available Screen': `${clientInfo.screenAvailWidth}x${clientInfo.screenAvailHeight}`,
                'Viewport Size': `${clientInfo.viewportWidth}x${clientInfo.viewportHeight}`,
                'Pixel Ratio': clientInfo.pixelRatio,
                'Color Depth': clientInfo.colorDepth,
                'Max Touch Points': clientInfo.maxTouchPoints,
              }}
            />
          </section>

          <section className={sectionClass}>
            <h2 className={headingClass}>System</h2>
            <InfoTable
              data={{
                Timezone: clientInfo.timezone,
                'Timezone Offset (min)': clientInfo.timezoneOffset,
                'Hardware Concurrency': clientInfo.hardwareConcurrency,
              }}
            />
          </section>

          {clientInfo.connection && (
            <section className={sectionClass}>
              <h2 className={headingClass}>Connection</h2>
              <InfoTable
                data={{
                  'Effective Type':
                    clientInfo.connection.effectiveType ?? 'N/A',
                  'Downlink (Mbps)': clientInfo.connection.downlink ?? 'N/A',
                  'RTT (ms)': clientInfo.connection.rtt ?? 'N/A',
                  'Save Data': clientInfo.connection.saveData ?? 'N/A',
                }}
              />
            </section>
          )}
        </>
      )}

      <section className={sectionClass}>
        <h2 className={headingClass}>Request Headers (Server-Side)</h2>
        <InfoTable
          data={
            serverInfo.headers as Record<
              string,
              string | number | boolean | null
            >
          }
        />
      </section>
    </main>
  );
};

const seo: NextSeoProps = {
  title: 'Test Page',
  noindex: true,
  nofollow: true,
};

const getTestPageLayout: typeof getLayout = (...props) =>
  getFooterNavBarLayout(getLayout(...props));

TestPage.getLayout = getTestPageLayout;
TestPage.layoutProps = { seo, screenCentered: false };

export default TestPage;
