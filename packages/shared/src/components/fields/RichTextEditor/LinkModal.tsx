import type { ReactElement, FormEvent } from 'react';
import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from '../../modals/common/Modal';
import { ModalKind, ModalSize } from '../../modals/common/types';
import { TextField } from '../TextField';
import { Button, ButtonVariant } from '../../buttons/Button';

export interface LinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, label?: string) => void;
  initialUrl?: string;
  initialLabel?: string;
}

export const LinkModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = '',
  initialLabel = '',
}: LinkModalProps): ReactElement => {
  const [url, setUrl] = useState(initialUrl);
  const [label, setLabel] = useState(initialLabel);

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setLabel(initialLabel);
    }
  }, [isOpen, initialUrl, initialLabel]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!url.trim()) {
        return;
      }

      // Add https:// if no protocol specified
      let finalUrl = url.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = `https://${finalUrl}`;
      }

      onSubmit(finalUrl, label.trim() || undefined);
    },
    [url, label, onSubmit],
  );

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      size={ModalSize.Small}
      kind={ModalKind.FlexibleCenter}
      parentSelector={() => document.body}
    >
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 p-4">
        <h3 className="font-bold typo-body">
          {initialUrl ? 'Edit link' : 'Add link'}
        </h3>
        <TextField
          name="url"
          label="Link"
          inputId="link-url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          autoComplete="url"
          autoFocus
        />
        <TextField
          name="label"
          label="Text (optional)"
          inputId="link-label"
          placeholder="Display text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant={ButtonVariant.Tertiary}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={ButtonVariant.Primary}
            disabled={!url.trim()}
          >
            {initialUrl ? 'Save' : 'Add link'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LinkModal;
