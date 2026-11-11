import { Game, GameSlots } from '@civ-clone/core-game/Game';
import World from '@civ-clone/core-world/World';
/** The Civ1 packages whose rules this one's sets change. */
export type Civ1Package =
  | 'civ1-barbarians'
  | 'civ1-city'
  | 'civ1-city-improvement'
  | 'civ1-unit';
export type Package = Civ1Package | 'civ1-enhanced';
/** The order the plugin loader registers packages in: by name. */
export declare const pluginOrder: Package[];
/** Every Civ1 package whose rules this one's sets change. */
export declare const civ1Packages: Civ1Package[];
/**
 * A game with the Civ1 packages named (all of them unless told otherwise) and this one registered against it, in the
 * order given: the plugin loader's, by name, unless told otherwise. `slots` are the game's own, such as its `rng`.
 */
export declare const loadGame: (
  packages?: Civ1Package[],
  order?: Package[],
  slots?: Partial<GameSlots>
) => Game;
/** A Grassland world, 5 × 5 unless told otherwise, built with the game's rules. */
export declare const buildWorld: (game: Game, size?: number) => Promise<World>;
export default loadGame;
/**
 * A random number generator for a game's `rng` that returns `rolls` in turn, then `then`. `rolls` is the array itself,
 * so a test can add to it, and see what is left.
 */
export declare const scriptedRng: (
  rolls: number[],
  then?: number
) => GameSlots['rng'];
