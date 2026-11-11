import {
  Banking,
  Currency,
  Electronics,
  Industrialization,
  Refining,
  Rocketry,
} from '@civ-clone/civ1-science/Advances';
import {
  Bank,
  Factory,
  Granary,
  Marketplace,
  PowerPlant,
  Temple,
} from '@civ-clone/civ1-city-improvement/CityImprovements';
import {
  CAPTURED_CITY_BUILD,
  ENHANCED,
  OBSOLETE_BUILDS,
  SETTLERS_WAIT_FOR_SIZE_TWO,
} from '../RuleSets';
import { HooverDam, ManhattanProject } from '@civ-clone/civ1-wonder/Wonders';
import loadGame, {
  Package,
  buildWorld,
  pluginOrder,
  scriptedRng,
} from './lib/loadGame';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import Client from '@civ-clone/core-client/Client';
import Captured from '@civ-clone/core-city/Rules/Captured';
import CitySabotaged from '@civ-clone/base-unit-action-industrial-sabotage/Rules/CitySabotaged';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import LandMass from '@civ-clone/core-world/LandMass';
import { Nuclear, Settlers } from '@civ-clone/civ1-unit/Units';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import Sell from '@civ-clone/core-treasury/Rules/Sell';
import SpendCost from '@civ-clone/core-treasury/SpendCost';
import Unit from '@civ-clone/core-unit/Unit';
import {
  IRequirement,
  Requirement,
} from '@civ-clone/core-requirement/Requirement';
import { Food, Production } from '@civ-clone/civ1-world/Yields';
import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import { deriveBuildRules } from '@civ-clone/civ1-city-improvement/Rules/City/build';
import { expect } from 'chai';

type Sets = [string, boolean][];

// A game with every Civ1 package this one changes and its own, `sets` switched as given, and two players, `player` and
//  `rival`, who know enough to build a Bank, a Power Plant, the Hoover Dam and a Nuclear unit. All the land is one
//  continent but the far corner. Sabotage draws from `rolls`, then 0. The packages load in `order`, the plugin
//  loader's unless told.
const setUp = async (
  sets: Sets = [],
  rolls: number[] = [],
  order: Package[] = pluginOrder
) => {
  const game: Game = loadGame(undefined, order, {
      rng: scriptedRng(rolls),
    }),
    world = await buildWorld(game, 9),
    player = new Player(game.rules),
    rival = new Player(game.rules),
    cancelled: [City, unknown][] = [];

  sets.forEach((set): void => game.ruleSets.set(...set));

  [player, rival].forEach((owner: Player): void => {
    const research = new PlayerResearch(owner, game.advances, game.rules);

    game.players.register(owner);
    game.playerWorlds.register(new PlayerWorld(owner, world, game.rules));
    game.playerGovernments.register(
      new PlayerGovernment(owner, game.availableGovernments, game.rules)
    );
    game.playerResearch.register(research);
    [
      Currency,
      Banking,
      Industrialization,
      Refining,
      Electronics,
      Rocketry,
    ].forEach((Advance) => research.addAdvance(Advance));
  });

  game.landMasses.register(
    new LandMass(
      world.entries().filter((tile) => tile.x() < 8 || tile.y() < 8)
    ),
    new LandMass([world.get(8, 8)])
  );
  game.availableCityBuildItems.register(
    ...([
      Bank,
      Factory,
      Marketplace,
      PowerPlant,
      Temple,
      HooverDam,
      ManhattanProject,
      Nuclear,
      Settlers,
    ] as unknown as (typeof Buildable)[])
  );
  game.rules.register(
    new BuildingCancelled(
      new Effect((cityBuild: CityBuild): void => {
        cancelled.push([cityBuild.city(), cityBuild.cleared()?.item]);
      })
    )
  );

  // A city of `owner`'s at x, y, with `improvements`, building `Item`.
  const city = (
    owner: Player,
    x: number,
    y: number,
    improvements: (typeof CityImprovement)[] = [],
    Item: typeof Buildable | null = null
  ): { city: City; cityBuild: CityBuild; has: CityImprovement[] } => {
    const city = new City(owner, world.get(x, y), `${x},${y}`, game.rules),
      cityBuild = game.cityBuilds.getByCity(city),
      // Each registers itself (`civ1-city-improvement`'s `CityImprovement` `Created` rule).
      has = improvements.map(
        (Improvement): CityImprovement => new Improvement(city, game.rules)
      );

    if (Item !== null) {
      cityBuild.build(Item);
    }

    return { city, cityBuild, has };
  };

  return { cancelled, city, game, player, rival };
};

const building = (cityBuild: CityBuild): unknown =>
  cityBuild.building()?.item() ?? null;

// The names of `things`' classes, for assertions that would otherwise print a whole game when they fail.
const names = (things: object[]): string[] =>
  things.map((thing: object): string => thing.constructor.name);

// Each case under the set's default, switched off, and with the parent switched off.
const switched: [string, Sets, boolean][] = [
  ['by default', [], true],
  [
    'with OBSOLETE_BUILDS switched off, as v474.05',
    [[OBSOLETE_BUILDS, false]],
    false,
  ],
  ['with the parent switched off, as v474.05', [[ENHANCED, false]], false],
];

describe('a build its city can no longer make, as that happens (civ-clone/web-renderer#965)', (): void => {
  describe('a lost improvement it needed', (): void => {
    switched.forEach(([name, sets, drops]): void => {
      describe(name, (): void => {
        it(`should ${
          drops ? 'drop' : 'keep'
        } a Bank under way when its Marketplace is sold`, async (): Promise<void> => {
          const { city, game, player } = await setUp(sets),
            { cityBuild, has } = city(
              player,
              2,
              2,
              [Marketplace, Temple],
              Bank as never
            ),
            other = city(player, 5, 2, [Marketplace], Bank as never),
            treasury = new PlayerTreasury(
              player,
              Gold,
              game.cityBuilds,
              game.rules
            );

          game.rules.register(
            new Sell(new Effect((): SpendCost => new SpendCost(Gold, 80)))
          );

          treasury.sell(has[1]);

          expect(building(cityBuild), 'a Temple sold').equal(Bank);

          treasury.sell(has[0]);

          expect(treasury.value()).equal(160);
          expect(building(cityBuild)).equal(drops ? null : Bank);
          expect(cityBuild.cleared()).eql(
            drops ? { reason: 'unavailable', item: Bank } : null
          );
          // Its own Marketplace still stands.
          expect(building(other.cityBuild)).equal(Bank);
        });

        it(`should ${
          drops ? 'drop' : 'keep'
        } a Bank under way when its Marketplace is sabotaged, and keep it when another improvement is`, async (): Promise<void> => {
          // The first sabotage takes the Temple (the second of two), the next the Marketplace.
          const { city, game, player, rival } = await setUp(sets, [0.9, 0]),
            { city: target, cityBuild } = city(
              player,
              2,
              2,
              [Marketplace, Temple],
              Bank as never
            ),
            diplomat = { player: (): Player => rival } as unknown as Unit;

          game.rules.process(CitySabotaged, diplomat, target);

          expect(building(cityBuild), 'the Temple sabotaged').equal(Bank);

          game.rules.process(CitySabotaged, diplomat, target);

          expect(names(game.cityImprovements.getByCity(target))).eql([
            'Palace',
          ]);
          expect(building(cityBuild)).equal(drops ? null : Bank);
        });

        it(`should ${
          drops ? 'drop' : 'keep'
        } a Bank under way when its Marketplace can't be paid for`, async (): Promise<void> => {
          const { city, game, player } = await setUp(sets),
            {
              city: poor,
              cityBuild,
              has,
            } = city(player, 2, 2, [Marketplace], Bank as never);

          // As `civ1-treasury:city/process-yield/gold` does, with too little gold for the upkeep.
          game.rules.register(
            new ProcessYield(
              new Criterion(
                (cityYield: unknown): boolean => cityYield instanceof Gold
              ),
              new Effect((): void => game.cityImprovements.unregister(has[0]))
            )
          );

          game.rules.process(ProcessYield, new Gold(), poor, []);

          expect(building(cityBuild)).equal(drops ? null : Bank);
        });

        // v474.05 marks a Wonder lost with its city lost, not unbuilt (ECONOMY.C 94-96), and still lets Nuclear units be
        //  built (ECONOMY.C 172): having built it is enough.
        it(`should keep a Nuclear unit under way when the city with the Manhattan Project is destroyed`, async (): Promise<void> => {
          const { city, game, player, rival } = await setUp(sets),
            site = city(rival, 6, 6),
            { cityBuild } = city(player, 2, 2);

          game.wonders.register(new ManhattanProject(site.city, game.rules));
          cityBuild.build(Nuclear as never);

          site.city.destroy();

          expect(names(game.wonders.entries())).eql([]);
          expect(building(cityBuild)).equal(Nuclear);
          expect(cityBuild.cleared()).null;
        });
      });
    });

    // A build that was already refused for want of one, such as one kept from a capture, is not what was lost.
    it('should keep a build that already lacked what it needs when an improvement it never needed is lost', async (): Promise<void> => {
      const { city, game, player, rival } = await setUp([], [0]),
        { city: target, cityBuild } = city(player, 2, 2, [Temple]),
        diplomat = { player: (): Player => rival } as unknown as Unit;

      // As a captured city's kept build: chosen where it could be, then left without what it needs.
      new Marketplace(target, game.rules);
      cityBuild.build(Bank as never);
      game.cityImprovements
        .getByCity(target)
        .filter((improvement) => improvement instanceof Marketplace)
        .forEach((improvement) => improvement.destroy());

      game.rules.process(CitySabotaged, diplomat, target);

      expect(names(game.cityImprovements.getByCity(target))).eql(['Palace']);
      expect(building(cityBuild)).equal(Bank);
    });

    // The Marketplace an entry of range `city` names is a city's own: another city's sale says nothing of this one.
    it("should keep a build that already lacked what it needs when another city's improvement it names is sold", async (): Promise<void> => {
      const { city, game, player } = await setUp(),
        { city: target, cityBuild } = city(player, 2, 2),
        { has } = city(player, 5, 2, [Marketplace]),
        treasury = new PlayerTreasury(
          player,
          Gold,
          game.cityBuilds,
          game.rules
        );

      game.rules.register(
        new Sell(new Effect((): SpendCost => new SpendCost(Gold, 80)))
      );
      // As a captured city's kept build: chosen where it could be, then left without what it needs.
      new Marketplace(target, game.rules);
      cityBuild.build(Bank as never);
      game.cityImprovements
        .getByCity(target)
        .filter((improvement) => improvement instanceof Marketplace)
        .forEach((improvement) => improvement.destroy());

      treasury.sell(has[0]);

      expect(treasury.value()).equal(80);
      expect(building(cityBuild)).equal(Bank);
    });

    // A plugin's own entries, on a build kept without what they ask for: only what was lost counts, and only through
    //  a `requires` entry naming it.
    describe("with a plugin's own entries", (): void => {
      // A city with `improvements`, building a Bank, then given `entry`, which already refuses it; then sabotaged, which
      //  takes the Temple (the second of the improvements a Diplomat may take).
      const sabotageTheTemple = async (
        improvements: (typeof CityImprovement)[],
        entry: Omit<IRequirement, 'id' | 'subject'>
      ) => {
        const { city, game, player, rival } = await setUp([], [0.5]),
          { city: target, cityBuild } = city(
            player,
            2,
            2,
            improvements,
            Bank as never
          ),
          diplomat = { player: (): Player => rival } as unknown as Unit;

        game.requirements.add(
          deriveBuildRules(game.cityImprovements, game.playerResearch),
          new Requirement({
            id: 'test:city/build/bank',
            subject: Bank,
            range: 'city',
            ...entry,
          })
        );

        expect(cityBuild.getAvailable(Bank as never)).undefined;

        game.rules.process(CitySabotaged, diplomat, target);

        expect(
          names(game.cityImprovements.getByCity(target)).includes('Temple')
        ).false;

        return cityBuild;
      };

      it('should keep a build that a `requires` entry needing all of two things already refused, when a third is lost', async (): Promise<void> => {
        const cityBuild = await sabotageTheTemple([Marketplace, Temple], {
          relation: 'requires',
          targets: [Marketplace, Granary],
          mode: 'all',
        });

        expect(building(cityBuild)).equal(Bank);
      });

      it('should keep a build an `excludedBy` entry naming what was lost still refuses', async (): Promise<void> => {
        const cityBuild = await sabotageTheTemple(
          [Marketplace, Temple, Granary],
          {
            relation: 'excludedBy',
            targets: [Temple, Granary],
            mode: 'any',
          }
        );

        expect(building(cityBuild)).equal(Bank);
      });
    });
  });

  // A build `SETTLERS_WAIT_FOR_SIZE_TWO` holds (`Hold`, `CityBuild#held()`) has its shields and stays chosen: no entry
  //  names anything about it, so nothing here drops it, even as its city loses an improvement.
  it('should leave held Settlers in a city that sells its Marketplace the same turn', async (): Promise<void> => {
    const { cancelled, city, game, player } = await setUp(),
      { cityBuild, has } = city(player, 2, 2, [Marketplace], Settlers as never),
      treasury = new PlayerTreasury(player, Gold, game.cityBuilds, game.rules);

    game.rules.register(
      new Sell(new Effect((): SpendCost => new SpendCost(Gold, 80)))
    );
    cityBuild.add(cityBuild.cost());

    expect(cityBuild.check()).null;
    expect(cityBuild.held()).not.eql([]);

    treasury.sell(has[0]);

    expect(names(game.cityImprovements.getByCity(cityBuild.city()))).eql([
      'Palace',
    ]);
    expect(building(cityBuild)).equal(Settlers);
    expect(cityBuild.held()).not.eql([]);
    expect(cancelled.map(([cancelledIn]) => cancelledIn.name())).eql([]);
  });

  // However a city comes to be destroyed, inside one of these rules' events, nothing it held is lost to anyone: a
  //  Wonder lost with its city was still built, as v474.05 has it (civ-clone/web-renderer#965). Each as the engine
  //  does it.
  describe('a city destroyed inside the event', (): void => {
    // The rival's city of size 1 at 6, 6, with `improvements` and the Manhattan Project and the Hoover Dam, building
    //  `Item`; Nuclear units under way in a city of each player's, and a Power Plant in one of the player's.
    const wonderCity = async (
      improvements: (typeof CityImprovement)[],
      Item: typeof Buildable,
      sets: Sets = []
    ) => {
      const set = await setUp(sets),
        { city, game, player, rival } = set,
        site = city(rival, 6, 6, improvements, Item);

      game.wonders.register(
        new ManhattanProject(site.city, game.rules),
        new HooverDam(site.city, game.rules)
      );

      const builds = [
        city(player, 2, 1, [], Nuclear as never).cityBuild,
        city(player, 2, 3, [Factory], PowerPlant as never).cityBuild,
        city(rival, 4, 1, [], Nuclear as never).cityBuild,
      ];

      return { ...set, builds, site };
    };

    // Nothing dropped anywhere but in the destroyed city itself (whose build a capture clears, as it always has).
    const expectNothingDropped = (
      cancelled: [City, unknown][],
      builds: CityBuild[],
      site: City
    ): void => {
      expect(
        cancelled
          .filter(([cancelledIn]) => cancelledIn !== site)
          .map(([cancelledIn]) => cancelledIn.name())
      ).eql([]);
      expect(builds.map(building)).eql([Nuclear, PowerPlant, Nuclear]);
    };

    it('should drop nothing when the city starves to nothing as its yields are processed', async (): Promise<void> => {
      // Building a Bank, so it is noted before its yields are processed.
      const { builds, cancelled, game, site } = await wonderCity(
        [Marketplace],
        Bank as never
      );

      // Food that empties its store: `FoodExhausted`, then `civ1-city:city/shrink/destroy-empty-city`.
      game.rules.process(ProcessYield, new Food(-1000), site.city, []);

      expect(site.city.destroyed()).true;
      expectNothingDropped(cancelled, builds, site.city);
    });

    // Only a `player` or `world` entry could reach past the destroyed city: a plugin's, here.
    it("should drop nothing that a plugin's `player` entry names when a city starves to nothing", async (): Promise<void> => {
      const { cancelled, city, game, player } = await setUp(),
        starving = city(player, 6, 6, [Marketplace], Bank as never),
        { cityBuild } = city(player, 2, 2);

      // As a captured city's kept build: chosen where it could be, then left without what it needs.
      new Marketplace(cityBuild.city(), game.rules);
      cityBuild.build(Bank as never);
      game.cityImprovements
        .getByCity(cityBuild.city())
        .filter((improvement) => improvement instanceof Marketplace)
        .forEach((improvement) => improvement.destroy());
      game.requirements.add(
        deriveBuildRules(game.cityImprovements, game.playerResearch),
        new Requirement({
          id: 'test:city/build/bank-needs-a-marketplace-somewhere',
          subject: Bank,
          relation: 'requires',
          targets: [Marketplace],
          range: 'player',
        })
      );

      game.rules.process(ProcessYield, new Food(-1000), starving.city, []);

      expect(starving.city.destroyed()).true;
      expect(
        cancelled
          .filter(([cancelledIn]) => cancelledIn !== starving.city)
          .map(([cancelledIn]) => cancelledIn.name())
      ).eql([]);
      expect(building(cityBuild)).equal(Bank);
    });

    // The engine's own path: with `SETTLERS_WAIT_FOR_SIZE_TWO` off, on a level other than Chieftain (none set is King),
    //  a size-1 city whose player has others is removed by `civ1-unit:city/building-complete/settlers-shrink-city`, its
    //  Settlers homed in the nearest other city. This records that the path drops nothing; no guard here is what keeps
    //  it so, as no entry names Settlers or anything the city held is lost (the next test is the guard's).
    it('the path that removes a city completing Settlers drops nothing', async (): Promise<void> => {
      const { builds, cancelled, game, rival, site } = await wonderCity(
        [],
        Settlers as never,
        [[SETTLERS_WAIT_FOR_SIZE_TWO, false]]
      );

      site.cityBuild.add(site.cityBuild.cost());

      const settlers = site.cityBuild.check();

      expect(site.city.destroyed()).true;
      expect(settlers).instanceOf(Settlers);
      expect(game.units.getByPlayer(rival).includes(settlers as never)).true;
      expectNothingDropped(cancelled, builds, site.city);
    });

    // As above: this records the path, whose shrink has destroyed the city before the capture rules here run.
    // As `civ1-player`'s turn start, sequenced here by hand as civ1-player is not loaded in these tests:
    //  `civ1-player:player/turn-start/process-city-yields` (civ1-player `Rules/Player/turn-start.ts`) takes
    //  `cityRegistry.getByPlayer(player)` once, then for each city processes `ProcessYield` for its consolidated Food,
    //  Production and Trade, in that order. A size-1 city that starves to nothing on its Food still has its Production
    //  processed, and can complete the Hoover Dam, registered against the destroyed city: the `BuildingComplete` rule's
    //  guard keeps the player's plant elsewhere.
    it('should drop no plant when a city completes the Hoover Dam on the turn it starves to nothing', async (): Promise<void> => {
      const { cancelled, city, game, player } = await setUp(),
        dam = city(player, 2, 2, [], HooverDam as never),
        plant = city(player, 4, 2, [Factory], PowerPlant as never);

      dam.cityBuild.add(dam.cityBuild.cost());
      game.rules.process(ProcessYield, new Food(-1000), dam.city, []);

      expect(dam.city.destroyed()).true;

      game.rules.process(ProcessYield, new Production(0), dam.city, []);

      expect(names(game.wonders.getByPlayer(player))).eql(['HooverDam']);
      expect(
        cancelled
          .filter(([cancelledIn]) => cancelledIn !== dam.city)
          .map(([cancelledIn]) => cancelledIn.name())
      ).eql([]);
      expect(building(plant.cityBuild)).equal(PowerPlant);
    });

    it('the path that destroys a city as it is captured drops nothing', async (): Promise<void> => {
      const { builds, cancelled, player, site } = await wonderCity(
        [],
        Settlers as never
      );

      site.city.capture(player);

      expect(site.city.destroyed()).true;
      expectNothingDropped(cancelled, builds, site.city);
    });
  });

  // A plugin's entry of range `player`: a Bank needs a Marketplace in one of its player's cities. The city that loses the
  //  player's only one builds something else, so it is sabotaged or left unpaid only if it is noted for the entry's
  //  range (`anyWiderNeed`), not for its own build; each way of losing it agrees with the others. The sale has no
  //  note, so its test is not one of the gate's. The entry comes either with the rule made from it, or, describing a
  //  rule the plugin wrote by hand, after that rule is in play and a yield has been processed: the gate's answer is
  //  kept for the rules and the count of entries, so a describing entry registered late is still seen.
  (['sold', 'sabotaged', 'not paid for'] as const).forEach((how): void =>
    (
      [
        ['with the rule made from it', false],
        ['describing a rule written by hand, registered after a yield', true],
      ] as [string, boolean][]
    ).forEach(([entryName, late]): void => {
      it(`should drop a Bank elsewhere when the player's only Marketplace is ${how}, under a \`player\` entry ${entryName}${
        how === 'sold' ? ' (a sale has no note to gate)' : ''
      }`, async (): Promise<void> => {
        const { cancelled, city, game, player, rival } = await setUp([], [0]),
          x = city(player, 2, 2, [Marketplace], Factory as never),
          y = city(player, 5, 2);

        // As a captured city's kept build: chosen where it could be, then left without what it needs.
        new Marketplace(y.city, game.rules);
        y.cityBuild.build(Bank as never);
        game.cityImprovements
          .getByCity(y.city)
          .filter((improvement) => improvement instanceof Marketplace)
          .forEach((improvement) => improvement.destroy());
        const entry = new Requirement({
          id: 'test:city/build/bank-needs-a-marketplace-somewhere',
          subject: Bank,
          relation: 'requires',
          targets: [Marketplace],
          range: 'player',
        });

        if (late) {
          game.rules.register(
            new Build(
              entry.id,
              Bank,
              new Criterion(
                (city: City, Item: unknown): boolean => Item === Bank
              ),
              new Effect(
                (city: City): IBuildCriterion =>
                  new Criterion((): boolean =>
                    game.cityImprovements
                      .filter(
                        (improvement: CityImprovement): boolean =>
                          improvement instanceof Marketplace &&
                          !improvement.destroyed() &&
                          improvement.city().player() === city.player()
                      )
                      .some((improvement) => improvement.city() !== y.city)
                  )
              )
            )
          );
          // A yield processed in X, with nothing yet describing the rule.
          game.rules.process(ProcessYield, new Production(0), x.city, []);
          game.requirements.register(entry);
        } else {
          game.requirements.add(
            deriveBuildRules(game.cityImprovements, game.playerResearch),
            entry
          );
        }

        if (how === 'sold') {
          game.rules.register(
            new Sell(new Effect((): SpendCost => new SpendCost(Gold, 80)))
          );
          new PlayerTreasury(player, Gold, game.cityBuilds, game.rules).sell(
            x.has[0]
          );
        } else if (how === 'sabotaged') {
          game.rules.process(
            CitySabotaged,
            { player: (): Player => rival } as unknown as Unit,
            x.city
          );
        } else {
          game.rules.register(
            new ProcessYield(
              new Criterion(
                (cityYield: unknown): boolean => cityYield instanceof Gold
              ),
              new Effect((): void => game.cityImprovements.unregister(x.has[0]))
            )
          );
          game.rules.process(ProcessYield, new Gold(), x.city, []);
        }

        expect(names(game.cityImprovements.getByCity(x.city))).eql(['Palace']);
        expect(building(x.cityBuild)).equal(Factory);
        expect(building(y.cityBuild)).null;
        expect(cancelled.map(([cancelledIn]) => cancelledIn.name())).eql([
          y.city.name(),
        ]);
      });
    })
  );

  describe('a Wonder its player gains that excludes it', (): void => {
    switched.forEach(([name, sets, drops]): void => {
      describe(name, (): void => {
        it(`should ${
          drops ? 'drop' : 'keep'
        } the player's plants under way on the Hoover Dam's continent when it is completed`, async (): Promise<void> => {
          const { cancelled, city, game, player, rival } = await setUp(sets),
            dam = city(player, 2, 2, [], HooverDam as never),
            plant = city(player, 4, 2, [Factory], PowerPlant as never),
            overseas = city(player, 8, 8, [Factory], PowerPlant as never),
            rivals = city(rival, 6, 2, [Factory], PowerPlant as never);

          dam.cityBuild.add(dam.cityBuild.cost());
          dam.cityBuild.check();

          expect(names(game.wonders.getByPlayer(player))).eql(['HooverDam']);
          expect(building(plant.cityBuild)).equal(drops ? null : PowerPlant);
          expect(plant.cityBuild.cleared()).eql(
            drops ? { reason: 'unavailable', item: PowerPlant } : null
          );
          expect(building(overseas.cityBuild)).equal(PowerPlant);
          expect(building(rivals.cityBuild)).equal(PowerPlant);
          expect(cancelled.map(([cancelledIn]) => cancelledIn.name())).eql(
            drops ? [plant.city.name()] : []
          );
        });

        it(`should ${
          drops ? 'drop' : 'keep'
        } the captor's plants under way when they take the city with the Hoover Dam`, async (): Promise<void> => {
          const { city, game, player, rival } = await setUp(sets),
            dam = city(rival, 2, 2),
            plant = city(player, 4, 2, [Factory], PowerPlant as never),
            // Chosen before the dam was built.
            rivals = city(rival, 6, 2, [Factory], PowerPlant as never);

          game.wonders.register(new HooverDam(dam.city, game.rules));
          game.cityGrowth.getByCity(dam.city).grow();
          game.cityGrowth.getByCity(dam.city).grow();

          dam.city.capture(player);

          expect(dam.city.destroyed()).false;
          expect(building(plant.cityBuild)).equal(drops ? null : PowerPlant);
          // What its previous owner was building is not theirs to drop.
          expect(building(rivals.cityBuild)).equal(PowerPlant);
        });
      });
    });

    // After every `Low` rule of the capture, civ1-barbarians' burning among them, whichever package loads first.
    (
      [
        [
          'with civ1-enhanced first',
          [
            'civ1-enhanced',
            ...pluginOrder.filter((name) => name !== 'civ1-enhanced'),
          ],
        ],
        [
          'with civ1-enhanced last',
          [
            ...pluginOrder.filter((name) => name !== 'civ1-enhanced'),
            'civ1-enhanced',
          ],
        ],
      ] as [string, Package[]][]
    ).forEach(([name, order]): void => {
      it(`should drop the captor's plant after the capture's other rules, ${name}`, async (): Promise<void> => {
        const { city, game, player, rival } = await setUp([], [], order),
          dam = city(rival, 2, 2),
          plant = city(player, 4, 2, [Factory], PowerPlant as never),
          ids = game.rules
            .get(Captured)
            .map((rule): string | null => rule.id());

        expect(ids[ids.length - 1]).equal(
          'civ1-enhanced:city/captured/drop-excluded-builds'
        );
        expect(ids.indexOf('civ1-barbarians:city/captured/burn')).lessThan(
          ids.length - 1
        );

        game.wonders.register(new HooverDam(dam.city, game.rules));
        game.cityGrowth.getByCity(dam.city).grow();
        game.cityGrowth.getByCity(dam.city).grow();

        dam.city.capture(player);

        expect(building(plant.cityBuild)).null;
      });
    });

    // What the captured city builds is `CAPTURED_CITY_BUILD`'s to decide: kept, as v474.05 keeps it, it stays.
    it('should leave the build the human keeps in the city they take with the Hoover Dam', async (): Promise<void> => {
      const { city, game, player, rival } = await setUp([
          [CAPTURED_CITY_BUILD, false],
        ]),
        dam = city(rival, 2, 2, [Factory], PowerPlant as never);

      game.clients.register(new Client(player), new AIClient(rival));
      game.wonders.register(new HooverDam(dam.city, game.rules));
      game.cityGrowth.getByCity(dam.city).grow();
      game.cityGrowth.getByCity(dam.city).grow();

      dam.city.capture(player);

      expect(building(dam.cityBuild)).equal(PowerPlant);
    });
  });
});
