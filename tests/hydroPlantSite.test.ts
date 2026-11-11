import { Mountains, River } from '@civ-clone/civ1-world/Terrains';
import loadGame, { buildWorld } from './lib/loadGame';
import Build from '@civ-clone/core-city-build/Rules/Build';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game/Game';
import { ENHANCED, HYDRO_PLANT_SITE } from '../RuleSets';
import { HydroPlant } from '@civ-clone/civ1-city-improvement/CityImprovements';
import Tile from '@civ-clone/core-world/Tile';
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
});
