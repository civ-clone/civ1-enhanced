import { Game } from '@civ-clone/core-game/Game';
import World from '@civ-clone/core-world/World';
/** The Civ1 packages whose rules this one's sets change. */
export type Civ1Package =
  | 'civ1-barbarians'
  | 'civ1-city-improvement'
  | 'civ1-unit';
export type Package = Civ1Package | 'civ1-enhanced';
/** The order the plugin loader registers packages in: by name. */
export declare const pluginOrder: Package[];
/**
 * A game with the Civ1 packages named (all three unless told otherwise) and this one registered against it, in the
 * order given: the plugin loader's, by name, unless told otherwise.
 */
export declare const loadGame: (
  packages?: Civ1Package[],
  order?: Package[]
) => Game;
/** A 5 × 5 Grassland world, built with the game's rules. */
export declare const buildWorld: (game: Game) => Promise<World>;
export default loadGame;
