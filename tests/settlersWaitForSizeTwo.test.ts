import {
  CHIEFTAIN_SETTLERS_RULE as CIV1_CHIEFTAIN_SETTLERS,
  SETTLERS_SHRINK_CITY_RULE as CIV1_SETTLERS_SHRINK_CITY,
} from '@civ-clone/civ1-unit/RuleIds';
import {
  Chieftain,
  Emperor,
  King,
} from '@civ-clone/civ1-difficulty/Difficulties';
import { ENHANCED, SETTLERS_WAIT_FOR_SIZE_TWO } from '../RuleSets';
import loadGame, { Package, buildWorld, pluginOrder } from './lib/loadGame';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Game } from '@civ-clone/core-game/Game';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import { Production } from '@civ-clone/civ1-world/Yields';
import { SETTLERS_WAIT_RULE } from '../RuleIds';
import { Settlers } from '@civ-clone/civ1-unit/Units';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';

// A game with civ1-city's and civ1-unit's rules and this package's, loaded in `order` (the plugin loader's unless
//  told), at `level` (none set unless told), with `sets` switched as given, and one player whose cities are at `at`,
//  the first building Settlers at `size`.
type Level = Parameters<Game['difficulty']['set']>[0];

const setUp = async ({
  level = null,
  sets = [],
  size = 1,
  at = [[2, 2]],
  order = pluginOrder,
}: {
  level?: Level | null;
  sets?: [string, boolean][];
  size?: number;
  at?: [number, number][];
  order?: Package[];
} = {}) => {
  const game: Game = loadGame(['civ1-city', 'civ1-unit'], order),
    world = await buildWorld(game, 9),
    player = new Player(game.rules);

  sets.forEach((set): void => game.ruleSets.set(...set));

  if (level !== null) {
    game.difficulty.set(level);
  }

  game.players.register(player);
  game.playerWorlds.register(new PlayerWorld(player, world, game.rules));
  game.playerGovernments.register(
    new PlayerGovernment(player, game.availableGovernments, game.rules)
  );
  game.playerResearch.register(
    new PlayerResearch(player, new AdvanceRegistry(), game.rules)
  );
  game.availableCityBuildItems.register(
    Settlers as unknown as typeof Buildable
  );

  const [city, ...others] = at.map(
      ([x, y], index): City =>
        new City(player, world.get(x, y), `City ${index}`, game.rules)
    ),
    cityBuild: CityBuild = game.cityBuilds.getByCity(city),
    cityGrowth = game.cityGrowth.getByCity(city);

  for (let grown = 1; grown < size; grown++) {
    cityGrowth.grow();
  }

  cityBuild.build(Settlers as unknown as typeof Buildable);

  // Paid for, and checked, as a turn's production is.
  const produce = (shields: number = cityBuild.remaining()) => {
    cityBuild.add(new Production(shields));

    return cityBuild.check() as Unit | null;
  };

  return { city, cityBuild, cityGrowth, game, others, produce };
};

const levels: [string, Level | null][] = [
  ['Chieftain', Chieftain],
  ['King', King],
  ['Emperor', Emperor],
  ['no level set (King)', null],
];

// What v474.05 does, which `civ1-unit` holds: tested there, and here only as far as shows the set switched off.
const asTheOriginal = (sets: [string, boolean][]): void => {
  it("should hold Settlers in a size-1 city on Chieftain, for v474.05's reason", async (): Promise<void> => {
    const { cityBuild, produce } = await setUp({ level: Chieftain, sets });

    expect(produce()).null;
    expect(cityBuild.held()).eql([CIV1_CHIEFTAIN_SETTLERS]);
  });

  it("should build them on King in the player's only city, which keeps its citizen", async (): Promise<void> => {
    const { city, cityGrowth, produce } = await setUp({ level: King, sets });

    expect(produce()).instanceof(Settlers);
    expect(city.destroyed()).false;
    expect(cityGrowth.size()).equal(1);
  });

  it('should remove the city on King when the player has others, the Settlers staying on its square', async (): Promise<void> => {
    const { city, others, produce } = await setUp({
      level: King,
      sets,
      at: [
        [2, 2],
        [6, 6],
      ],
    });
    const settlers = produce()!;

    expect(city.destroyed()).true;
    expect(settlers.destroyed()).false;
    expect(settlers.tile()).equal(city.tile());
    expect(settlers.city()).equal(others[0]);
  });
};

describe('Settlers in a city of size 1 (civ-clone/web-renderer#959)', (): void => {
  describe('held until it is size 2, by default', (): void => {
    it('should be on', (): void => {
      const game = loadGame(['civ1-unit']);

      expect(game.ruleSets.state(SETTLERS_WAIT_FOR_SIZE_TWO)).to.equal('on');
      expect(game.rules.getById(SETTLERS_WAIT_RULE)!.enabled()).true;
      expect(game.rules.getById(CIV1_CHIEFTAIN_SETTLERS)!.enabled()).false;
      // Never reached for a size-1 city while the set is on, so left running for larger ones.
      expect(game.rules.getById(CIV1_SETTLERS_SHRINK_CITY)!.enabled()).true;
    });

    levels.forEach(([name, level]): void => {
      it(`should hold them, with the shields, which go on adding up, on ${name}, in the player's only city or not`, async (): Promise<void> => {
        for (const at of [
          [[2, 2]],
          [
            [2, 2],
            [6, 6],
          ],
        ] as [number, number][][]) {
          const { city, cityBuild, cityGrowth, game, produce } = await setUp({
            level,
            at,
          });

          expect(produce(), name).null;
          expect(produce(5), name).null;
          expect(cityBuild.building()!.item(), name).equal(Settlers);
          expect(cityBuild.cleared(), name).null;
          expect(cityBuild.progress().value(), name).equal(
            cityBuild.cost().value() + 5
          );
          // One reason, this set's, on Chieftain too.
          expect(cityBuild.held(), name).eql([SETTLERS_WAIT_RULE]);
          expect(city.destroyed(), name).false;
          expect(cityGrowth.size(), name).equal(1);
          expect(game.units.getByCity(city), name).length(0);
        }
      });
    });

    it('should complete them once the city is size 2, which they take it back to', async (): Promise<void> => {
      const { city, cityBuild, cityGrowth, game, produce } = await setUp({
        at: [
          [2, 2],
          [6, 6],
        ],
      });

      expect(produce()).null;

      cityGrowth.grow();

      expect(cityBuild.held()).eql([]);

      const settlers = produce(0);

      expect(settlers).instanceof(Settlers);
      expect(cityBuild.cleared()).eql({ reason: 'completed', item: Settlers });
      expect(cityGrowth.size()).equal(1);
      expect(city.destroyed()).false;
      expect(game.units.getByCity(city)).eql([settlers]);
    });

    it('should take a citizen from a larger city, as before', async (): Promise<void> => {
      const { cityBuild, cityGrowth, produce } = await setUp({ size: 3 });

      expect(cityBuild.held()).eql([]);
      expect(produce()).instanceof(Settlers);
      expect(cityGrowth.size()).equal(2);
    });

    (
      [
        [
          'with civ1-enhanced first',
          ['civ1-enhanced', 'civ1-city', 'civ1-unit'],
        ],
        [
          'with civ1-enhanced last',
          ['civ1-city', 'civ1-unit', 'civ1-enhanced'],
        ],
      ] as [string, Package[]][]
    ).forEach(([name, order]): void => {
      it(`should hold them for this set's reason alone on Chieftain, loaded ${name}`, async (): Promise<void> => {
        const { cityBuild, produce } = await setUp({
          level: Chieftain,
          order,
        });

        expect(produce()).null;
        expect(cityBuild.held()).eql([SETTLERS_WAIT_RULE]);
      });
    });
  });

  (
    [
      ['switched off', [[SETTLERS_WAIT_FOR_SIZE_TWO, false]]],
      ['with the parent switched off', [[ENHANCED, false]]],
    ] as [string, [string, boolean][]][]
  ).forEach(([name, sets]): void => {
    describe(`as v474.05, ${name}`, (): void => {
      it('should leave only the Chieftain rule running', (): void => {
        const game = loadGame(['civ1-unit']);

        sets.forEach((set): void => game.ruleSets.set(...set));

        expect(game.ruleSets.state(SETTLERS_WAIT_FOR_SIZE_TWO)).to.equal('off');
        expect(game.rules.getById(SETTLERS_WAIT_RULE)!.enabled()).false;
        expect(game.rules.getById(CIV1_CHIEFTAIN_SETTLERS)!.enabled()).true;
      });

      asTheOriginal(sets);
    });
  });
});
