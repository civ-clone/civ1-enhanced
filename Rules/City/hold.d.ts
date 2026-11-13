import { Game } from '@civ-clone/core-game';
import Hold from '@civ-clone/core-city-build/Rules/Hold';
/**
 * A city of size 1 doesn't complete Settlers until it is size 2, at every level and however many cities its player has:
 * the build stays, with its shields, which go on adding up, and is completed the first turn the city is size 2, which
 * the Settlers take it back to (civ-clone/web-renderer#959). A city that can never grow goes on adding shields to a
 * build it can't finish; that is taken over the city destroying itself.
 *
 * v474.05 holds them only on Chieftain (`civ1-unit`'s `city/hold/chieftain-settlers`, which this takes the place of
 * while `SETTLERS_WAIT_FOR_SIZE_TWO` is on). On the other levels it builds them: the player's only city keeps its
 * citizen, and any other is removed, the Settlers staying on its square (`civ1-unit`'s
 * `city/building-complete/settlers-shrink-city`, which never sees a size-1 city while this is on).
 */
export declare const getRules: (
  game: Pick<Game, 'cityGrowth' | 'rules'>
) => Hold[];
export default getRules;
