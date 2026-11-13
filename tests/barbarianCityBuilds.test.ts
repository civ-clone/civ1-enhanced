import { BARBARIAN_CITY_BUILDS, ENHANCED } from '../RuleSets';
import {
  Battleship,
  Caravan,
  Diplomat,
  Horseman,
  Knight,
  Settlers,
  Swordman,
  Trireme,
  Warrior,
} from '@civ-clone/civ1-unit/Units';
import loadGame, { buildWorld } from './lib/loadGame';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Build from '@civ-clone/core-city-build/Rules/Build';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import City from '@civ-clone/core-city/City';
import Explosives from '@civ-clone/base-science-advance-explosives/Explosives';
import { Game } from '@civ-clone/core-game/Game';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Unit from '@civ-clone/core-unit/Unit';
import * as Units from '@civ-clone/civ1-unit/Units';
import { availableToBarbarians, neverBarbarian } from '../Rules/City/build';
import { expect } from 'chai';
import { raidersOnlyRule } from '../Rules/City/build';
import { requiredAdvanceFor } from '@civ-clone/civ1-unit/lib/requiredAdvances';
import traits from '@civ-clone/civ1-unit/Rules/Unit/traits';
import unitYields from '@civ-clone/civ1-unit/Rules/Unit/yield';

// A barbarian city with a Horseman of theirs about, and two civilizations, in a game with civ1-unit's rules,
//  civ1-barbarians' and this package's, with `set` switched as given (left as it starts unless told).
const setUp = async (set: [string, boolean] | null = null) => {
  const game: Game = loadGame(['civ1-barbarians', 'civ1-unit']),
    world = await buildWorld(game),
    barbarians = new Player(game.rules),
    civilizations = [new Player(game.rules), new Player(game.rules)];

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  barbarians.setCivilization(new Barbarian());
  game.players.register(barbarians, ...civilizations);
  [barbarians, ...civilizations].forEach((player: Player): void =>
    game.playerResearch.register(
      new PlayerResearch(player, new AdvanceRegistry(), game.rules)
    )
  );

  const city = new City(barbarians, world.get(2, 2), 'Camp', game.rules),
    horseman = new Horseman(
      null,
      barbarians,
      world.get(2, 2),
      game.rules,
      game.transports
    );

  game.units.register(horseman);

  return {
    city,
    civilizations,
    game,
    // Whether the city may build `Item`, by every `Build` rule in force.
    can: (Item: unknown): boolean =>
      game.rules
        .process(Build, city, Item as any)
        .every((criterion): boolean => criterion.validate()),
    // Every advance given to each civilization.
    learn: (...Advances: (typeof Chivalry)[]): void =>
      civilizations.forEach((player: Player): void =>
        Advances.forEach((Advance) =>
          game.playerResearch.getByPlayer(player).addAdvance(Advance)
        )
      ),
  };
};

describe('what a barbarian city builds (civ-clone/web-renderer#954)', (): void => {
  describe('any attacking land unit two civilizations can build, by default', (): void => {
    it('should be on', (): void => {
      expect(
        loadGame(['civ1-barbarians']).ruleSets.state(BARBARIAN_CITY_BUILDS)
      ).to.equal('on');
    });

    // civ1-barbarians' tests of it, from before v474.05's took its place there.
    describe('availableToBarbarians', (): void => {
      const rules = new RuleRegistry();

      // civ1-unit's unit traits, registered first as in a game: which types found cities or are `NonCombatant`.
      rules.register(...traits(), ...unitYields(undefined, rules));

      const research = new Map<Player, (typeof Chivalry)[]>(),
        players = {
          entries: () => [...research.keys()],
        },
        playerResearch = {
          getByPlayer: (player: Player) => ({
            completed: (Advance: typeof Chivalry) =>
              research.get(player)!.includes(Advance),
          }),
        },
        available = (Item: any) =>
          availableToBarbarians(
            Item,
            players as any,
            playerResearch as any,
            rules
          );

      it('is an attacking unit at least two civilizations can build, never Settlers, a Diplomat or an improvement', (): void => {
        const a = {} as Player,
          b = {} as Player;

        research.set(a, [Chivalry]);
        research.set(b, []);

        expect(available(Warrior), 'Warrior needs nothing').to.be.true;
        expect(available(Settlers), 'Settlers').to.be.false;
        expect(available(Diplomat), 'Diplomat').to.be.false;
        expect(available(Caravan), 'Caravan').to.be.false;
        expect(available(Knight), 'Knight: one civilization').to.be.false;
        expect(available(class Granary {}), 'an improvement').to.be.false;

        // The barbarians themselves are not one of the two.
        const barbarians = {
          civilization: () => new Barbarian(),
        } as unknown as Player;

        research.set(barbarians, [Chivalry]);

        expect(available(Knight), 'Knight: one civilization and the barbarians')
          .to.be.false;

        research.delete(barbarians);
        research.set(b, [Chivalry]);

        expect(available(Knight), 'Knight: two civilizations').to.be.true;
        expect(available(Battleship), 'a ship').to.be.false;

        // A ship that attacks, a Diplomat and a Caravan, which both can build.
        [a, b].forEach((player: Player): void =>
          research
            .get(player)!
            .push(
              ...[Trireme, Diplomat, Caravan].map(
                (UnitType) => requiredAdvanceFor(UnitType)!
              )
            )
        );

        expect(available(Trireme), 'a Trireme').to.be.false;
        expect(available(Diplomat), 'Diplomat, with Writing').to.be.false;
        expect(available(Caravan), 'Caravan, with Trade').to.be.false;
      });

      it('is the rule a barbarian city gets, and no other city', (): void => {
        const registry = new RuleRegistry(),
          barbarians = { civilization: () => new Barbarian() },
          civilization = { civilization: () => ({}) },
          cityOf = (player: unknown) => ({ player: () => player });

        registry.register(
          raidersOnlyRule({
            players: players as any,
            playerResearch: playerResearch as any,
            rules,
          })
        );

        const [forBarbarians] = registry.process(
          Build,
          cityOf(barbarians) as any,
          Warrior as any
        );

        expect(forBarbarians.validate()).to.be.true;
        expect(
          registry
            .process(Build, cityOf(barbarians) as any, Battleship as any)[0]
            .validate()
        ).to.be.false;
        expect(
          registry.process(Build, cityOf(civilization) as any, Warrior as any)
        ).to.have.length(0);
      });

      // The three it never builds were `=== Settlers || Diplomat || Caravan` before they were the types that found
      //  cities or are `NonCombatant`: the same three of the 28.
      it('never builds the same unit types as the class comparisons named', (): void => {
        const UnitTypes = Object.values(Units) as unknown as (typeof Unit)[];

        expect(UnitTypes).length(28);

        UnitTypes.forEach((UnitType): void => {
          expect(neverBarbarian(UnitType, rules), UnitType.name).equal(
            UnitType === Settlers ||
              UnitType === Diplomat ||
              UnitType === Caravan
          );
        });

        expect(
          UnitTypes.filter((UnitType) => neverBarbarian(UnitType, rules))
        ).length(3);
      });
    });

    it('should let a barbarian city build a Warrior, which needs no advance, and a Knight only once two civilizations have Chivalry', async (): Promise<void> => {
      const { can, civilizations, game, learn } = await setUp();

      expect(can(Warrior), 'Warrior').to.be.true;
      expect(can(Knight), 'Knight').to.be.false;
      [Settlers, Diplomat, Battleship, class Granary {}].forEach(
        (Item): void => {
          expect(can(Item), Item.name).to.be.false;
        }
      );

      game.playerResearch.getByPlayer(civilizations[0]).addAdvance(Chivalry);

      expect(can(Knight), 'Knight: one civilization').to.be.false;

      learn(Chivalry);

      expect(can(Knight), 'Knight: two civilizations').to.be.true;
    });
  });

  (
    [
      ['switched off', [BARBARIAN_CITY_BUILDS, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void => {
    describe(`a Warrior, Swordmen, then Knights, as v474.05, ${name}`, (): void => {
      it('should let a barbarian city build only a Swordman, though two civilizations have Chivalry, and only a Knight once anyone has Explosives', async (): Promise<void> => {
        const { can, civilizations, game, learn } = await setUp(set);

        learn(Chivalry);

        expect(can(Swordman), 'Swordman').to.be.true;
        [
          Warrior,
          Horseman,
          Knight,
          Settlers,
          Diplomat,
          Battleship,
          class Granary {},
        ].forEach((Item): void => {
          expect(can(Item), Item.name).to.be.false;
        });

        game.playerResearch
          .getByPlayer(civilizations[0])
          .addAdvance(Explosives);

        expect(can(Knight), 'Knight').to.be.true;
        expect(can(Swordman), 'Swordman').to.be.false;
      });

      it('should let it build only a Warrior while the barbarians have no unit', async (): Promise<void> => {
        const { can, game } = await setUp(set);

        game.units
          .entries()
          .forEach((unit: Unit): void => game.units.unregister(unit));

        expect(can(Warrior), 'Warrior').to.be.true;
        expect(can(Swordman), 'Swordman').to.be.false;
      });
    });
  });
});
