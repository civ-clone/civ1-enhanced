import { Game, GameSlots } from '@civ-clone/core-game/Game';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Grassland } from '@civ-clone/civ1-world/Terrains';
import World from '@civ-clone/core-world/World';
import registerBarbarians from '@civ-clone/civ1-barbarians/registerRules';
import registerCity from '@civ-clone/civ1-city/registerRules';
import registerCityImprovement from '@civ-clone/civ1-city-improvement/registerRules';
import * as Advances from '@civ-clone/civ1-science/Advances';
import registerEnhanced from '../../registerRules';
import registerUnit from '@civ-clone/civ1-unit/registerRules';
import registerWonder from '@civ-clone/civ1-wonder/registerRules';

/** The Civ1 packages whose rules this one's sets change, or whose entries they read. */
export type Civ1Package =
  | 'civ1-barbarians'
  | 'civ1-city'
  | 'civ1-city-improvement'
  | 'civ1-science'
  | 'civ1-unit'
  | 'civ1-wonder';

export type Package = Civ1Package | 'civ1-enhanced';

const registers: { [name in Package]: (game: Game) => void } = {
  'civ1-barbarians': registerBarbarians,
  'civ1-city': registerCity,
  'civ1-city-improvement': registerCityImprovement,
  'civ1-enhanced': registerEnhanced,
  // Its advances too, which the package registers into the default game's registry when imported. Required only
  //  when asked for: importing `registerRules` registers its rules into the default game, which other tests use.
  'civ1-science': (game: Game): void => {
    game.advances.register(...Object.values(Advances));
    require('@civ-clone/civ1-science/registerRules').register(game);
  },
  'civ1-unit': registerUnit,
  'civ1-wonder': registerWonder,
};

/** The order the plugin loader registers packages in: by name. */
export const pluginOrder: Package[] = (
  Object.keys(registers) as Package[]
).sort();

/** Every Civ1 package whose rules this one's sets change. */
export const civ1Packages: Civ1Package[] = [
  'civ1-barbarians',
  'civ1-city',
  'civ1-city-improvement',
  'civ1-unit',
  'civ1-wonder',
];

/**
 * Those and `civ1-science`, whose cost rule `FIXED_RESEARCH_COSTS` takes the place of: for the tests of every set
 * together. Not loaded by the others, as its rule giving each player added research would clash with theirs.
 */
export const everyPackage: Civ1Package[] = [...civ1Packages, 'civ1-science'];

/**
 * A game with the Civ1 packages named (all of them unless told otherwise) and this one registered against it, in the
 * order given: the plugin loader's, by name, unless told otherwise. `slots` are the game's own, such as its `rng`.
 */
export const loadGame = (
  packages: Civ1Package[] = civ1Packages,
  order: Package[] = pluginOrder,
  slots: Partial<GameSlots> = {}
): Game => {
  const game = new Game(slots);

  order
    .filter(
      (name: Package): boolean =>
        name === 'civ1-enhanced' || packages.includes(name)
    )
    .forEach((name: Package): void => registers[name](game));

  return game;
};

/** A Grassland world, 5 × 5 unless told otherwise, built with the game's rules. */
export const buildWorld = async (
  game: Game,
  size: number = 5
): Promise<World> => {
  const world = new World(new FillGenerator(size, size, Grassland), game.rules);

  await world.build();

  return world;
};

export default loadGame;

/**
 * A random number generator for a game's `rng` that returns `rolls` in turn, then `then`. `rolls` is the array itself,
 * so a test can add to it, and see what is left.
 */
export const scriptedRng = (
  rolls: number[],
  then: number = 0
): GameSlots['rng'] => {
  let calls = 0;

  return Object.assign(
    (): number => {
      calls++;

      return rolls.length > 0 ? rolls.shift()! : then;
    },
    {
      calls: (): number => calls,
      restore: (): void => {},
      seed: (): number => 0,
    }
  );
};
