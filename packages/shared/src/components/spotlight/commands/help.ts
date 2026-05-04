import { InfoIcon, KeyIcon } from '../../icons';
import { SpotlightGroup, type SpotlightCommand } from '../types';

interface HelpContext {
  showShortcutsHelp: () => void;
}

export const getHelpCommands = ({
  showShortcutsHelp,
}: HelpContext): SpotlightCommand[] => [
  {
    id: 'help.shortcuts',
    title: 'Show keyboard shortcuts',
    icon: KeyIcon,
    keywords: ['shortcuts', 'keys', 'help', 'hotkeys'],
    group: SpotlightGroup.Help,
    shortcut: '?',
    perform: showShortcutsHelp,
  },
  {
    id: 'help.about',
    title: 'About Spotlight',
    subtitle: 'Cmd+K to open from anywhere',
    icon: InfoIcon,
    keywords: ['about', 'help', 'spotlight'],
    group: SpotlightGroup.Help,
    perform: showShortcutsHelp,
  },
];
