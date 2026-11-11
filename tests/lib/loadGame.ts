import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import World from '@civ-clone/core-world/World';
import registerBarbarians from '@civ-clone/civ1-barbarians/registerRules';
import registerCityImprovement from '@civ-clone/civ1-city-improvement/registerRules';
import registerEnhanced from '../../registerRules';
import registerUnit from '@civ-clone/civ1-unit/registerRules';

/** The Civ1 packages whose rules this one's sets change. */
export type Civ1Package =
  | 'civ1-city-improvement'
  | 'civ1-unit'
  | 'civ1-barbarians';

const registers: [Civ1Package, (game: Game) => void][] = [
  ['civ1-city-improvement', registerCityImprovement],
  ['civ1-unit', registerUnit],
  ['civ1-barbarians', registerBarbarians],
];

/**
 * A game with the Civ1 packages named (all three unless told otherwise), then this one, registered against it, in the
 * order the plugin loader takes them, by name.
 */
export const loadGame = (
  packages: Civ1Package[] = registers.map(([name]) => name)
): Game => {
  const game = new Game();

  registers
    .filter(([name]) => packages.includes(name))
    .forEach(([, register]) => register(game));

  registerEnhanced(game);

  return game;
};

/** A 5 × 5 Grassland world, built with the game's rules. */
export const buildWorld = async (game: Game): Promise<World> => {
  const world = new World(new FillGenerator(5, 5, Grassland), game.rules);

  await world.build();

  return world;
};

export default loadGame;
