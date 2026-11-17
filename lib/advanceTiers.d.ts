import Advance from '@civ-clone/core-science/Advance';
import { Game } from '@civ-clone/core-game/Game';
/** The parts of a game an advance's tier is read from. */
export type TiersGame = Pick<Game, 'advances' | 'requirements'>;
/**
 * Which of `researchTiers` each advance that can't be repeated is in, by its index, for the fixed costs
 * (civ-clone/web-renderer#1072) and the ages (civ-clone/web-renderer#1076) alike.
 *
 * Read from the game's advances and `requires` entries when first asked for: this package is loaded before
 * `civ1-science`, so they aren't there yet when it registers, and a plugin's changes to them count. Kept for the game
 * only once some advance needs another, so an answer asked for before the entries are added isn't kept for good.
 */
export declare const advanceTiers: (
  game: TiersGame
) => Map<typeof Advance, number>;
export default advanceTiers;
