import type { Squad } from '../../../graphql/sources';
import { isCompanySquad } from './features';

// Free company pages carry the flag; plan and Enterprise pages may predate it
export const isCompanyPage = (
  squad: Pick<Squad, 'flags' | 'features'>,
): boolean => !!squad.flags?.company || isCompanySquad(squad);
