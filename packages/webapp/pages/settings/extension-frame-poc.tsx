import type { ReactElement } from 'react';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ExtensionSiteEmbed } from '@dailydotdev/shared/src/features/extensionEmbed/ExtensionSiteEmbed';
import type { UseExtensionSiteEmbedResult } from '@dailydotdev/shared/src/features/extensionEmbed/useExtensionSiteEmbed';

const defaultTarget = 'https://example.com';

const sanitizeQueryValue = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? '' : value ?? '';

const getStatusText = (state: UseExtensionSiteEmbedResult): string => {
  if (state.error) {
    return state.error;
  }

  if (state.status === 'permission-required') {
    return 'Approve the permission prompt in the extension frame to continue.';
  }

  if (state.status === 'reloading-extension') {
    return 'Permissions granted. Waiting for the extension to reload.';
  }

  if (state.status === 'preparing-tab') {
    return 'Permissions granted. The extension is preparing this tab for embedding.';
  }

  if (state.status === 'ready') {
    return 'The target is embedded directly by this page.';
  }

  return 'Waiting for the extension frame to load.';
};

export default function ExtensionFramePocPage(): ReactElement {
  const router = useRouter();
  const [extensionId, setExtensionId] = useState('');
  const [targetUrl, setTargetUrl] = useState(defaultTarget);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const queryExtensionId = sanitizeQueryValue(router.query.extensionId);
    const queryTarget = sanitizeQueryValue(router.query.target);

    if (queryExtensionId) {
      setExtensionId(queryExtensionId);
      setSubmitted(true);
    }

    if (queryTarget) {
      setTargetUrl(queryTarget);
    }
  }, [router.isReady, router.query.extensionId, router.query.target]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    router.replace(
      {
        pathname: router.pathname,
        query: {
          extensionId: extensionId.trim(),
          target: targetUrl.trim() || defaultTarget,
        },
      },
      undefined,
      { shallow: true },
    );
  };

  return (
    <>
      <Head>
        <title>Extension Frame POC</title>
        <meta name="robots" content="noindex" />
      </Head>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <section className="rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-6 shadow-2">
          <div className="flex flex-col gap-3">
            <h1 className="font-bold text-text-primary typo-title2">
              Extension Frame POC
            </h1>
            <p className="max-w-3xl text-text-tertiary typo-callout">
              This page is now a thin consumer of the shared extension embed
              feature. Real product surfaces can reuse the same hook and
              component instead of rebuilding the permission and iframe flow.
            </p>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
            <label
              htmlFor="extension-frame-poc-extension-id"
              className="flex flex-col gap-2"
            >
              <span className="font-bold text-text-primary typo-callout">
                Extension ID
              </span>
              <input
                id="extension-frame-poc-extension-id"
                type="text"
                value={extensionId}
                onChange={(event) => setExtensionId(event.target.value)}
                placeholder="Paste the installed extension ID"
                className="rounded-14 border border-border-subtlest-tertiary bg-surface-secondary px-4 py-3 text-text-primary outline-none focus:border-border-subtlest-secondary"
              />
            </label>

            <label
              htmlFor="extension-frame-poc-target-url"
              className="flex flex-col gap-2"
            >
              <span className="font-bold text-text-primary typo-callout">
                Target URL
              </span>
              <input
                id="extension-frame-poc-target-url"
                type="url"
                value={targetUrl}
                onChange={(event) => setTargetUrl(event.target.value)}
                placeholder={defaultTarget}
                className="rounded-14 border border-border-subtlest-tertiary bg-surface-secondary px-4 py-3 text-text-primary outline-none focus:border-border-subtlest-secondary"
              />
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="hover:opacity-90 rounded-14 bg-accent-cabbage-default px-4 py-3 font-bold text-white transition-opacity"
              >
                Load embedded site
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-24 border border-border-subtlest-tertiary bg-surface-primary p-4 shadow-2">
          {submitted ? (
            <ExtensionSiteEmbed
              enabled
              extensionId={extensionId}
              targetUrl={targetUrl}
              className="h-[70vh] w-full rounded-16 border border-border-subtlest-tertiary bg-surface-secondary"
              targetFrameTitle="Embedded target site"
              renderState={(state) => (
                <div className="mb-3 flex flex-col gap-1">
                  <h2 className="font-bold text-text-primary typo-title3">
                    {state.showTargetFrame
                      ? 'Target iframe (embedded directly by webapp)'
                      : 'Extension permission frame'}
                  </h2>
                  <p className="text-text-tertiary typo-footnote">
                    {getStatusText(state)}
                  </p>
                </div>
              )}
            />
          ) : (
            <div className="flex h-[24rem] items-center justify-center rounded-16 border border-dashed border-border-subtlest-tertiary bg-surface-secondary px-6 text-center text-text-tertiary typo-callout">
              Submit an extension ID and a target URL to mount the shared
              extension embed flow here.
            </div>
          )}
        </section>
      </main>
    </>
  );
}
