import type { ReactElement } from 'react';
import React, { useState } from 'react';
import {
  Typography,
  TypographyType,
  TypographyTag,
  TypographyColor,
} from '../../../../components/typography/Typography';
import { IconSize } from '../../../../components/Icon';
import {
  TerminalIcon,
  SettingsIcon,
  CameraIcon,
  EditIcon,
  PlusIcon,
} from '../../../../components/icons';
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../../../components/buttons/Button';

interface SetupImageProps {
  src: string;
  alt: string;
  caption?: string;
}

const SetupImage = ({ src, alt, caption }: SetupImageProps): ReactElement => (
  <div className="group relative overflow-hidden rounded-16">
    <div className="aspect-video w-full bg-surface-secondary">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    {caption && (
      <div className="from-overlay-dark-primary absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <Typography type={TypographyType.Footnote} bold className="text-white">
          {caption}
        </Typography>
      </div>
    )}
  </div>
);

interface ToolItemProps {
  name: string;
  category: string;
  iconUrl?: string;
}

const ToolItem = ({ name, category, iconUrl }: ToolItemProps): ReactElement => (
  <div className="flex items-center gap-3 rounded-12 border border-border-subtlest-tertiary p-3 transition-colors hover:border-border-subtlest-secondary">
    <div className="flex h-10 w-10 items-center justify-center rounded-10 bg-surface-float">
      {iconUrl ? (
        <img src={iconUrl} alt={name} className="h-6 w-6" loading="lazy" />
      ) : (
        <TerminalIcon size={IconSize.Medium} className="text-text-tertiary" />
      )}
    </div>
    <div className="flex flex-1 flex-col gap-0.5">
      <Typography type={TypographyType.Callout} bold>
        {name}
      </Typography>
      <Typography
        type={TypographyType.Caption1}
        color={TypographyColor.Quaternary}
      >
        {category}
      </Typography>
    </div>
  </div>
);

type TabType = 'workspace' | 'tools';

interface CategoryHeaderProps {
  title: string;
}

const CategoryHeader = ({ title }: CategoryHeaderProps): ReactElement => (
  <div className="group flex items-center gap-2">
    <Typography
      type={TypographyType.Footnote}
      color={TypographyColor.Tertiary}
      className="uppercase tracking-wider"
    >
      {title}
    </Typography>
    <Button
      variant={ButtonVariant.Tertiary}
      size={ButtonSize.XSmall}
      icon={<EditIcon />}
      className="opacity-0 group-hover:opacity-100"
    />
  </div>
);

export const SetupShowcase = (): ReactElement => {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');

  const tabs: { id: TabType; label: string; icon: ReactElement }[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: <CameraIcon size={IconSize.Small} />,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: <SettingsIcon size={IconSize.Small} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <Typography
          type={TypographyType.Body}
          tag={TypographyTag.H2}
          color={TypographyColor.Primary}
          bold
        >
          My Setup
        </Typography>
        <Button
          variant={ButtonVariant.Float}
          size={ButtonSize.Small}
          icon={<EditIcon />}
        >
          Edit
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-14 border border-border-subtlest-tertiary p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-12 px-4 py-2 transition-colors ${
              activeTab === tab.id
                ? 'bg-surface-float text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab.icon}
            <Typography type={TypographyType.Callout} bold>
              {tab.label}
            </Typography>
          </button>
        ))}
      </div>

      {/* Workspace Tab */}
      {activeTab === 'workspace' && (
        <div className="flex flex-col gap-3">
          <SetupImage
            src="https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&q=80"
            alt="My workspace"
            caption="Home office setup - where the magic happens"
          />
          <div className="grid grid-cols-2 gap-3">
            <SetupImage
              src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&q=80"
              alt="Monitor setup"
              caption="Dual monitor life"
            />
            <SetupImage
              src="https://images.unsplash.com/photo-1595225476474-87563907a212?w=400&q=80"
              alt="Mechanical keyboard"
              caption="Keychron K2 with custom keycaps"
            />
            <button
              type="button"
              className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-16 border-2 border-dashed border-border-subtlest-tertiary bg-transparent text-text-tertiary transition-colors hover:border-border-subtlest-secondary hover:bg-surface-float hover:text-text-secondary"
            >
              <CameraIcon size={IconSize.Large} />
              <Typography type={TypographyType.Callout} bold>
                Add photo
              </Typography>
            </button>
          </div>
          <div className="rounded-16 border border-border-subtlest-tertiary p-4">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mb-3 uppercase tracking-wider"
            >
              Gear Highlights
            </Typography>
            <div className="flex flex-wrap gap-2">
              {[
                'MacBook Pro 16"',
                'LG 27" 4K Monitor',
                'Keychron K2',
                'Logitech MX Master 3',
                'Herman Miller Aeron',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-10 border border-border-subtlest-tertiary px-3 py-1.5"
                >
                  <Typography type={TypographyType.Footnote} bold>
                    {item}
                  </Typography>
                </span>
              ))}
              <button
                type="button"
                className="flex items-center gap-1 rounded-10 border border-dashed border-border-subtlest-tertiary px-3 py-1.5 text-text-tertiary transition-colors hover:border-border-subtlest-secondary hover:text-text-secondary"
              >
                <PlusIcon size={IconSize.XSmall} />
                <Typography type={TypographyType.Footnote}>Add</Typography>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <CategoryHeader title="Development" />
            <div className="grid gap-2 tablet:grid-cols-2">
              <ToolItem
                name="VS Code"
                category="Editor"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg"
              />
              <ToolItem
                name="Neovim"
                category="Terminal Editor"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/neovim/neovim-original.svg"
              />
              <ToolItem
                name="Docker"
                category="Containers"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
              />
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                className="!justify-start"
              >
                Add tool
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <CategoryHeader title="Productivity" />
            <div className="grid gap-2 tablet:grid-cols-2">
              <ToolItem
                name="Raycast"
                category="Launcher"
                iconUrl="https://avatars.githubusercontent.com/u/55939892?s=200"
              />
              <ToolItem
                name="Linear"
                category="Project Management"
                iconUrl="https://avatars.githubusercontent.com/u/60181045?s=200"
              />
              <Button
                variant={ButtonVariant.Float}
                size={ButtonSize.Small}
                icon={<PlusIcon />}
                className="!justify-start"
              >
                Add tool
              </Button>
            </div>
          </div>

          <Button
            variant={ButtonVariant.Float}
            size={ButtonSize.Medium}
            icon={<PlusIcon />}
            className="self-start"
          >
            Add category
          </Button>
        </div>
      )}
    </div>
  );
};
