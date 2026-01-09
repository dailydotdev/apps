import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { TextField } from '../../../components/fields/TextField';
import {
  Typography,
  TypographyType,
} from '../../../components/typography/Typography';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../components/buttons/Button';
import {
  PlusIcon,
  MiniCloseIcon,
  VIcon,
  EditIcon,
} from '../../../components/icons';
import { IconSize } from '../../../components/Icon';
import { OrganizationLinkType } from '../types';
import type { LinkItem } from '../utils/platformDetection';
import {
  detectPlatform,
  getLinkDisplayName,
  getPlatformIcon,
} from '../utils/platformDetection';

export type LinksInputProps = {
  links: LinkItem[];
  onAdd: (link: LinkItem) => void;
  onRemove: (index: number) => void;
  onUpdate?: (index: number, link: LinkItem) => void;
  error?: string;
};

export const LinksInput = ({
  links,
  onAdd,
  onRemove,
  onUpdate,
  error,
}: LinksInputProps) => {
  const [url, setUrl] = useState('');
  const [customLabel, setCustomLabel] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus the edit input when editing starts
  useEffect(() => {
    if (editingIndex !== null) {
      editInputRef.current?.focus();
    }
  }, [editingIndex]);

  // Detect platform as user types
  const detectedPlatform = useMemo(() => detectPlatform(url), [url]);
  const isUnrecognized = url.trim() && !detectedPlatform;

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
      // Clear custom label when URL changes and platform is detected
      if (detectPlatform(e.target.value)) {
        setCustomLabel('');
      }
    },
    [],
  );

  const handleAdd = useCallback(() => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return;
    }

    // For unrecognized URLs, require a label
    if (!detectedPlatform && !customLabel.trim()) {
      return;
    }

    const newLink: LinkItem = detectedPlatform
      ? {
          type: detectedPlatform.linkType,
          link: trimmedUrl,
          socialType: detectedPlatform.socialType,
          title: detectedPlatform.defaultLabel || null,
        }
      : {
          type: OrganizationLinkType.Custom,
          link: trimmedUrl,
          socialType: null,
          title: customLabel.trim(),
        };

    onAdd(newLink);
    setUrl('');
    setCustomLabel('');
  }, [url, detectedPlatform, customLabel, onAdd]);

  const handleStartEdit = useCallback((index: number, currentLabel: string) => {
    setEditingIndex(index);
    setEditingLabel(currentLabel);
  }, []);

  const handleSaveEdit = useCallback(
    (index: number) => {
      const link = links[index];
      if (link && onUpdate) {
        onUpdate(index, {
          ...link,
          title: editingLabel.trim() || null,
        });
      }
      setEditingIndex(null);
      setEditingLabel('');
    },
    [links, editingLabel, onUpdate],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setEditingLabel('');
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* URL input - primary action */}
      <TextField
        type="url"
        inputId="linkUrl"
        label="Company links"
        hint="Add links to help candidates learn more about your company"
        placeholder="e.g., LinkedIn, GitHub, TechCrunch, Official blog"
        value={url}
        onChange={handleUrlChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
          }
        }}
        fieldType="secondary"
        actionButton={
          <Button
            type="button"
            variant={ButtonVariant.Secondary}
            size={ButtonSize.XSmall}
            icon={<PlusIcon />}
            onClick={handleAdd}
            disabled={!url.trim() || (isUnrecognized && !customLabel.trim())}
          >
            Add
          </Button>
        }
      />

      {/* Detection feedback */}
      {detectedPlatform && (
        <div className="bg-status-success/10 flex items-center gap-2 rounded-10 px-3 py-2">
          <VIcon className="text-status-success" size={IconSize.Small} />
          <Typography type={TypographyType.Footnote}>
            {detectedPlatform.platform} detected
          </Typography>
        </div>
      )}

      {/* Custom label input for unrecognized URLs */}
      {isUnrecognized && (
        <div className="flex flex-col gap-2 rounded-10 border border-border-subtlest-tertiary bg-surface-float p-3">
          <Typography
            type={TypographyType.Footnote}
            className="text-text-tertiary"
          >
            Custom link - add a label
          </Typography>
          <TextField
            type="text"
            inputId="customLinkLabel"
            label="Label"
            placeholder="e.g., Company Blog, Careers Page"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            fieldType="secondary"
          />
        </div>
      )}

      {/* Link list */}
      {links.length > 0 && (
        <div className="flex flex-col gap-2">
          {links.map((link, index) => (
            <div
              key={`${link.type}-${link.link}`}
              className="group flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary bg-background-subtle p-3"
            >
              {/* Platform icon */}
              <div className="flex-shrink-0">{getPlatformIcon(link)}</div>

              {/* Content */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {editingIndex === index && onUpdate ? (
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => handleSaveEdit(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit(index);
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                    className="w-full rounded-6 border border-border-subtlest-tertiary bg-surface-float px-2 py-1 text-text-primary typo-callout focus:border-accent-cabbage-default focus:outline-hidden"
                    placeholder={getLinkDisplayName(link)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onUpdate && handleStartEdit(index, link.title || '')
                    }
                    className="flex items-center gap-1.5 text-left"
                    disabled={!onUpdate}
                  >
                    <Typography type={TypographyType.Callout} bold>
                      {getLinkDisplayName(link)}
                    </Typography>
                    {onUpdate && (
                      <EditIcon
                        size={IconSize.Size16}
                        className="text-text-quaternary opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    )}
                  </button>
                )}
                <Typography
                  type={TypographyType.Caption1}
                  className="truncate text-text-tertiary"
                >
                  {link.link}
                </Typography>
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="flex-shrink-0 rounded-8 p-1 text-text-quaternary transition-colors hover:bg-surface-float hover:text-text-primary"
                aria-label="Remove link"
              >
                <MiniCloseIcon size={IconSize.Medium} />
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <Typography
          type={TypographyType.Footnote}
          className="text-status-error"
        >
          {error}
        </Typography>
      )}
    </div>
  );
};
