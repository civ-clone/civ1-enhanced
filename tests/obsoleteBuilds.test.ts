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
import Writing from '@civ-clone/base-science-advance-writing/Writing';
import { expect } from 'chai';

// A city that knows Bronze Working building Spearman, in a game with civ1-unit's rules (Gunpowder makes Spearman
//  obsolete) and this package's.
const setUp = async (on?: boolean) => {
  const game: Game = loadGame(['civ1-unit']),
    world = await buildWorld(game),
    player = new Player(game.rules),
    playerResearch = new PlayerResearch(
      player,
      new AdvanceRegistry(),
      game.rules
    ),
    availableItems = new AvailableCityBuildItemsRegistry();

  if (on !== undefined) {
    game.ruleSets.set(OBSOLETE_BUILDS, on);
  }

  game.playerResearch.register(playerResearch);
  playerResearch.addAdvance(BronzeWorking);
  availableItems.register(
    ...([Spearman, Musketman] as unknown as (typeof Buildable)[])
  );

  const city = new City(player, world.get(2, 2), 'Test', game.rules),
    cityBuild = new CityBuild(city, availableItems, game.rules);

  game.cities.register(city);
  game.cityBuilds.register(cityBuild);

  cityBuild.build(Spearman as unknown as typeof Buildable);
  cityBuild.add(new Production(5));

  return { cityBuild, playerResearch };
};

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

    it('should leave a build that can still be made', async (): Promise<void> => {
      const { cityBuild, playerResearch } = await setUp();

      playerResearch.addAdvance(Gunpowder);
      cityBuild.build(Musketman as unknown as typeof Buildable);
      playerResearch.addAdvance(Writing);

      expect(cityBuild.building()!.item()).to.equal(Musketman);
    });
  });

  describe('kept, as v474.05, switched off', (): void => {
    it('should go on building Spearman after Gunpowder is discovered, and finish it', async (): Promise<void> => {
      const { cityBuild, playerResearch } = await setUp(false);

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
  });
});
