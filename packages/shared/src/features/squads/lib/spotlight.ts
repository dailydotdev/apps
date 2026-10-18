import type { Squad } from '../../../graphql/sources';
import type { SpotlightSource } from '../../../components/spotlight/types';

export const getSquadSpotlightSource = (
  squad: Pick<Squad, 'id' | 'handle' | 'name' | 'image'>,
): SpotlightSource => ({
  id: squad.id ?? '',
  handle: squad.handle,
  name: squad.name,
  image: squad.image,
});
