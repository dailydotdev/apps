import type { ReactElement } from 'react';
import React, { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonVariant,
} from '../../../../components/buttons/Button';
import ControlledTextField from '../../../../components/fields/ControlledTextField';
import type { ModalProps } from '../../../../components/modals/common/Modal';
import { Modal } from '../../../../components/modals/common/Modal';
import { Justify } from '../../../../components/utilities';
import { useShortcutsManager } from '../../hooks/useShortcutsManager';
import { ShortcutTile } from '../ShortcutTile';
import type { Shortcut, ShortcutColor } from '../../types';
import { shortcutColorPalette } from '../../types';
import { isValidHttpUrl, withHttps } from '../../../../lib/links';
import classNames from 'classnames';

const schema = z.object({
  name: z
    .string()
    .max(40, 'Name must be 40 characters or less')
    .optional()
    .or(z.literal('')),
  url: z
    .string()
    .min(1, 'URL is required')
    .refine(
      (value) => isValidHttpUrl(withHttps(value)),
      'Must be a valid HTTP/S URL',
    ),
  iconUrl: z
    .string()
    .optional()
    .refine(
      (value) => !value || isValidHttpUrl(withHttps(value)),
      'Must be a valid URL',
    ),
  color: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ShortcutEditModalProps = ModalProps & {
  mode: 'add' | 'edit';
  shortcut?: Shortcut;
  onSubmitted?: () => void;
};

const colorSwatchClass: Record<ShortcutColor, string> = {
  burger: 'bg-accent-burger-bolder',
  cheese: 'bg-accent-cheese-bolder',
  avocado: 'bg-accent-avocado-bolder',
  bacon: 'bg-accent-bacon-bolder',
  blueCheese: 'bg-accent-blueCheese-bolder',
  cabbage: 'bg-accent-cabbage-bolder',
};

const colorLabel: Record<ShortcutColor, string> = {
  burger: 'Burger',
  cheese: 'Cheese',
  avocado: 'Avocado',
  bacon: 'Bacon',
  blueCheese: 'Blue cheese',
  cabbage: 'Cabbage',
};

export default function ShortcutEditModal({
  mode,
  shortcut,
  onSubmitted,
  ...props
}: ShortcutEditModalProps): ReactElement {
  const manager = useShortcutsManager();
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: shortcut?.name ?? '',
      url: shortcut?.url ?? '',
      iconUrl: shortcut?.iconUrl ?? '',
      color: shortcut?.color ?? '',
    },
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    watch,
    setError,
    formState: { isSubmitting },
  } = methods;

  const values = watch();
  const previewShortcut = useMemo<Shortcut>(
    () => ({
      url: values.url || 'https://example.com',
      name: values.name || undefined,
      iconUrl: values.iconUrl || undefined,
      color: (values.color as ShortcutColor) || 'burger',
    }),
    [values.color, values.iconUrl, values.name, values.url],
  );

  const onSubmit = handleSubmit(async (data) => {
    const payload = {
      url: data.url,
      name: data.name || undefined,
      iconUrl: data.iconUrl || undefined,
      color: data.color || undefined,
    };

    const result =
      mode === 'add'
        ? await manager.addShortcut(payload)
        : await manager.updateShortcut(shortcut!.url, payload);

    if (result.error) {
      setError('url', { message: result.error });
      return;
    }

    onSubmitted?.();
    props.onRequestClose?.(undefined as never);
  });

  return (
    <Modal kind={Modal.Kind.FlexibleCenter} size={Modal.Size.Small} {...props}>
      <Modal.Header>
        <Modal.Title>
          {mode === 'add' ? 'Add shortcut' : 'Edit shortcut'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <FormProvider {...methods}>
          <form id="shortcut-edit-form" onSubmit={onSubmit}>
            <div className="relative mb-6 flex justify-center overflow-hidden rounded-16 border border-border-subtlest-tertiary bg-surface-float py-6">
              <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-accent-cabbage-default/10 blur-3xl" />
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-accent-onion-default/10 blur-3xl" />
              <ShortcutTile shortcut={previewShortcut} draggable={false} />
            </div>

            <div className="flex flex-col gap-4">
              <ControlledTextField
                name="name"
                label="Name (optional)"
                placeholder="My shortcut"
                hint="Max 40 characters"
              />
              <ControlledTextField
                name="url"
                label="URL"
                placeholder="https://example.com"
              />
              <ControlledTextField
                name="iconUrl"
                label="Custom icon URL (optional)"
                placeholder="https://example.com/icon.png"
                hint="Leave empty to use the site favicon"
              />
              <div>
                <span className="mb-2 block text-text-tertiary typo-caption1">
                  Accent color (used when no favicon is available)
                </span>
                <div
                  role="radiogroup"
                  aria-label="Accent color"
                  className="flex flex-wrap gap-3"
                >
                  {shortcutColorPalette.map((color: ShortcutColor) => {
                    const checked = values.color === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        aria-label={colorLabel[color]}
                        title={colorLabel[color]}
                        role="radio"
                        aria-checked={checked}
                        onClick={() =>
                          methods.setValue('color', color, {
                            shouldDirty: true,
                          })
                        }
                        className={classNames(
                          'size-8 rounded-full transition-all duration-150 ease-out motion-reduce:transition-none',
                          colorSwatchClass[color],
                          checked
                            ? 'scale-110 ring-2 ring-border-subtlest-primary ring-offset-2 ring-offset-background-default'
                            : 'opacity-80 hover:scale-105 hover:opacity-100 motion-reduce:hover:scale-100',
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal.Body>
      <Modal.Footer justify={Justify.End}>
        <Button
          type="button"
          variant={ButtonVariant.Float}
          onClick={() => props.onRequestClose?.(undefined as never)}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="shortcut-edit-form"
          variant={ButtonVariant.Primary}
          disabled={isSubmitting}
        >
          {mode === 'add' ? 'Add' : 'Save'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
