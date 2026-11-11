import { Game } from '@civ-clone/core-game/Game';
import World from '@civ-clone/core-world/World';
/** The Civ1 packages whose rules this one's sets change. */
export type Civ1Package =
  | 'civ1-city-improvement'
  | 'civ1-unit'
  | 'civ1-barbarians';
/**
 * A game with the Civ1 packages named (all three unless told otherwise), then this one, registered against it, in the
 * order the plugin loader takes them, by name.
 */
export declare const loadGame: (packages?: Civ1Package[]) => Game;
/** A 5 × 5 Grassland world, built with the game's rules. */
export declare const buildWorld: (game: Game) => Promise<World>;
export default loadGame;
