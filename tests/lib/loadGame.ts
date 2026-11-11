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
  | 'civ1-barbarians'
  | 'civ1-city-improvement'
  | 'civ1-unit';

export type Package = Civ1Package | 'civ1-enhanced';

const registers: { [name in Package]: (game: Game) => void } = {
  'civ1-barbarians': registerBarbarians,
  'civ1-city-improvement': registerCityImprovement,
  'civ1-enhanced': registerEnhanced,
  'civ1-unit': registerUnit,
};

/** The order the plugin loader registers packages in: by name. */
export const pluginOrder: Package[] = (
  Object.keys(registers) as Package[]
).sort();

/**
 * A game with the Civ1 packages named (all three unless told otherwise) and this one registered against it, in the
 * order given: the plugin loader's, by name, unless told otherwise.
 */
export const loadGame = (
  packages: Civ1Package[] = [
    'civ1-barbarians',
    'civ1-city-improvement',
    'civ1-unit',
  ],
  order: Package[] = pluginOrder
): Game => {
  const game = new Game();

  order
    .filter(
      (name: Package): boolean =>
        name === 'civ1-enhanced' || packages.includes(name)
    )
    .forEach((name: Package): void => registers[name](game));

  return game;
};

/** A 5 × 5 Grassland world, built with the game's rules. */
export const buildWorld = async (game: Game): Promise<World> => {
  const world = new World(new FillGenerator(5, 5, Grassland), game.rules);

  await world.build();

  return world;
};

export default loadGame;
