import { Musketman, Spearman } from '@civ-clone/civ1-unit/Units';
import loadGame, { buildWorld } from './lib/loadGame';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import BronzeWorking from '@civ-clone/base-science-advance-bronzeworking/BronzeWorking';
import Buildable from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { Game } from '@civ-clone/core-game/Game';
import Gunpowder from '@civ-clone/base-science-advance-gunpowder/Gunpowder';
import { OBSOLETE_BUILDS } from '../RuleSets';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import { Production } from '@civ-clone/civ1-world/Yields';
import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import BuildingCancelled from '@civ-clone/core-city-build/Rules/BulidingCancelled';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { ENHANCED } from '../RuleSets';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import Writing from '@civ-clone/base-science-advance-writing/Writing';
import { deriveBuildRules } from '@civ-clone/civ1-unit/Rules/City/build';
import { expect } from 'chai';

// A city (or more) of a player who knows Bronze Working, building Spearman, in a game with civ1-unit's rules (Gunpowder makes Spearman
//  obsolete) and this package's.
const setUp = async (set?: [string, boolean], cities: number = 1) => {
  const game: Game = loadGame(['civ1-unit']),
    world = await buildWorld(game),
    player = new Player(game.rules),
    playerResearch = new PlayerResearch(
      player,
      new AdvanceRegistry(),
      game.rules
    ),
    availableItems = new AvailableCityBuildItemsRegistry();

  if (set !== undefined) {
    game.ruleSets.set(...set);
  }

  game.playerResearch.register(playerResearch);
  playerResearch.addAdvance(BronzeWorking);
  availableItems.register(
    ...([Spearman, Musketman] as unknown as (typeof Buildable)[])
  );

  const cityBuilds = Array.from({ length: cities }, (_, x: number) => {
    const city = new City(player, world.get(x * 2, 2), 'Test', game.rules),
      cityBuild = new CityBuild(city, availableItems, game.rules);

    game.cities.register(city);
    game.cityBuilds.register(cityBuild);

    cityBuild.build(Spearman as unknown as typeof Buildable);
    cityBuild.add(new Production(5));

    return cityBuild;
  });

  return {
    availableItems,
    cityBuild: cityBuilds[0],
    cityBuilds,
    game,
    playerResearch,
    world,
  };
};

// An entry of `range` that makes `Unit` obsolete once a city's player has Writing, played by civ1-unit's rule.
const obsoleteAtWriting = (
  game: Game,
  Unit: unknown,
  range: 'player' | 'world'
): void =>
  game.requirements.add(
    deriveBuildRules(game.playerResearch),
    new Requirement({
      id: `test:city/build/obsolete-${range}/${(Unit as Function).name}`,
      subject: Unit as never,
      relation: 'obsoletedBy',
      targets: [Writing],
      range,
    })
  );

describe('a build a discovery makes obsolete (civ-clone/web-renderer#954)', (): void => {
  describe('dropped, by default', (): void => {
    it('should be on', (): void => {
      expect(loadGame(['civ1-unit']).ruleSets.state(OBSOLETE_BUILDS)).to.equal(
        'on'
      );
    });

    it('should stop building Spearman when Gunpowder is discovered, keep the shields, and say why', async (): Promise<void> => {
      const { cityBuild, playerResearch } = await setUp();

      playerResearch.addAdvance(Gunpowder);

      expect(cityBuild.building()).null;
      expect(cityBuild.progress().value()).to.equal(5);
      expect(cityBuild.cleared()).to.eql({
        reason: 'unavailable',
        item: Spearman,
      });
    });

    it("should drop it in every one of the player's cities", async (): Promise<void> => {
      const { cityBuilds, playerResearch } = await setUp(undefined, 2);

      playerResearch.addAdvance(Gunpowder);

      cityBuilds.forEach((cityBuild: CityBuild): void => {
        expect(cityBuild.building()).null;
        expect(cityBuild.cleared()).to.eql({
          reason: 'unavailable',
          item: Spearman,
        });
      });
    });

    it("should drop them in the order of the player's cities, as it always has", async (): Promise<void> => {
      const { cityBuilds, game, playerResearch } = await setUp(undefined, 3),
        order: CityBuild[] = [];

      game.rules.register(
        new BuildingCancelled(
          new Effect((cityBuild: CityBuild): void => {
            order.push(cityBuild);
          })
        )
      );

      playerResearch.addAdvance(Gunpowder);

      // As indices, so a failure prints numbers rather than whole cities.
      const index = (cityBuild: CityBuild): number =>
        cityBuilds.indexOf(cityBuild);

      expect(order.map(index)).to.eql(
        game.cities
          .getByPlayer(playerResearch.player())
          .map((city: City) => index(game.cityBuilds.getByCity(city)))
      );
      expect(order.map(index).sort()).to.eql([0, 1, 2]);
    });

    // A build it could not make before, such as one kept from a capture, is left for its city to finish
    //  (civ-clone/web-renderer#965).
    it('should leave a build refused for any other reason than the discovery', async (): Promise<void> => {
      const { cityBuild, game, playerResearch } = await setUp();

      game.rules.register(
        new Build(
          'test:city/build/no-spearman',
          new Effect(
            (city: City, Item: unknown): IBuildCriterion =>
              new Criterion((): boolean => Item !== Spearman)
          )
        )
      );

      expect(cityBuild.getAvailable(Spearman as never)).undefined;

      playerResearch.addAdvance(Writing);

      expect(cityBuild.building()!.item()).to.equal(Spearman);
      expect(cityBuild.cleared()).null;
    });

    it("should drop one a plugin's own entry makes obsolete", async (): Promise<void> => {
      const { cityBuild, game, playerResearch } = await setUp();

      game.requirements.add(
        deriveBuildRules(game.playerResearch),
        new Requirement({
          id: 'test:city/build/obsolete/Spearman',
          subject: Spearman,
          relation: 'obsoletedBy',
          targets: [Writing],
        })
      );

      playerResearch.addAdvance(Writing);

      expect(cityBuild.building()).null;
      expect(cityBuild.cleared()).to.eql({
        reason: 'unavailable',
        item: Spearman,
      });
    });

    // Each entry is asked about only the cities its own range takes in (civ-clone/web-renderer#965): a `world` entry
    //  naming the same advance brings nothing of the `player` one to another player's cities.
    it("should keep another player's build that only a narrower entry naming the advance refuses", async (): Promise<void> => {
      const { availableItems, cityBuild, game, playerResearch, world } =
          await setUp(),
        other = new Player(game.rules),
        otherResearch = new PlayerResearch(
          other,
          new AdvanceRegistry(),
          game.rules
        ),
        otherCity = new City(other, world.get(4, 4), 'Other', game.rules),
        otherBuild = new CityBuild(otherCity, availableItems, game.rules);

      game.playerResearch.register(otherResearch);
      game.cities.register(otherCity);
      game.cityBuilds.register(otherBuild);
      otherResearch.addAdvance(BronzeWorking);
      otherBuild.build(Spearman as unknown as typeof Buildable);
      // As a build kept from a capture: already refused, by the `player` entry, once the other player has Writing.
      otherResearch.addAdvance(Writing);
      obsoleteAtWriting(game, Spearman, 'player');
      obsoleteAtWriting(game, Musketman, 'world');

      expect(otherBuild.getAvailable(Spearman as never)).undefined;

      playerResearch.addAdvance(Writing);

      expect(cityBuild.building()).null;
      expect(otherBuild.building()!.item()).to.equal(Spearman);
    });

    // A `world` entry takes in every city, `game.cities.entries()`, which still holds the destroyed ones.
    it('should leave the build of a destroyed city alone', async (): Promise<void> => {
      const { cityBuilds, playerResearch, game } = await setUp(undefined, 2);

      obsoleteAtWriting(game, Spearman, 'world');
      cityBuilds[1].city().destroy();

      playerResearch.addAdvance(Writing);

      expect(cityBuilds[0].building()).null;
      expect(cityBuilds[1].building()!.item()).to.equal(Spearman);
    });

    it('should leave a build that can still be made', async (): Promise<void> => {
      const { cityBuild, playerResearch } = await setUp();

      playerResearch.addAdvance(Gunpowder);
      cityBuild.build(Musketman as unknown as typeof Buildable);
      playerResearch.addAdvance(Writing);

      expect(cityBuild.building()!.item()).to.equal(Musketman);
    });
  });

  (
    [
      ['switched off', [OBSOLETE_BUILDS, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void =>
    describe(`kept, as v474.05, ${name}`, (): void => {
      it('should go on building Spearman after Gunpowder is discovered, and finish it', async (): Promise<void> => {
        const { cityBuild, playerResearch } = await setUp(set);

        playerResearch.addAdvance(Gunpowder);

        expect(cityBuild.building()!.item()).to.equal(Spearman);
        expect(cityBuild.progress().value()).to.equal(5);
        expect(cityBuild.cleared()).null;

        cityBuild.add(new Production(cityBuild.remaining()));

        expect(cityBuild.check()).to.be.instanceOf(Spearman);
        expect(cityBuild.cleared()).to.eql({
          reason: 'completed',
          item: Spearman,
        });
      });
    })
  );
});
