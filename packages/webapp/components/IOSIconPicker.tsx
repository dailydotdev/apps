import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import type { RadioItemProps } from '@dailydotdev/shared/src/components/fields/Radio';
import { Radio } from '@dailydotdev/shared/src/components/fields/Radio';
import { FlexCol } from '@dailydotdev/shared/src/components/utilities';
import { Loader } from '@dailydotdev/shared/src/components/Loader';
import { parseOrDefault } from '@dailydotdev/shared/src/lib/func';
import {
  postWebKitMessage,
  WebKitMessageHandlers,
} from '@dailydotdev/shared/src/lib/ios';
import {
  cloudinaryAppIconMain,
  cloudinaryAppIconV2,
  cloudinaryAppIconV3,
  cloudinaryAppIconV4,
  cloudinaryAppIconV5,
  cloudinaryAppIconV6,
  cloudinaryAppIconV7,
  cloudinaryAppIconV8,
  cloudinaryAppIconV9,
  cloudinaryAppIconV10,
  cloudinaryAppIconV11,
  cloudinaryAppIconV12,
} from '@dailydotdev/shared/src/lib/image';

type AppIconOption = {
  name: string | null;
  displayName: string;
  isSelected: boolean;
};

type AppIconResult = {
  action?: 'get' | 'set';
  icons?: AppIconOption[];
  selectedName?: string | null;
  supportsAlternateIcons?: boolean;
};

const appIconPreviewMap: Record<string, string> = {
  main: cloudinaryAppIconMain,
  v2: cloudinaryAppIconV2,
  v3: cloudinaryAppIconV3,
  v4: cloudinaryAppIconV4,
  v5: cloudinaryAppIconV5,
  v6: cloudinaryAppIconV6,
  v7: cloudinaryAppIconV7,
  v8: cloudinaryAppIconV8,
  v9: cloudinaryAppIconV9,
  v10: cloudinaryAppIconV10,
  v11: cloudinaryAppIconV11,
  v12: cloudinaryAppIconV12,
};

export const IOSIconPicker = (): ReactElement => {
  const [appIcons, setAppIcons] = useState<AppIconOption[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [supportsAlternateIcons, setSupportsAlternateIcons] = useState(false);
  const [appIconLoading, setAppIconLoading] = useState(false);
  const [appIconError, setAppIconError] = useState<string | null>(null);

  const appIconOptions = useMemo<RadioItemProps[]>(() => {
    return appIcons.map((icon) => {
      const iconName = icon.name ?? 'main';
      const previewUrl = appIconPreviewMap[iconName] ?? cloudinaryAppIconMain;
      return {
        label: (
          <span className="flex items-center gap-2">
            <span className="border-border-subtle h-7 w-7 overflow-hidden rounded-10 border bg-surface-primary">
              <img
                src={previewUrl}
                alt={`${icon.displayName} app icon`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
            <span>{icon.displayName}</span>
          </span>
        ),
        value: icon.name ?? 'default',
      };
    });
  }, [appIcons]);

  const parseEventDetail = <T,>(rawDetail: unknown): T | null => {
    if (typeof rawDetail === 'string') {
      return parseOrDefault<T>(rawDetail) as T;
    }
    return rawDetail as T;
  };

  const handleGetIconResult = (detail: AppIconResult): void => {
    const selected =
      detail.selectedName ??
      detail.icons?.find((icon) => icon.isSelected)?.name ??
      null;

    setAppIcons(detail.icons ?? []);
    setSelectedIcon(selected);
    setSupportsAlternateIcons(!!detail.supportsAlternateIcons);
    setAppIconError(null);
    setAppIconLoading(false);
  };

  const handleSetIconResult = (detail: AppIconResult): void => {
    setSelectedIcon(detail.selectedName ?? null);
    setAppIconError(null);
    setAppIconLoading(false);
  };

  const handleAppIconResult = useCallback((event: Event) => {
    const detail = parseEventDetail<AppIconResult>(
      (event as CustomEvent).detail,
    );

    if (!detail || typeof detail !== 'object') {
      return;
    }

    if (detail.action === 'get') {
      handleGetIconResult(detail);
      return;
    }

    if (detail.action === 'set') {
      handleSetIconResult(detail);
    }
  }, []);

  const handleAppIconError = useCallback((event: Event) => {
    const detail = parseEventDetail<{ reason?: string; message?: string }>(
      (event as CustomEvent).detail,
    );
    const reason =
      detail?.message || detail?.reason || 'Unable to update icon.';

    setAppIconError(reason);
    setAppIconLoading(false);
  }, []);

  const requestAppIcons = useCallback(() => {
    setAppIconLoading(true);
    setAppIconError(null);

    try {
      postWebKitMessage(WebKitMessageHandlers.AppIconGet, null);
    } catch (error) {
      setAppIconError(
        error instanceof Error ? error.message : 'Unable to load icons.',
      );
      setAppIconLoading(false);
    }
  }, []);

  const handleAppIconChange = useCallback(
    (value: string) => {
      if (appIconLoading) {
        return;
      }

      const nextName = value === 'default' ? null : value;
      setAppIconLoading(true);
      setAppIconError(null);

      try {
        postWebKitMessage(WebKitMessageHandlers.AppIconSet, { name: nextName });
      } catch (error) {
        setAppIconError(
          error instanceof Error ? error.message : 'Unable to update icon.',
        );
        setAppIconLoading(false);
      }
    },
    [appIconLoading],
  );

  useEffect(() => {
    requestAppIcons();

    window.addEventListener('app-icon-result', handleAppIconResult);
    window.addEventListener('app-icon-error', handleAppIconError);

    return () => {
      window.removeEventListener('app-icon-result', handleAppIconResult);
      window.removeEventListener('app-icon-error', handleAppIconError);
    };
  }, [handleAppIconError, handleAppIconResult, requestAppIcons]);

  return (
    <FlexCol className="gap-2">
      <Typography bold type={TypographyType.Subhead}>
        App icon
      </Typography>
      <Typography
        type={TypographyType.Callout}
        color={TypographyColor.Tertiary}
      >
        Choose which icon appears on your iOS Home Screen.
      </Typography>

      {appIconLoading && (
        <div className="flex items-center gap-2">
          <Loader className="h-4 w-4" />
          <Typography
            type={TypographyType.Callout}
            color={TypographyColor.Tertiary}
          >
            Updating icon…
          </Typography>
        </div>
      )}

      {appIconError && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          {appIconError}
        </Typography>
      )}

      {!supportsAlternateIcons && !appIconError && (
        <Typography
          type={TypographyType.Callout}
          color={TypographyColor.Tertiary}
        >
          Alternate icons aren&apos;t supported on this device.
        </Typography>
      )}

      {supportsAlternateIcons && appIconOptions.length > 0 && (
        <Radio
          name="app-icon"
          options={appIconOptions}
          value={selectedIcon ?? 'default'}
          onChange={handleAppIconChange}
          disabled={appIconLoading}
          className={{
            content: 'w-full justify-between !pr-0',
            container: '!gap-0',
            label: 'font-normal text-text-secondary typo-callout',
          }}
          reverse
        />
      )}
    </FlexCol>
  );
};
