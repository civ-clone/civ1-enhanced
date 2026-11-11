import { CAPTURED_CITY_BUILD, ENHANCED, OBSOLETE_BUILDS } from '../RuleSets';
import { Spearman, Warrior } from '@civ-clone/civ1-unit/Units';
import { Temple } from '@civ-clone/civ1-city-improvement/CityImprovements';
import loadGame, { Package, buildWorld, pluginOrder } from './lib/loadGame';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import BuildCostModifier from '@civ-clone/core-city-build/Rules/BuildCostModifier';
import BuildPriority from '@civ-clone/core-city-build/Rules/BuildPriority';
import Captured from '@civ-clone/core-city/Rules/Captured';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Client from '@civ-clone/core-client/Client';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import BronzeWorking from '@civ-clone/base-science-advance-bronzeworking/BronzeWorking';
import Chivalry from '@civ-clone/base-science-advance-chivalry/Chivalry';
import Explosives from '@civ-clone/base-science-advance-explosives/Explosives';
import { Game } from '@civ-clone/core-game/Game';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import High from '@civ-clone/core-rule/Priorities/High';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import Writing from '@civ-clone/base-science-advance-writing/Writing';
import { buildCost } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';

type Captor = 'human' | 'computer';

// A city of size 3 (unless told) building Warrior on Auto, 5 shields in, its price doubled for its owner (a computer
//  player), taken by `captor`, in a game with civ1-city's rules and this package's, loaded in `order` (the plugin
//  loader's unless told), with `set` switched as given (left as it starts unless told). `atCapture` is the build as
//  `city:captured` is raised.
const capture = async (
  captor: Captor,
  set: [string, boolean] | null = null,
  building: typeof Buildable | null = Warrior as unknown as typeof Buildable,
  size: number = 3,
  order: Package[] = pluginOrder
) => {
  const game: Game = loadGame(['civ1-city'], order),
    world = await buildWorld(game),
    owner = new Player(game.rules),
    capturer = new Player(game.rules),
    atCapture: { building: unknown; cleared: unknown }[] = [],
    atHigh: unknown[] = [];
  let cityBuild: CityBuild;

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  [owner, capturer].forEach((player: Player): void => {
    game.players.register(player);
    game.playerWorlds.register(new PlayerWorld(player, world, game.rules));
    game.playerGovernments.register(
      new PlayerGovernment(player, game.availableGovernments, game.rules)
    );
  });
  game.clients.register(
    new AIClient(owner),
    captor === 'human' ? new Client(capturer) : new AIClient(capturer)
  );
  game.availableCityBuildItems.register(
    ...([Warrior, Spearman, Temple] as unknown as (typeof Buildable)[])
  );
  game.rules.register(
    new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
    ...buildCost(Warrior, 10),
    ...buildCost(Spearman, 20),
    ...buildCost(Temple, 30),
    // Something Auto would choose, if it were still on when the build is cleared.
    new BuildPriority(
      new Criterion((cityBuild, BuildItem): boolean => BuildItem === Temple),
      new Effect((): number => 1)
    ),
    // What a `High` rule sees: the build as the previous owner left it, as `civ1-city`'s own clear ran after these.
    new Captured(
      new High(),
      new Effect((): void => {
        atHigh.push(cityBuild.building()?.item() ?? null);
      })
    ),
    new BuildCostModifier(
      new Criterion(
        (buildItem, city: City | null): boolean => city?.player() === owner
      ),
      new Effect((buildItem, city, cost: number): number => cost * 2)
    )
  );

  const city = new City(owner, world.get(2, 2), 'Test', game.rules);

  cityBuild = game.cityBuilds.getByCity(city);

  for (let grown = 1; grown < size; grown++) {
    game.cityGrowth.getByCity(city).grow();
  }

  if (building !== null) {
    cityBuild.build(building);
    cityBuild.progress().add(5);
  }

  cityBuild.setAuto(true);

  const before = cityBuild.cleared();

  expect(cityBuild.cost().value()).to.equal(building === null ? Infinity : 20);

  game.engine.on('city:captured', (): void => {
    atCapture.push({
      building: cityBuild.building()?.item() ?? null,
      cleared: cityBuild.cleared(),
    });
  });

  city.capture(capturer);

  expect(city.player()).to.equal(capturer);
  expect(city.destroyed()).to.equal(size === 1);

  return { atCapture, atHigh, before, city, cityBuild, game };
};

// What happens whichever rule is in force: a computer player that takes a city chooses again, as v474.05's does.
const forAComputerPlayer = (set: [string, boolean] | null): void => {
  it("should clear a computer player's capture, so it chooses again at its own price, off Auto", async (): Promise<void> => {
    const { cityBuild } = await capture('computer', set);

    expect(cityBuild.auto()).false;
    expect(cityBuild.building()).null;
    expect(cityBuild.cost().value()).to.equal(Infinity);
    expect(cityBuild.progress().value()).to.equal(0);
    expect(cityBuild.cleared()).to.eql({ reason: 'captured', item: Warrior });

    cityBuild.build(Warrior as unknown as typeof Buildable);

    expect(cityBuild.cost().value()).to.equal(10);
  });

  it("should ask for a captured city's build when nothing was being built (civ-clone/web-renderer#716)", async (): Promise<void> => {
    for (const captor of ['computer', 'human'] as Captor[]) {
      const { cityBuild } = await capture(captor, set, null);

      expect(cityBuild.building(), captor).null;
      expect(cityBuild.cleared(), captor).to.eql({
        reason: 'captured',
        item: null,
      });
    }
  });
};

describe("a captured city's build (civ-clone/web-renderer#954)", (): void => {
  describe('cleared for the human too, by default', (): void => {
    it('should be on', (): void => {
      expect(
        loadGame(['civ1-city']).ruleSets.state(CAPTURED_CITY_BUILD)
      ).to.equal('on');
    });

    forAComputerPlayer(null);

    // civ1-city's test of it, from before v474.05's took its place there.
    it('should clear the item in progress for the human, so they choose at their own price, even when it was on Auto (civ-clone/web-renderer#670, #500)', async (): Promise<void> => {
      const { cityBuild } = await capture('human');

      expect(cityBuild.auto()).false;
      expect(cityBuild.building()).null;
      expect(cityBuild.cost().value()).to.equal(Infinity);
      expect(cityBuild.progress().value()).to.equal(0);
      // Its new owner is told why they are asked (civ-clone/web-renderer#716).
      expect(cityBuild.cleared()).to.eql({ reason: 'captured', item: Warrior });

      cityBuild.build(Warrior as unknown as typeof Buildable);

      expect(cityBuild.cost().value()).to.equal(10);
    });

    // As `civ1-city`'s own rule did: before the city shrinks and `city:captured` is raised.
    (
      [
        ['by name', pluginOrder],
        ['with civ1-enhanced first', ['civ1-enhanced', 'civ1-city']],
        ['with civ1-enhanced last', ['civ1-city', 'civ1-enhanced']],
      ] as [string, Package[]][]
    ).forEach(([name, order]): void => {
      it(`should have cleared it when city:captured is raised, loaded ${name}`, async (): Promise<void> => {
        const { atCapture, atHigh } = await capture(
          'human',
          null,
          Warrior as unknown as typeof Buildable,
          3,
          order
        );

        expect(atHigh).to.eql([Warrior]);
        expect(atCapture).to.eql([
          { building: null, cleared: { reason: 'captured', item: Warrior } },
        ]);
      });
    });

    // A size-1 city is destroyed as it shrinks, after the build is cleared.
    it('should clear it in a city of size 1 the human takes, which the capture destroys, as before', async (): Promise<void> => {
      const { cityBuild } = await capture(
        'human',
        null,
        Warrior as unknown as typeof Buildable,
        1
      );

      expect(cityBuild.building()).null;
      expect(cityBuild.cost().value()).to.equal(Infinity);
      expect(cityBuild.cleared()).to.eql({ reason: 'captured', item: Warrior });
    });
  });

  (
    [
      ['switched off', [CAPTURED_CITY_BUILD, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void => {
    describe(`kept by the human, as v474.05, ${name}`, (): void => {
      forAComputerPlayer(set);

      it("should leave the human building the item, from no shields, at the human's price, off Auto", async (): Promise<void> => {
        const { before, cityBuild } = await capture('human', set);

        expect(cityBuild.auto()).false;
        expect(cityBuild.building()!.item()).to.equal(Warrior);
        expect(cityBuild.progress().value()).to.equal(0);
        expect(cityBuild.cost().value()).to.equal(10);
        expect(cityBuild.cleared()).to.equal(before);
      });
    });
  });

  // With v474.05's capture and civ-clone's obsolete builds, its default: `OBSOLETE_BUILDS`' discovery rule drops only
  //  what a discovery makes obsolete, so the two sets are independent (civ-clone/web-renderer#965). It used to drop a
  //  build the player could not choose at any discovery, which took a kept item the human could not build at their
  //  next one, often the advance taken with the city. These are for a city the human captures building Spearman.
  describe("a kept build, at the human's later discoveries, with only CAPTURED_CITY_BUILD switched off", (): void => {
    // A computer player's city building Spearman, which needs Bronze Working, taken by the human, who knows `known`,
    //  in a game with a third player and civ1-wonder's `world` obsolescence entries (the Great Wall's names Gunpowder).
    const captureSpearman = async (
      known: (typeof BronzeWorking)[],
      sets: [string, boolean][]
    ) => {
      const game: Game = loadGame(['civ1-city', 'civ1-unit', 'civ1-wonder']),
        world = await buildWorld(game),
        owner = new Player(game.rules),
        human = new Player(game.rules),
        third = new Player(game.rules),
        research = new Map<Player, PlayerResearch>();

      sets.forEach((set): void => game.ruleSets.set(...set));

      [owner, human, third].forEach((player: Player): void => {
        const playerResearch = new PlayerResearch(
          player,
          new AdvanceRegistry(),
          game.rules
        );

        game.players.register(player);
        game.playerWorlds.register(new PlayerWorld(player, world, game.rules));
        game.playerGovernments.register(
          new PlayerGovernment(player, game.availableGovernments, game.rules)
        );
        game.playerResearch.register(playerResearch);
        research.set(player, playerResearch);
      });
      game.clients.register(
        new AIClient(owner),
        new Client(human),
        new AIClient(third)
      );
      research.get(owner)!.addAdvance(BronzeWorking);
      known.forEach((Advance) => research.get(human)!.addAdvance(Advance));
      game.availableCityBuildItems.register(
        ...([Warrior, Spearman] as unknown as (typeof Buildable)[])
      );
      game.rules.register(...buildCost(Spearman, 20));

      const city = new City(owner, world.get(2, 2), 'Test', game.rules),
        cityBuild: CityBuild = game.cityBuilds.getByCity(city);

      game.cityGrowth.getByCity(city).grow();
      cityBuild.build(Spearman as unknown as typeof Buildable);
      city.capture(human);

      expect(cityBuild.building()!.item()).to.equal(Spearman);

      const discovers = (player: Player) =>
        research.get(player)!.addAdvance.bind(research.get(player)!);

      return {
        cityBuild,
        discover: discovers(human),
        ownerDiscovers: discovers(owner),
        thirdDiscovers: discovers(third),
      };
    };

    it('should keep a Spearman the human can build through an unrelated discovery, and drop it at Gunpowder', async (): Promise<void> => {
      const { cityBuild, discover } = await captureSpearman(
        [BronzeWorking],
        [[CAPTURED_CITY_BUILD, false]]
      );

      discover(Writing);

      expect(cityBuild.building()!.item()).to.equal(Spearman);

      discover(Gunpowder);

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()).to.eql({
        reason: 'unavailable',
        item: Spearman,
      });
    });

    // It was dropped at Writing, as the human can't build it without Bronze Working.
    it("should keep a Spearman the human can't build through every discovery that does not make it obsolete for them, and drop it at their Gunpowder", async (): Promise<void> => {
      const { cityBuild, discover, ownerDiscovers, thirdDiscovers } =
        await captureSpearman([], [[CAPTURED_CITY_BUILD, false]]);

      discover(Writing);
      discover(Chivalry);
      thirdDiscovers(Gunpowder);
      ownerDiscovers(Gunpowder);

      expect(cityBuild.building()!.item()).to.equal(Spearman);
      expect(cityBuild.cleared()).null;

      discover(Gunpowder);

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()).to.eql({
        reason: 'unavailable',
        item: Spearman,
      });
    });

    it("should keep a Spearman that was already obsolete for the human through every later discovery, anyone's", async (): Promise<void> => {
      const { cityBuild, discover, ownerDiscovers, thirdDiscovers } =
        await captureSpearman(
          [BronzeWorking, Gunpowder],
          [[CAPTURED_CITY_BUILD, false]]
        );

      discover(Writing);
      discover(Chivalry);
      discover(Explosives);
      // Gunpowder also makes the Great Wall obsolete, for everyone: that entry's range is the world's, and it brings
      //  nothing about a Spearman to the human's cities (civ-clone/web-renderer#965).
      thirdDiscovers(Gunpowder);
      ownerDiscovers(Gunpowder);

      expect(cityBuild.building()!.item()).to.equal(Spearman);
      expect(cityBuild.cleared()).null;
    });

    it('should keep it with the parent switched off, as v474.05', async (): Promise<void> => {
      const { cityBuild, discover } = await captureSpearman(
        [],
        [[ENHANCED, false]]
      );

      discover(Writing);
      discover(Gunpowder);

      expect(cityBuild.building()!.item()).to.equal(Spearman);
    });

    it('should keep it through both with OBSOLETE_BUILDS switched off too, as v474.05', async (): Promise<void> => {
      const { cityBuild, discover } = await captureSpearman(
        [],
        [
          [CAPTURED_CITY_BUILD, false],
          [OBSOLETE_BUILDS, false],
        ]
      );

      discover(Writing);
      discover(Gunpowder);

      expect(cityBuild.building()!.item()).to.equal(Spearman);
    });
  });
});
