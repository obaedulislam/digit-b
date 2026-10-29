import { createElement } from 'react';
import {
  IconBriefcase,
  IconChartLine,
  IconClock,
  IconCrown,
  IconFileText,
  IconHeartHandshake,
  IconHexagon,
  IconPuzzle,
  IconSchool,
  IconSearch,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';

// Service `icon` is an admin-editable string key; unknown keys fall back to a neutral node.
const SERVICE_ICONS = {
  users: IconUsers,
  chart: IconChartLine,
  search: IconSearch,
  puzzle: IconPuzzle,
  briefcase: IconBriefcase,
  crown: IconCrown,
  clock: IconClock,
  handshake: IconHeartHandshake,
  'file-text': IconFileText,
  wallet: IconWallet,
  'graduation-cap': IconSchool,
};

/** Renders the icon for a service `icon` key (props pass through to the Tabler icon). */
export const renderServiceIcon = (key, props) => createElement(SERVICE_ICONS[key] ?? IconHexagon, props);
