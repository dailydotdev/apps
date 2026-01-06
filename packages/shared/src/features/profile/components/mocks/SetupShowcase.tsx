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
  LinkIcon,
  CameraIcon,
} from '../../../../components/icons';

interface SetupImageProps {
  src: string;
  alt: string;
  caption?: string;
}

const SetupImage = ({ src, alt, caption }: SetupImageProps): ReactElement => (
  <div className="group relative overflow-hidden rounded-12">
    <div className="aspect-video w-full bg-surface-secondary">
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
    {caption && (
      <div className="from-black/70 absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="text-white typo-footnote">{caption}</span>
      </div>
    )}
  </div>
);

interface ToolItemProps {
  name: string;
  category: string;
  iconUrl?: string;
  iconBg?: string;
}

const ToolItem = ({
  name,
  category,
  iconUrl,
  iconBg = 'bg-surface-secondary',
}: ToolItemProps): ReactElement => (
  <div className="flex items-center gap-3 rounded-10 bg-surface-float p-2">
    <div
      className={`flex h-8 w-8 items-center justify-center rounded-8 ${iconBg}`}
    >
      {iconUrl ? (
        <img src={iconUrl} alt={name} className="h-5 w-5" loading="lazy" />
      ) : (
        <TerminalIcon size={IconSize.Small} className="text-text-tertiary" />
      )}
    </div>
    <div className="flex flex-1 flex-col">
      <span className="font-medium text-text-primary typo-callout">{name}</span>
      <span className="text-text-quaternary typo-footnote">{category}</span>
    </div>
  </div>
);

type TabType = 'workspace' | 'terminal' | 'tools';

export const SetupShowcase = (): ReactElement => {
  const [activeTab, setActiveTab] = useState<TabType>('workspace');

  const tabs: { id: TabType; label: string; icon: ReactElement }[] = [
    {
      id: 'workspace',
      label: 'Workspace',
      icon: <CameraIcon size={IconSize.Small} />,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <TerminalIcon size={IconSize.Small} />,
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: <SettingsIcon size={IconSize.Small} />,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4">
      <Typography
        type={TypographyType.Body}
        tag={TypographyTag.H2}
        color={TypographyColor.Primary}
        bold
      >
        My Setup
      </Typography>

      {/* Tab Navigation */}
      <div className="flex gap-1 rounded-12 bg-surface-float p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-10 px-3 py-2 transition-colors ${
              activeTab === tab.id
                ? 'shadow-sm bg-background-default text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary'
            }`}
          >
            {tab.icon}
            <span className="typo-callout">{tab.label}</span>
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
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          <div className="rounded-12 bg-surface-float p-3">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="mb-2 uppercase tracking-wider"
            >
              Gear Highlights
            </Typography>
            <div className="flex flex-wrap gap-2">
              {[
                'MacBook Pro 16"',
                'LG 27" 4K Monitor',
                'Keychron K2',
                'Logitech MX Master 3',
                'Elgato Wave:3',
                'Herman Miller Aeron',
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-8 border border-border-subtlest-tertiary px-2 py-1 text-text-secondary typo-footnote"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Terminal Tab */}
      {activeTab === 'terminal' && (
        <div className="flex flex-col gap-3">
          {/* Mock Terminal Screenshot */}
          <div className="overflow-hidden rounded-12 border border-border-subtlest-tertiary">
            <div className="flex items-center gap-2 bg-surface-secondary px-4 py-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-status-error" />
                <span className="h-3 w-3 rounded-full bg-status-warning" />
                <span className="h-3 w-3 rounded-full bg-status-success" />
              </div>
              <span className="text-text-tertiary typo-footnote">
                ~ zsh — idoshamun@macbook
              </span>
            </div>
            <div className="bg-[#1a1b26] p-4 font-mono text-sm">
              <div className="text-[#7aa2f7]">❯ neofetch</div>
              <div className="mt-2 flex gap-4">
                <pre className="text-[#bb9af7]">
                  {`    .:'
  _ :'_
.'  \`' \`.
:  ._   :
.  : ;_  ;
\`. ^^/ .'
 \`'--'\``}
                </pre>
                <div className="text-[#a9b1d6]">
                  <div>
                    <span className="text-[#7aa2f7]">OS:</span> macOS 14.2
                    Sonoma
                  </div>
                  <div>
                    <span className="text-[#7aa2f7]">Shell:</span> zsh 5.9
                  </div>
                  <div>
                    <span className="text-[#7aa2f7]">Terminal:</span> WezTerm
                  </div>
                  <div>
                    <span className="text-[#7aa2f7]">Editor:</span> Neovim
                  </div>
                  <div>
                    <span className="text-[#7aa2f7]">Theme:</span> Tokyo Night
                  </div>
                  <div>
                    <span className="text-[#7aa2f7]">Font:</span> JetBrains Mono
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[#7aa2f7]">
                ❯ <span className="animate-pulse">_</span>
              </div>
            </div>
          </div>

          {/* Dotfiles Link */}
          <a
            href="https://github.com/idoshamun/dotfiles"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-12 border border-border-subtlest-tertiary p-3 transition-colors hover:bg-surface-float"
          >
            <div className="flex items-center gap-3">
              <SettingsIcon
                size={IconSize.Medium}
                className="text-text-tertiary"
              />
              <div className="flex flex-col">
                <span className="font-medium text-text-primary typo-callout">
                  My Dotfiles
                </span>
                <span className="text-text-tertiary typo-footnote">
                  github.com/idoshamun/dotfiles
                </span>
              </div>
            </div>
            <LinkIcon size={IconSize.Small} className="text-text-tertiary" />
          </a>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="uppercase tracking-wider"
            >
              Development
            </Typography>
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
                name="iTerm2"
                category="Terminal"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg"
              />
              <ToolItem
                name="Docker"
                category="Containers"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="uppercase tracking-wider"
            >
              Productivity
            </Typography>
            <div className="grid gap-2 tablet:grid-cols-2">
              <ToolItem
                name="Raycast"
                category="Launcher"
                iconUrl="https://avatars.githubusercontent.com/u/55939892?s=200"
              />
              <ToolItem
                name="Chrome"
                category="Browser"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg"
              />
              <ToolItem
                name="Notion"
                category="Notes"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/notion/notion-original.svg"
              />
              <ToolItem
                name="Linear"
                category="Project Management"
                iconUrl="https://avatars.githubusercontent.com/u/60181045?s=200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Typography
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
              className="uppercase tracking-wider"
            >
              Design
            </Typography>
            <div className="grid gap-2 tablet:grid-cols-2">
              <ToolItem
                name="Figma"
                category="Design"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg"
              />
              <ToolItem
                name="Sketch"
                category="Design"
                iconUrl="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sketch/sketch-original.svg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
