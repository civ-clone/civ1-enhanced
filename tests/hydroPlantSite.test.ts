import { Mountains, River } from '@civ-clone/civ1-world/Terrains';
import loadGame, { buildWorld } from './lib/loadGame';
import Build from '@civ-clone/core-city-build/Rules/Build';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game/Game';
import { ENHANCED, HYDRO_PLANT_SITE } from '../RuleSets';
import { HydroPlant } from '@civ-clone/civ1-city-improvement/CityImprovements';
import Tile from '@civ-clone/core-world/Tile';
import { hydroPlantSite, mountainsOrRiverOnOrNearby } from '../Requirements';
import AvailableCityBuildItemsRegistry from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import Buildable from '@civ-clone/core-city-build/Buildable';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import { HYDRO_PLANT_SITE_RULE } from '../RuleIds';
import { HYDRO_PLANT_SITE_RULE as CIV1_HYDRO_PLANT_SITE_RULE } from '@civ-clone/civ1-city-improvement/RuleIds';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Requirement from '@civ-clone/core-requirement/Requirement';
import { expect } from 'chai';

// The site rules that run for a Hydro Plant, each by id, and whether the city may build one by them. The rest of what
//  a Hydro Plant needs (Electronics, a Factory) is the same either way, and not asked here.
const site = (
  game: Game,
  tile: Tile
): { running: (string | null)[]; allowed: boolean } => {
  // Only the square is read: a city of its own would bring in what every other package does when one is founded.
  const city = { tile: (): Tile => tile } as unknown as City,
    rules = game.rules
      .get(Build)
      .filter((rule: Build): boolean =>
        (rule.id() ?? '').endsWith('/hydro-plant-site')
      )
      .filter((rule: Build): boolean => rule.validate(city, HydroPlant));

  return {
    running: rules.map((rule: Build) => rule.id()),
    allowed: rules.every((rule: Build): boolean =>
      rule.process(city, HydroPlant).validate()
    ),
  };
};

const withTerrain = async (
  game: Game,
  Mountainous: typeof Mountains | typeof River,
  where: 'city' | 'next to it' | 'nowhere'
): Promise<Tile> => {
  const world = await buildWorld(game),
    tile = world.get(2, 2);

  if (where === 'city') {
    tile.setTerrain(new Mountainous());
  }

  if (where === 'next to it') {
    tile.getNeighbour('n').setTerrain(new Mountainous());
  }

  return tile;
};

describe('a Hydro Plant site (civ-clone/web-renderer#954)', (): void => {
  describe('as v474.05, by default', (): void => {
    it("should be off, leaving civ1-city-improvement's rule to run alone", (): void => {
      const game = loadGame();

      expect(game.ruleSets.state(HYDRO_PLANT_SITE)).to.equal('off');
    });

    [Mountains, River].forEach((Mountainous): void => {
      it(`should allow one with ${Mountainous.name} next to the city`, async (): Promise<void> => {
        const game = loadGame();

        expect(
          site(game, await withTerrain(game, Mountainous, 'next to it'))
        ).to.eql({
          running: ['civ1-city-improvement:city/build/hydro-plant-site'],
          allowed: true,
        });
      });

      it(`should refuse one with ${Mountainous.name} only on the city's own square`, async (): Promise<void> => {
        const game = loadGame();

        expect(site(game, await withTerrain(game, Mountainous, 'city'))).to.eql(
          {
            running: ['civ1-city-improvement:city/build/hydro-plant-site'],
            allowed: false,
          }
        );
      });
    });
  });

  describe('as the manual has it, switched on', (): void => {
    const switchedOn = (): Game => {
      const game = loadGame();

      game.ruleSets.set(HYDRO_PLANT_SITE, true);

      return game;
    };

    [Mountains, River].forEach((Mountainous): void => {
      it(`should allow one with ${Mountainous.name} on the city's own square`, async (): Promise<void> => {
        const game = switchedOn();

        expect(site(game, await withTerrain(game, Mountainous, 'city'))).to.eql(
          {
            running: ['civ1-enhanced:city/build/hydro-plant-site'],
            allowed: true,
          }
        );
      });

      it(`should still allow one with ${Mountainous.name} next to the city`, async (): Promise<void> => {
        const game = switchedOn();

        expect(
          site(game, await withTerrain(game, Mountainous, 'next to it'))
        ).to.eql({
          running: ['civ1-enhanced:city/build/hydro-plant-site'],
          allowed: true,
        });
      });
    });

    it('should refuse one with neither on or near the city', async (): Promise<void> => {
      const game = switchedOn();

      expect(site(game, await withTerrain(game, Mountains, 'nowhere'))).to.eql({
        running: ['civ1-enhanced:city/build/hydro-plant-site'],
        allowed: false,
      });
    });

    it("should say it supersedes civ1-city-improvement's rule, and give it back when switched off", async (): Promise<void> => {
      const game = switchedOn(),
        enhanced = game.ruleSets.describe().find(({ id }) => id === ENHANCED)!,
        hydroPlantSite = enhanced.members.find(
          ({ id }) => id === HYDRO_PLANT_SITE
        )!;

      expect(hydroPlantSite.supersedes).to.eql([
        'civ1-city-improvement:city/build/hydro-plant-site',
      ]);

      game.ruleSets.set(HYDRO_PLANT_SITE, false);

      expect(
        site(game, await withTerrain(game, Mountains, 'city')).running
      ).to.eql(['civ1-city-improvement:city/build/hydro-plant-site']);
    });
  });

  // The page shows an entry while the rule with its id is switched on (web-renderer's `inForce`), and names an entry
  //  for each rule `CityBuild#unavailable` says refused an item (civ-clone/web-renderer#958).
  describe('its requirements entry', (): void => {
    // The Hydro Plant site entries the page would show, by id.
    const inForce = (game: Game): string[] =>
      game.requirements
        .for(HydroPlant)
        .filter(
          (entry: Requirement): boolean =>
            entry.id.endsWith('/hydro-plant-site') &&
            game.rules.getById(entry.id)?.enabled() !== false
        )
        .map((entry: Requirement): string => entry.id);

    // The ids of the rules refusing a Hydro Plant in a city on `tile`, whose player knows nothing.
    const refusedBy = (game: Game, tile: Tile): (string | null)[] => {
      const player = new Player(game.rules),
        city = {
          player: (): Player => player,
          tile: (): Tile => tile,
        } as unknown as City,
        available = new AvailableCityBuildItemsRegistry();

      game.playerResearch.register(
        new PlayerResearch(player, game.advances, game.rules)
      );
      available.register(HydroPlant as unknown as typeof Buildable);

      return new CityBuild(city, available, game.rules)
        .unavailable()
        .filter(({ item }) => item === (HydroPlant as unknown))
        .flatMap(({ refusedBy }) => refusedBy);
    };

    it('should describe the rule, with a condition of its own', (): void => {
      expect(mountainsOrRiverOnOrNearby.id).to.equal(
        'civ1-enhanced:mountains-or-river-on-or-nearby'
      );
      expect(hydroPlantSite.id).to.equal(HYDRO_PLANT_SITE_RULE);
      expect(hydroPlantSite.subject).to.equal(HydroPlant);
      expect(hydroPlantSite.relation).to.equal('requires');
      expect(hydroPlantSite.targets).to.eql([mountainsOrRiverOnOrNearby]);
      expect(hydroPlantSite.range).to.equal('city');

      const game = loadGame();

      expect(game.requirements.getById(HYDRO_PLANT_SITE_RULE)).to.equal(
        hydroPlantSite
      );
      // Only described: the rule is the hand-written one.
      expect(game.requirements.rulesFor(HYDRO_PLANT_SITE_RULE)).to.eql([]);
    });

    it("should be out of force by default, leaving civ1-city-improvement's in force and named as the reason", async (): Promise<void> => {
      const game = loadGame(),
        tile = await withTerrain(game, Mountains, 'nowhere');

      expect(inForce(game)).to.eql([CIV1_HYDRO_PLANT_SITE_RULE]);
      expect(refusedBy(game, tile))
        .to.include(CIV1_HYDRO_PLANT_SITE_RULE)
        .and.not.include(HYDRO_PLANT_SITE_RULE);
    });

    it("should be in force switched on, in civ1-city-improvement's place, and named as the reason with neither on or near the city", async (): Promise<void> => {
      const game = loadGame();

      game.ruleSets.set(HYDRO_PLANT_SITE, true);

      const tile = await withTerrain(game, Mountains, 'nowhere');

      expect(inForce(game)).to.eql([HYDRO_PLANT_SITE_RULE]);
      expect(refusedBy(game, tile))
        .to.include(HYDRO_PLANT_SITE_RULE)
        .and.not.include(CIV1_HYDRO_PLANT_SITE_RULE);

      // Every reason has an entry in force to say it.
      refusedBy(game, tile).forEach((id: string | null): void => {
        expect(game.requirements.getById(id!), id!).not.null;
        expect(game.rules.getById(id!)!.enabled(), id!).true;
      });

      game.ruleSets.set(HYDRO_PLANT_SITE, false);

      expect(inForce(game)).to.eql([CIV1_HYDRO_PLANT_SITE_RULE]);
    });

    it("should name no site reason switched on with Mountains on the city's own square", async (): Promise<void> => {
      const game = loadGame();

      game.ruleSets.set(HYDRO_PLANT_SITE, true);

      expect(
        refusedBy(game, await withTerrain(game, Mountains, 'city')).filter(
          (id: string | null): boolean => id!.endsWith('/hydro-plant-site')
        )
      ).to.eql([]);
    });
  });
});
