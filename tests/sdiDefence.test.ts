import { ENHANCED, SDI_DEFENSE_SPARES_CITIES } from '../RuleSets';
import loadGame, { Package, buildWorld, pluginOrder } from './lib/loadGame';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Detonated from '@civ-clone/base-unit-action-nuclear-attack/Rules/Detonated';
import { Game } from '@civ-clone/core-game/Game';
import { HALVE_CITIES_RULE } from '../RuleIds';
import { HALVE_CITIES_RULE as CIV1_HALVE_CITIES } from '@civ-clone/civ1-unit/RuleIds';
import NuclearAttack from '@civ-clone/base-unit-action-nuclear-attack/NuclearAttack';
import { Nuclear, Warrior } from '@civ-clone/civ1-unit/Units';
import Player from '@civ-clone/core-player/Player';
import { SdiDefence } from '@civ-clone/library-city/CityImprovements';
import Tile from '@civ-clone/core-world/Tile';
import { expect } from 'chai';

// A nuclear detonation over (3, 3) of a 7 × 7 world, by `player`, with an `enemy` city of size 8 there with SDI
//  Defense and a unit in it, and one of size 6 next to it without, in a game with civ1-unit's rules and this
//  package's, loaded in `order`, with `set` switched as given (left as it starts unless told).
const setUp = async (
  set: [string, boolean] | null = null,
  order: Package[] = pluginOrder
) => {
  const game: Game = loadGame(['civ1-unit'], order),
    world = await buildWorld(game, 7),
    player = new Player(game.rules),
    enemy = new Player(game.rules),
    city = (tile: Tile, size: number): City => {
      const created = new City(enemy, tile, 'City', game.rules),
        cityGrowth = new CityGrowth(created, game.rules);

      game.cities.register(created);
      game.cityGrowth.register(cityGrowth);

      while (cityGrowth.size() < size) {
        cityGrowth.grow();
      }

      return created;
    };

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  const shielded = city(world.get(3, 3), 8),
    exposed = city(world.get(4, 3), 6),
    defender = new Warrior(null, enemy, shielded.tile(), game.rules),
    nuke = new Nuclear(null, player, world.get(2, 3), game.rules);

  game.cityImprovements.register(new SdiDefence(shielded, game.rules));

  return {
    defender,
    exposed,
    game,
    shielded,
    size: (target: City): number => game.cityGrowth.getByCity(target).size(),
    // The rules a detonation runs, in the order it runs them.
    order: (): string[] =>
      game.rules
        .get(Detonated)
        .filter((rule) => rule.enabled())
        .map((rule) => rule.id()!),
    detonate: (): void => {
      game.rules.process(
        Detonated,
        nuke,
        shielded.tile(),
        new NuclearAttack(
          nuke.tile(),
          shielded.tile(),
          nuke,
          game.rules
        ) as never
      );
    },
  };
};

describe('SDI Defense spares cities (civ-clone/web-renderer#960)', (): void => {
  (
    [
      ['by default', null],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean] | null][]
  ).forEach(([name, set]): void => {
    describe(`a city with SDI Defense halved all the same, as v474.05, ${name}`, (): void => {
      it('should be off', async (): Promise<void> => {
        const { game } = await setUp(set);

        expect(game.ruleSets.state(SDI_DEFENSE_SPARES_CITIES)).to.equal('off');
      });

      it("should halve every city in the area, sparing only the SDI Defense city's units", async (): Promise<void> => {
        const { defender, detonate, exposed, shielded, size } = await setUp(
          set
        );

        detonate();

        expect(size(shielded)).to.equal(4);
        expect(size(exposed)).to.equal(3);
        expect(defender.destroyed()).false;
      });
    });
  });

  describe('a city with SDI Defense keeps its size, switched on', (): void => {
    const on: [string, boolean] = [SDI_DEFENSE_SPARES_CITIES, true];

    it('should spare the SDI Defense city its size and its units, and halve the rest', async (): Promise<void> => {
      const { defender, detonate, exposed, shielded, size } = await setUp(on);

      detonate();

      expect(size(shielded)).to.equal(8);
      expect(size(exposed)).to.equal(3);
      expect(defender.destroyed()).false;
    });

    it('should halve the cities where the Civ1 rule does, after the units and before the fallout, whichever package loads first', async (): Promise<void> => {
      const expected = [
        'civ1-unit:unit/detonated/emit',
        'civ1-unit:unit/detonated/destroy-units',
        HALVE_CITIES_RULE,
        'civ1-unit:unit/detonated/fallout',
      ];

      expect((await setUp(on)).order()).to.eql(expected);
      expect(
        (
          await setUp(on, [
            ...pluginOrder.filter((name) => name !== 'civ1-enhanced'),
            'civ1-enhanced',
          ])
        ).order()
      ).to.eql(expected);
      expect((await setUp()).order()).to.eql(
        expected.map((id) =>
          id === HALVE_CITIES_RULE ? CIV1_HALVE_CITIES : id
        )
      );
    });
  });
});
