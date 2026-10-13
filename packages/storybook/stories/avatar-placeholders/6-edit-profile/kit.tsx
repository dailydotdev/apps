import type { ChangeEvent, ReactElement, ReactNode } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@dailydotdev/shared/src/components/buttons/Button';
import { CameraIcon } from '@dailydotdev/shared/src/components/icons/Camera';
import { UploadIcon } from '@dailydotdev/shared/src/components/icons/Upload';
import { SparkleIcon } from '@dailydotdev/shared/src/components/icons/Sparkle';
import { TrashIcon } from '@dailydotdev/shared/src/components/icons/Trash';
import { MiniCloseIcon } from '@dailydotdev/shared/src/components/icons/MiniClose';
import { ArrowIcon } from '@dailydotdev/shared/src/components/icons/Arrow';
import { EditIcon } from '@dailydotdev/shared/src/components/icons/Edit';
import { GitHubIcon } from '@dailydotdev/shared/src/components/icons/GitHub';
import { ImageIcon } from '@dailydotdev/shared/src/components/icons/Image';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { radiusForSize } from '../shell';
import type { Character } from '../data';
import {
  characterById,
  Family,
  familyLabel,
  getCharacterSrc,
  pickableCharacters,
} from '../data';
import type { AvatarState, Person, Photo } from './model';
import {
  assignedFor,
  AvatarSource,
  Device,
  deviceSpec,
  displayedCharacter,
  isPhoto,
  samplePhoto,
  SocialProvider,
} from './model';

const editMotionCss = `
@keyframes epFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes epSheet { from { transform: translateY(100%); } to { transform: none; } }
@keyframes epPop {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes epToast {
  from { opacity: 0; transform: translateY(8px); filter: blur(4px); }
  to { opacity: 1; transform: none; filter: blur(0); }
}
@keyframes epSpin { to { transform: rotate(360deg); } }
.ep-fade { animation: epFade 180ms ease-out both; }
.ep-sheet { animation: epSheet 320ms cubic-bezier(0.32, 0.72, 0, 1) both; }
.ep-pop { animation: epPop 200ms cubic-bezier(0.16, 1, 0.3, 1) both; transform-origin: top left; }
.ep-toast { animation: epToast 260ms cubic-bezier(0.16, 1, 0.3, 1) both; }
.ep-spin { animation: epSpin 800ms linear infinite; }
.ep-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(var(--ep-tile, 3.5rem), 1fr)); gap: 0.625rem; }
.ep-range { accent-color: var(--theme-accent-cabbage-default); }
@media (prefers-reduced-motion: reduce) {
  .ep-fade, .ep-sheet, .ep-pop, .ep-toast { animation-duration: 1ms; }
}
`;

export const EditMotion = (): ReactElement => (
  // eslint-disable-next-line react/no-danger
  <style dangerouslySetInnerHTML={{ __html: editMotionCss }} />
);

export const isCompact = (device: Device): boolean => device === Device.Mobile;

/** A photo rendered through its crop, at any size, so previews match. */
export const PhotoImage = ({
  photo,
  sizePx,
  radius,
  className,
}: {
  photo: Photo;
  sizePx: number;
  radius?: string;
  className?: string;
}): ReactElement => {
  const shortSide = Math.min(photo.width, photo.height);
  const scale = (sizePx * photo.zoom) / shortSide;
  return (
    <span
      style={{
        width: sizePx,
        height: sizePx,
        borderRadius: radius ?? radiusForSize(sizePx),
      }}
      className={classNames(
        'relative block shrink-0 overflow-hidden bg-surface-float',
        className,
      )}
    >
      <img
        src={photo.src}
        alt=""
        draggable={false}
        style={{
          position: 'absolute',
          maxWidth: 'none',
          width: photo.width * scale,
          height: photo.height * scale,
          left: sizePx / 2 - photo.cx * photo.width * scale,
          top: sizePx / 2 - photo.cy * photo.height * scale,
        }}
      />
    </span>
  );
};

export const AvatarImage = ({
  state,
  person,
  sizePx,
  radius,
  className,
  animate = true,
}: {
  state: AvatarState;
  person: Person;
  sizePx: number;
  radius?: string;
  className?: string;
  animate?: boolean;
}): ReactElement => {
  const character = displayedCharacter(state, person);
  if (character) {
    return (
      <span
        key={character.id}
        style={{ borderRadius: radius ?? radiusForSize(sizePx) }}
        className={classNames(
          'block shrink-0 overflow-hidden',
          animate && 'ap-swap',
          className,
        )}
      >
        <img
          src={getCharacterSrc(character, sizePx)}
          alt=""
          style={{ width: sizePx, height: sizePx }}
          className="block object-cover"
        />
      </span>
    );
  }
  return (
    <PhotoImage
      key={state.photo?.src}
      photo={state.photo as Photo}
      sizePx={sizePx}
      radius={radius}
      className={classNames(animate && 'ap-swap', className)}
    />
  );
};

export const avatarCaption = (
  state: AvatarState,
  person: Person,
): { title: string; detail: string } => {
  const character = displayedCharacter(state, person);
  switch (state.source) {
    case AvatarSource.Assigned:
      return {
        title: character?.name ?? '',
        detail: 'Given to you when you joined. Swap it or add a photo.',
      };
    case AvatarSource.Character:
      return {
        title: character?.name ?? '',
        detail: 'Your character. Swap it or add a photo anytime.',
      };
    case AvatarSource.Social:
      return {
        title: `Your ${state.provider} photo`,
        detail: 'Switch to a character anytime.',
      };
    default:
      return { title: 'Your photo', detail: 'Switch to a character anytime.' };
  }
};

export enum UploadError {
  Type = 'type',
  Size = 'size',
  Network = 'network',
}

export const uploadErrorCopy: Record<UploadError, string> = {
  [UploadError.Type]:
    "That file type isn't supported. Use JPG, PNG, WEBP or AVIF.",
  [UploadError.Size]: 'That image is over 20 MB. Try a smaller one.',
  [UploadError.Network]:
    "Couldn't upload your photo. Your avatar didn't change.",
};

const Spinner = ({ className }: { className?: string }): ReactElement => (
  <span
    aria-hidden
    className={classNames(
      'ep-spin block size-6 rounded-max border-2 border-text-primary border-t-transparent',
      className,
    )}
  />
);

/** The settings avatar: one tap target, one badge, no buttons on the face. */
export const AvatarField = ({
  state,
  person,
  device,
  isUploading,
  error,
  isDragOver,
  isMenuOpen,
  onOpen,
  menu,
  withCaption = true,
}: {
  state: AvatarState;
  person: Person;
  device: Device;
  isUploading?: boolean;
  error?: UploadError;
  isDragOver?: boolean;
  isMenuOpen?: boolean;
  onOpen?: () => void;
  menu?: ReactNode;
  withCaption?: boolean;
}): ReactElement => {
  const sizePx = isCompact(device) ? 96 : 120;
  const radius = radiusForSize(sizePx);
  const caption = avatarCaption(state, person);

  return (
    <div className="flex items-start gap-4">
      <div className="relative">
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label="Change profile picture"
          style={{ borderRadius: radius }}
          className="ap-press relative block shadow-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-cabbage-default"
        >
          <AvatarImage
            state={state}
            person={person}
            sizePx={sizePx}
            className="ring-4 ring-background-default"
          />
          {(isUploading || isDragOver) && (
            <span
              style={{ borderRadius: radius }}
              className={classNames(
                'ep-fade absolute inset-0 flex items-center justify-center',
                isUploading && 'bg-overlay-tertiary-black',
                isDragOver &&
                  'border-2 border-dashed border-accent-cabbage-default bg-overlay-float-cabbage',
              )}
            >
              {isUploading && <Spinner />}
              {isDragOver && (
                <UploadIcon
                  size={IconSize.Large}
                  className="text-accent-cabbage-default"
                />
              )}
            </span>
          )}
          <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-max border border-border-subtlest-tertiary bg-background-default text-text-primary shadow-2">
            <CameraIcon size={IconSize.Size16} />
          </span>
        </button>
        {menu}
      </div>
      {withCaption && (
        <div
          // Starts just under the cover line, which crosses the avatar's middle.
          style={{ paddingTop: sizePx / 2 + 8 }}
          className="flex min-w-0 flex-1 flex-col gap-0.5"
        >
          <span className="truncate font-bold text-text-primary typo-callout">
            {isUploading ? 'Uploading…' : caption.title}
          </span>
          <span
            className={classNames(
              'ap-pretty typo-footnote',
              error ? 'text-accent-ketchup-default' : 'text-text-tertiary',
            )}
          >
            {error ? uploadErrorCopy[error] : caption.detail}
          </span>
        </div>
      )}
    </div>
  );
};

interface MenuItem {
  id: string;
  label: string;
  detail?: string;
  icon: ReactNode;
  onClick: () => void;
  tone?: 'danger';
}

export const avatarMenuItems = ({
  state,
  person,
  device,
  providerPhoto,
  provider,
  onChoose,
  onUpload,
  onRemove,
  onUseProvider,
}: {
  state: AvatarState;
  person: Person;
  device: Device;
  providerPhoto?: Photo;
  provider?: SocialProvider;
  onChoose: () => void;
  onUpload: () => void;
  onRemove: () => void;
  onUseProvider?: () => void;
}): MenuItem[] => {
  const items: MenuItem[] = [
    {
      id: 'choose',
      label: 'Choose a character',
      icon: <SparkleIcon />,
      onClick: onChoose,
    },
    {
      id: 'upload',
      label: isCompact(device) ? 'Take or choose a photo' : 'Upload a photo',
      icon: isCompact(device) ? <CameraIcon /> : <UploadIcon />,
      onClick: onUpload,
    },
  ];
  if (providerPhoto && provider && state.source !== AvatarSource.Social) {
    items.push({
      id: 'provider',
      label: `Use your ${provider} photo`,
      icon: <GitHubIcon />,
      onClick: () => onUseProvider?.(),
    });
  }
  if (isPhoto(state)) {
    items.push({
      id: 'remove',
      label: 'Remove photo',
      detail: `You'll show as ${assignedFor(person).name}`,
      icon: <TrashIcon />,
      onClick: onRemove,
      tone: 'danger',
    });
  }
  return items;
};

const MenuRow = ({
  item,
  large,
}: {
  item: MenuItem;
  large?: boolean;
}): ReactElement => (
  <button
    type="button"
    role="menuitem"
    onClick={item.onClick}
    className={classNames(
      'flex w-full items-center gap-3 rounded-10 text-left hover:bg-surface-hover',
      large ? 'px-3 py-3' : 'px-2.5 py-2',
      item.tone === 'danger'
        ? 'text-accent-ketchup-default'
        : 'text-text-primary',
    )}
  >
    <span className="flex size-5 shrink-0 items-center justify-center">
      {item.icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className={classNames(large ? 'typo-callout' : 'typo-footnote')}>
        {item.label}
      </span>
      {item.detail && (
        <span className="text-text-tertiary typo-caption1">{item.detail}</span>
      )}
    </span>
  </button>
);

/** Popover under the avatar on tablet and laptop. */
export const AvatarMenuPopover = ({
  items,
}: {
  items: MenuItem[];
}): ReactElement => (
  <div
    role="menu"
    className="ep-pop ap-elevated absolute left-0 top-full z-3 mt-2 flex w-60 flex-col rounded-14 border border-border-subtlest-tertiary bg-background-default p-1"
  >
    {items.map((item) => (
      <MenuRow key={item.id} item={item} />
    ))}
  </div>
);

const Overlay = ({
  onClose,
  children,
  align = 'center',
}: {
  onClose: () => void;
  children: ReactNode;
  align?: 'center' | 'bottom';
}): ReactElement => (
  <div
    className={classNames(
      'absolute inset-0 z-3 flex',
      align === 'bottom' ? 'items-end' : 'items-center justify-center p-6',
    )}
  >
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className="ep-fade absolute inset-0 bg-overlay-quaternary-onion"
    />
    {children}
  </div>
);

const SheetHandle = (): ReactElement => (
  <span className="mx-auto mb-1 mt-2 block h-1 w-10 rounded-max bg-text-quaternary opacity-[0.5]" />
);

/** Action sheet on mobile, same items as the popover. */
export const AvatarActionSheet = ({
  items,
  onClose,
}: {
  items: MenuItem[];
  onClose: () => void;
}): ReactElement => (
  <Overlay align="bottom" onClose={onClose}>
    <div
      role="menu"
      className="ep-sheet relative flex w-full flex-col gap-1 rounded-t-24 border-t border-border-subtlest-tertiary bg-background-default px-3 pb-6"
    >
      <SheetHandle />
      <span className="px-3 py-2 font-bold typo-body">Profile picture</span>
      {items.map((item) => (
        <MenuRow key={item.id} item={item} large />
      ))}
      <Button
        variant={ButtonVariant.Float}
        size={ButtonSize.Large}
        className="mt-2"
        onClick={onClose}
      >
        Cancel
      </Button>
    </div>
  </Overlay>
);

export enum PickerTab {
  Characters = 'characters',
  Photo = 'photo',
}

const pickerFamilies = [Family.Critter, Family.Visitor, Family.Person];

const previewSizes = [
  { px: 24, label: 'Feed' },
  { px: 40, label: 'Comments' },
  { px: 96, label: 'Profile' },
];

const PreviewSizes = ({
  state,
  person,
  scaleLargest,
}: {
  state: AvatarState;
  person: Person;
  scaleLargest: number;
}): ReactElement => (
  <div className="flex items-end gap-3">
    {previewSizes.map(({ px, label }) => (
      <div key={px} className="flex flex-col items-center gap-1">
        <AvatarImage
          state={state}
          person={person}
          sizePx={px === 96 ? scaleLargest : px}
        />
        <span className="text-text-quaternary typo-caption2">{label}</span>
      </div>
    ))}
  </div>
);

const CharacterTile = ({
  character,
  isSelected,
  isCurrent,
  onSelect,
  label,
}: {
  character: Character;
  isSelected: boolean;
  isCurrent: boolean;
  onSelect: () => void;
  label?: string;
}): ReactElement => (
  <button
    type="button"
    role="radio"
    aria-checked={isSelected}
    aria-label={`${character.name}${isCurrent ? ', current' : ''}`}
    onClick={onSelect}
    className="ap-press relative flex flex-col items-center gap-1"
  >
    <img
      src={character.faceSrc}
      alt=""
      className={classNames(
        'aspect-square w-full rounded-14 object-cover',
        isSelected ? 'ap-ring' : 'hover:opacity-[0.8]',
      )}
    />
    {label && (
      <span className="w-full truncate text-center text-text-tertiary typo-caption2">
        {label}
      </span>
    )}
    {isCurrent && (
      <span className="absolute -right-1 -top-1 rounded-6 bg-background-default px-1 text-text-tertiary typo-caption2 shadow-2">
        Now
      </span>
    )}
  </button>
);

export const CharactersTab = ({
  state,
  person,
  selectedId,
  onSelect,
  compact,
}: {
  state: AvatarState;
  person: Person;
  selectedId?: string;
  onSelect: (id: string) => void;
  compact: boolean;
}): ReactElement => {
  const assigned = assignedFor(person);
  const current = displayedCharacter(state, person)?.id;

  return (
    <div
      role="radiogroup"
      aria-label="Characters"
      className="flex flex-col gap-5"
      style={
        { '--ep-tile': compact ? '3.375rem' : '3.5rem' } as React.CSSProperties
      }
    >
      <div className="flex flex-col gap-2">
        <span className="text-text-tertiary typo-footnote">Given to you</span>
        <div className="ep-grid">
          <CharacterTile
            character={assigned}
            isSelected={selectedId === assigned.id}
            isCurrent={current === assigned.id}
            onSelect={() => onSelect(assigned.id)}
            label={assigned.name}
          />
        </div>
      </div>
      {pickerFamilies.map((family) => (
        <div key={family} className="flex flex-col gap-2">
          <span className="text-text-tertiary typo-footnote">
            {familyLabel[family]}
          </span>
          <div className="ep-grid">
            {pickableCharacters
              .filter(
                (item) => item.family === family && item.id !== assigned.id,
              )
              .map((item) => (
                <CharacterTile
                  key={item.id}
                  character={item}
                  isSelected={selectedId === item.id}
                  isCurrent={current === item.id}
                  onSelect={() => onSelect(item.id)}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const readFile = (file: File): Promise<Photo> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () =>
        resolve({
          src: reader.result as string,
          width: image.naturalWidth,
          height: image.naturalHeight,
          cx: 0.5,
          cy: 0.5,
          zoom: 1,
        });
      image.onerror = reject;
      image.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
const MAX_INPUT_MB = 20;

export const PhotoTab = ({
  device,
  error,
  provider,
  providerPhoto,
  state,
  onPhoto,
  onError,
  onUseProvider,
}: {
  device: Device;
  error?: UploadError;
  provider?: SocialProvider;
  providerPhoto?: Photo;
  state: AvatarState;
  onPhoto: (photo: Photo) => void;
  onError: (error: UploadError) => void;
  onUseProvider?: () => void;
}): ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [isOver, setIsOver] = useState(false);
  const compact = isCompact(device);

  const handleFile = async (file?: File) => {
    if (!file) {
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      onError(UploadError.Type);
      return;
    }
    if (file.size > MAX_INPUT_MB * 1024 * 1024) {
      onError(UploadError.Size);
      return;
    }
    onPhoto(await readFile(file));
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="rounded-12 border border-accent-ketchup-default bg-overlay-float-ketchup px-3 py-2 text-accent-ketchup-default typo-footnote"
        >
          {uploadErrorCopy[error]}
        </div>
      )}
      {providerPhoto && provider && state.source !== AvatarSource.Social && (
        <div className="flex items-center gap-3 rounded-16 border border-border-subtlest-tertiary p-3">
          <PhotoImage photo={providerPhoto} sizePx={40} />
          <span className="min-w-0 flex-1 typo-footnote">
            <span className="block font-bold">Your {provider} photo</span>
            <span className="text-text-tertiary">
              The one you signed up with.
            </span>
          </span>
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Small}
            onClick={onUseProvider}
          >
            Use it
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={onChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={onChange}
      />
      {compact ? (
        <div className="flex flex-col gap-2">
          <Button
            variant={ButtonVariant.Primary}
            size={ButtonSize.Large}
            icon={<ImageIcon />}
            onClick={() => inputRef.current?.click()}
          >
            Choose from library
          </Button>
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Large}
            icon={<CameraIcon />}
            onClick={() => cameraRef.current?.click()}
          >
            Take a photo
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsOver(true);
          }}
          onDragLeave={() => setIsOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsOver(false);
            handleFile(event.dataTransfer.files?.[0]);
          }}
          className={classNames(
            'flex min-h-48 flex-col items-center justify-center gap-2 rounded-16 border border-dashed p-6 text-center',
            isOver
              ? 'border-accent-cabbage-default bg-overlay-float-cabbage'
              : 'border-border-subtlest-secondary hover:bg-surface-hover',
          )}
        >
          <UploadIcon size={IconSize.Large} className="text-text-tertiary" />
          <span className="font-bold typo-callout">
            Drag a photo here, or browse
          </span>
          <span className="text-text-tertiary typo-footnote">
            JPG, PNG, WEBP or AVIF. Big photos are resized for you.
          </span>
        </button>
      )}
      <button
        type="button"
        onClick={() =>
          onPhoto(samplePhoto('AR', 18 + Math.round(Math.random() * 200)))
        }
        className="self-start text-text-tertiary underline typo-caption1 hover:text-text-primary"
      >
        Storybook only: use a stand-in photo
      </button>
    </div>
  );
};

/** Square crop with drag to reposition and a zoom slider. */
export const CropStep = ({
  photo,
  onChange,
  sizePx,
}: {
  photo: Photo;
  onChange: (photo: Photo) => void;
  sizePx: number;
}): ReactElement => {
  const drag = useRef<{ x: number; y: number; photo: Photo } | null>(null);
  const shortSide = Math.min(photo.width, photo.height);

  const clamp = (next: Photo): Photo => {
    const half = shortSide / (2 * next.zoom);
    const clampAxis = (value: number, length: number) =>
      Math.min(Math.max(value, half / length), 1 - half / length);
    return {
      ...next,
      cx: clampAxis(next.cx, photo.width),
      cy: clampAxis(next.cy, photo.height),
    };
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        role="img"
        aria-label="Drag to reposition your photo"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX, y: event.clientY, photo };
        }}
        onPointerMove={(event) => {
          if (!drag.current) {
            return;
          }
          const scale = (sizePx * photo.zoom) / shortSide;
          const start = drag.current;
          onChange(
            clamp({
              ...photo,
              cx:
                start.photo.cx -
                (event.clientX - start.x) / scale / photo.width,
              cy:
                start.photo.cy -
                (event.clientY - start.y) / scale / photo.height,
            }),
          );
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        className="relative cursor-grab touch-none select-none active:cursor-grabbing"
      >
        <PhotoImage photo={photo} sizePx={sizePx} />
        <span
          aria-hidden
          style={{ borderRadius: radiusForSize(sizePx) }}
          className="pointer-events-none absolute inset-0 border border-white opacity-[0.4]"
        />
      </div>
      <label className="flex w-full max-w-[18rem] items-center gap-3 text-text-tertiary typo-caption1">
        Zoom
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={photo.zoom}
          onChange={(event) =>
            onChange(clamp({ ...photo, zoom: Number(event.target.value) }))
          }
          className="ep-range min-w-0 flex-1"
        />
      </label>
      <span className="text-text-quaternary typo-caption1">
        Drag to reposition
      </span>
    </div>
  );
};

/** The picker. Bottom sheet on mobile, modal on tablet, two panes on laptop. */
export const AvatarPicker = ({
  device,
  state,
  person,
  initialTab = PickerTab.Characters,
  provider,
  providerPhoto,
  error: initialError,
  initialCrop,
  initialSelectedId,
  onApply,
  onClose,
}: {
  device: Device;
  state: AvatarState;
  person: Person;
  initialTab?: PickerTab;
  provider?: SocialProvider;
  providerPhoto?: Photo;
  error?: UploadError;
  initialCrop?: Photo;
  initialSelectedId?: string;
  onApply: (next: AvatarState) => void;
  onClose: () => void;
}): ReactElement => {
  const [tab, setTab] = useState(initialTab);
  const [selectedId, setSelectedId] = useState(
    initialSelectedId ??
      displayedCharacter(state, person)?.id ??
      assignedFor(person).id,
  );
  const [crop, setCrop] = useState<Photo | undefined>(initialCrop);
  const [error, setError] = useState<UploadError | undefined>(initialError);

  useEffect(() => setError(initialError), [initialError]);

  const compact = isCompact(device);
  const isLaptop = device === Device.Laptop;
  const assigned = assignedFor(person);
  const draft: AvatarState = crop
    ? { source: AvatarSource.Upload, photo: crop }
    : tab === PickerTab.Characters
    ? selectedId === assigned.id
      ? { source: AvatarSource.Assigned }
      : { source: AvatarSource.Character, characterId: selectedId }
    : state;
  const draftCharacter = displayedCharacter(draft, person);
  const isUnchanged =
    !crop &&
    tab === PickerTab.Characters &&
    displayedCharacter(state, person)?.id === selectedId;

  const preview = (
    <div
      className={classNames(
        'flex items-center gap-4',
        isLaptop && 'flex-col text-center',
      )}
    >
      <AvatarImage state={draft} person={person} sizePx={isLaptop ? 120 : 56} />
      <div
        className={classNames(
          'flex min-w-0 flex-1 flex-col gap-0.5',
          isLaptop && 'items-center',
        )}
      >
        <span className="truncate font-bold typo-callout">
          {crop ? 'Your photo' : draftCharacter?.name ?? 'Your photo'}
        </span>
        <span className="ap-pretty text-text-tertiary typo-caption1">
          {crop ? 'Drag and zoom until it looks right.' : draftCharacter?.line}
        </span>
      </div>
      {!compact && (
        <PreviewSizes
          state={draft}
          person={person}
          scaleLargest={isLaptop ? 56 : 40}
        />
      )}
    </div>
  );

  const body = crop ? (
    <CropStep photo={crop} onChange={setCrop} sizePx={compact ? 240 : 260} />
  ) : (
    <>
      <div
        role="tablist"
        className="flex gap-1 self-start rounded-12 bg-surface-float p-1"
      >
        {[
          { value: PickerTab.Characters, label: 'Characters' },
          { value: PickerTab.Photo, label: 'Photo' },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={tab === option.value}
            onClick={() => setTab(option.value)}
            className={classNames(
              'ap-press rounded-8 px-3 py-1 font-bold typo-footnote',
              tab === option.value
                ? 'bg-background-default text-text-primary'
                : 'text-text-tertiary',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
      {tab === PickerTab.Characters ? (
        <CharactersTab
          state={state}
          person={person}
          selectedId={selectedId}
          onSelect={setSelectedId}
          compact={compact}
        />
      ) : (
        <PhotoTab
          device={device}
          error={error}
          state={state}
          provider={provider}
          providerPhoto={providerPhoto}
          onPhoto={(photo) => {
            setError(undefined);
            setCrop(photo);
          }}
          onError={setError}
          onUseProvider={() =>
            providerPhoto &&
            onApply({
              source: AvatarSource.Social,
              provider,
              photo: providerPhoto,
            })
          }
        />
      )}
    </>
  );

  const showFooter = crop || tab === PickerTab.Characters;
  const footer = showFooter && (
    <div
      className={classNames(
        'flex items-center gap-2 border-t border-border-subtlest-tertiary bg-background-default',
        compact ? 'px-4 pb-6 pt-3' : 'px-5 py-3',
      )}
    >
      {!compact && (
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Medium}
          onClick={crop ? () => setCrop(undefined) : onClose}
        >
          {crop ? 'Back' : 'Cancel'}
        </Button>
      )}
      <Button
        variant={ButtonVariant.Primary}
        size={compact ? ButtonSize.Large : ButtonSize.Medium}
        className={classNames(compact ? 'flex-1' : 'ml-auto')}
        disabled={isUnchanged}
        onClick={() => onApply(draft)}
      >
        {crop ? 'Use photo' : `Use ${draftCharacter?.name ?? 'photo'}`}
      </Button>
    </div>
  );

  const header = (
    <div className="flex items-center gap-2 px-5 pt-4">
      {crop && compact && (
        <Button
          variant={ButtonVariant.Tertiary}
          size={ButtonSize.Small}
          icon={<ArrowIcon className="-rotate-90" />}
          aria-label="Back"
          onClick={() => setCrop(undefined)}
        />
      )}
      <span className="flex-1 font-bold typo-body">
        {crop ? 'Position your photo' : 'Choose your avatar'}
      </span>
      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Small}
        icon={<MiniCloseIcon />}
        aria-label="Close"
        onClick={onClose}
      />
    </div>
  );

  if (compact) {
    return (
      <Overlay align="bottom" onClose={onClose}>
        <div
          role="dialog"
          aria-label="Choose your avatar"
          className="ep-sheet relative flex max-h-[92%] w-full flex-col rounded-t-24 border-t border-border-subtlest-tertiary bg-background-default"
        >
          <SheetHandle />
          {header}
          <div className="px-5 py-3">{preview}</div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-4">
            {body}
          </div>
          {footer}
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div
        role="dialog"
        aria-label="Choose your avatar"
        className={classNames(
          'ep-pop ap-elevated relative flex max-h-full w-full flex-col overflow-hidden rounded-24 border border-border-subtlest-tertiary bg-background-default',
          isLaptop ? 'max-w-[46rem]' : 'max-w-[32rem]',
        )}
      >
        {header}
        <div
          className={classNames(
            'flex min-h-0 flex-1',
            isLaptop ? 'flex-row' : 'flex-col',
          )}
        >
          <div
            className={classNames(
              'shrink-0 px-5 py-4',
              isLaptop &&
                'flex w-60 flex-col items-center justify-center gap-5 border-r border-border-subtlest-tertiary',
            )}
          >
            {preview}
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-5 pt-2">
            {body}
          </div>
        </div>
        {footer}
      </div>
    </Overlay>
  );
};

export const Toast = ({
  message,
  onUndo,
}: {
  message: string;
  onUndo?: () => void;
}): ReactElement => (
  <div
    role="status"
    className="ep-toast ap-elevated absolute bottom-6 left-1/2 z-3 flex -translate-x-1/2 items-center gap-3 rounded-14 bg-text-primary py-2 pl-4 pr-2 text-surface-invert typo-footnote"
  >
    <span className="whitespace-nowrap">{message}</span>
    {onUndo && (
      <button
        type="button"
        onClick={onUndo}
        className="rounded-10 px-2 py-1 font-bold hover:bg-overlay-float-cabbage"
      >
        Undo
      </button>
    )}
  </div>
);

/** A device-sized stage; overlays are positioned inside it. */
export const DeviceFrame = ({
  device,
  children,
  height,
}: {
  device: Device;
  children: ReactNode;
  height?: number;
}): ReactElement => {
  const spec = deviceSpec[device];
  return (
    <div
      style={{ width: spec.width, height: height ?? spec.height }}
      className={classNames(
        'relative shrink-0 overflow-hidden border border-border-subtlest-tertiary bg-background-default',
        device === Device.Mobile ? 'rounded-[2.25rem] border-4' : 'rounded-20',
      )}
    >
      {children}
    </div>
  );
};

/** Shrinks a fixed-size frame for overview grids without reflowing it. */
export const Scaled = ({
  scale,
  width,
  height,
  children,
}: {
  scale: number;
  width: number;
  height: number;
  children: ReactNode;
}): ReactElement => (
  <div style={{ width: width * scale, height: height * scale }}>
    <div
      style={{
        width,
        height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }}
    >
      {children}
    </div>
  </div>
);

/** Scales a fixed-size frame down to whatever width the page gives it. */
export const FitToWidth = ({
  width,
  height,
  children,
}: {
  width: number;
  height: number;
  children: ReactNode;
}): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }
    const observer = new ResizeObserver(([entry]) =>
      setScale(Math.min(1, entry.contentRect.width / width)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={ref} className="w-full min-w-0" style={{ maxWidth: width }}>
      <Scaled scale={scale} width={width} height={height}>
        {children}
      </Scaled>
    </div>
  );
};

const FieldStub = ({
  label,
  value,
}: {
  label: string;
  value: string;
}): ReactElement => (
  <div className="flex flex-col rounded-14 bg-surface-float px-4 py-2.5">
    <span className="text-text-tertiary typo-caption1">{label}</span>
    <span className="truncate text-text-primary typo-callout">{value}</span>
  </div>
);

const settingsNav = [
  'Profile',
  'Account',
  'Appearance',
  'Notifications',
  'Invite friends',
  'Privacy',
];

/** The Edit profile page at each breakpoint, with the avatar slot open. */
export const SettingsPageMock = ({
  device,
  person,
  avatar,
}: {
  device: Device;
  person: Person;
  avatar: ReactNode;
}): ReactElement => {
  const compact = isCompact(device);
  const content = (
    <div className="flex flex-col gap-6">
      <div className={classNames('relative', compact ? 'mb-20' : 'mb-16')}>
        <div className="h-24 rounded-16 bg-surface-float" />
        <div
          className={classNames(
            'absolute bottom-0 right-0 translate-y-1/2',
            compact ? 'left-4' : 'left-6',
          )}
        >
          {avatar}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <FieldStub label="Name" value={person.name} />
        <FieldStub label="Username" value={`@${person.username}`} />
        <FieldStub label="Headline" value="Platform engineer, coffee first" />
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-2 px-3 pb-2 pt-9">
          <Button
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Small}
            icon={<ArrowIcon className="-rotate-90" />}
            aria-label="Back"
          />
          <span className="flex-1 font-bold typo-title3">Profile</span>
          <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
            Save
          </Button>
        </div>
        <div className="flex-1 overflow-hidden px-4 pt-2">{content}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {device === Device.Laptop && (
        <nav className="flex w-52 shrink-0 flex-col gap-1 border-r border-border-subtlest-tertiary p-4">
          <span className="px-2 pb-2 font-bold typo-title3">Settings</span>
          {settingsNav.map((item) => (
            <span
              key={item}
              className={classNames(
                'rounded-10 px-2 py-1.5 typo-callout',
                item === 'Profile'
                  ? 'bg-surface-float font-bold text-text-primary'
                  : 'text-text-tertiary',
              )}
            >
              {item}
            </span>
          ))}
        </nav>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border-subtlest-tertiary px-6 py-3">
          <span className="flex-1 font-bold typo-title3">Profile</span>
          <Button variant={ButtonVariant.Primary} size={ButtonSize.Small}>
            Save
          </Button>
        </div>
        <div className="w-full max-w-[40rem] overflow-hidden p-6">
          {content}
        </div>
      </div>
    </div>
  );
};

/** The owner's view of their profile header, where a tap edits in place. */
export const OwnProfileMock = ({
  device,
  person,
  state,
  onAvatarClick,
  menu,
}: {
  device: Device;
  person: Person;
  state: AvatarState;
  onAvatarClick?: () => void;
  menu?: ReactNode;
}): ReactElement => {
  const compact = isCompact(device);
  const sizePx = compact ? 80 : 120;
  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <div className="h-36 bg-surface-float" />
        <div
          className={classNames(
            'absolute',
            compact ? 'left-4 top-28' : 'left-6 top-16',
          )}
        >
          <button
            type="button"
            onClick={onAvatarClick}
            aria-label="Change profile picture"
            className="ap-press relative block"
          >
            <AvatarImage
              state={state}
              person={person}
              sizePx={sizePx}
              radius={compact ? '1rem' : undefined}
              className="ring-4 ring-background-default"
            />
            <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-max border border-border-subtlest-tertiary bg-background-default shadow-2">
              <CameraIcon size={IconSize.Size16} />
            </span>
          </button>
          {menu}
        </div>
      </div>
      <div
        className={classNames(
          'flex flex-col gap-1',
          compact ? 'px-4 pt-14' : 'px-6 pt-20',
        )}
      >
        <div className="mb-2 ml-auto -mt-12 flex gap-2">
          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Small}
            icon={<EditIcon />}
            aria-label="Edit profile"
          />
        </div>
        <span className="font-bold typo-title2">{person.name}</span>
        <span className="text-text-tertiary typo-callout">
          @{person.username} · Joined June 2026
        </span>
      </div>
    </div>
  );
};

export { characterById, getCharacterSrc };
