import { CAPTURED_CITY_BUILD, ENHANCED } from '../RuleSets';
import { Spearman, Warrior } from '@civ-clone/civ1-unit/Units';
import loadGame, { buildWorld } from './lib/loadGame';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import BuildCostModifier from '@civ-clone/core-city-build/Rules/BuildCostModifier';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Client from '@civ-clone/core-client/Client';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import { buildCost } from '@civ-clone/core-city-build/Rules/BuildCost';
import { expect } from 'chai';

type Captor = 'human' | 'computer';

// A city of size 3 (unless told) building Warrior on Auto, 5 shields in, its price doubled for its owner (a computer player), taken
//  by `captor`, in a game with civ1-city's rules and this package's, with `set` switched as given (left as it starts
//  unless told).
const capture = async (
  captor: Captor,
  set: [string, boolean] | null = null,
  building: typeof Buildable | null = Warrior as unknown as typeof Buildable,
  size: number = 3
) => {
  const game: Game = loadGame(['civ1-city']),
    world = await buildWorld(game),
    owner = new Player(game.rules),
    capturer = new Player(game.rules);

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
    ...([Warrior, Spearman] as unknown as (typeof Buildable)[])
  );
  game.rules.register(
    new Build(new Effect((): IBuildCriterion => new Criterion(() => true))),
    ...buildCost(Warrior, 10),
    ...buildCost(Spearman, 20),
    new BuildCostModifier(
      new Criterion(
        (buildItem, city: City | null): boolean => city?.player() === owner
      ),
      new Effect((buildItem, city, cost: number): number => cost * 2)
    )
  );

  const city = new City(owner, world.get(2, 2), 'Test', game.rules),
    cityBuild: CityBuild = game.cityBuilds.getByCity(city);

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

  city.capture(capturer);

  expect(city.player()).to.equal(capturer);
  expect(city.destroyed()).to.equal(size === 1);

  return { before, city, cityBuild, game };
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

    // Cleared after `civ1-city`'s rules shrink it, where `civ1-city`'s own rule cleared it before: the same either way.
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
});
