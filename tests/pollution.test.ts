import { ENHANCED, POLLUTION_IN_EVERY_CITY } from '../RuleSets';
import loadGame, { buildWorld, scriptedRng } from './lib/loadGame';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Client from '@civ-clone/core-client/Client';
import { Game } from '@civ-clone/core-game/Game';
import { Ocean } from '@civ-clone/civ1-world/Terrains';
import { Trade } from '@civ-clone/civ1-world/Yields';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerWorld from '@civ-clone/core-player-world/PlayerWorld';
import { Pollution } from '@civ-clone/civ1-world/TileImprovements';
import ProcessYield from '@civ-clone/core-city/Rules/ProcessYield';
import { Production } from '@civ-clone/civ1-city-improvement/Yields';
import Tile from '@civ-clone/core-world/Tile';
import built from '@civ-clone/civ1-world/Rules/TileImprovement/built';
import cityTiles from '@civ-clone/civ1-city/Rules/City/tiles';
import { expect } from 'chai';

type Owner = 'human' | 'computer';

// A city of `owner`'s on a 7 × 7 Grassland world, in a game with civ1-city-improvement's rules and this package's, with `set` switched as given (left as it starts unless told). The game's random number generator returns
//  `rolls`, in turn, then 0.
const setUp = async (
  owner: Owner,
  rolls: number[] = [],
  set: [string, boolean] | null = null
) => {
  const game: Game = loadGame(['civ1-city-improvement'], undefined, {
      rng: scriptedRng(rolls),
    }),
    world = await buildWorld(game, 7),
    player = new Player(game.rules),
    events: [City, Tile][] = [];

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  // civ1-world's, which puts Pollution on its tile, and civ1-city's, which gives a city its 20 squares.
  game.rules.register(
    ...built(game.tileImprovements, game.engine),
    ...cityTiles()
  );
  game.players.register(player);
  game.playerWorlds.register(new PlayerWorld(player, world, game.rules));
  game.playerResearch.register(
    new PlayerResearch(player, new AdvanceRegistry(), game.rules)
  );
  game.clients.register(
    owner === 'human' ? new Client(player) : new AIClient(player)
  );

  const city = new City(player, world.get(3, 3), 'Test', game.rules);

  game.cities.register(city);
  game.cityGrowth.register(new CityGrowth(city, game.rules));

  game.engine.on('city:polluted', (pollutingCity: City, tile: Tile) =>
    events.push([pollutingCity, tile])
  );

  return {
    city,
    events,
    game,
    // Pollution on the squares around the city.
    polluted: (): Tile[] =>
      city
        .tiles()
        .entries()
        .filter((tile: Tile): boolean =>
          game.tileImprovements
            .getByTile(tile)
            .some((improvement) => improvement instanceof Pollution)
        ),
    // A turn's shields, as the city's yields are processed.
    processTurn: (shields: number): void => {
      game.rules.process(
        ProcessYield,
        new Production(shields, 'Consolidated'),
        city,
        [new Production(shields)]
      );
    },
    rolls,
  };
};

// What happens in the human's cities whichever pollution rule is in force: civ1-city-improvement's tests of it, here
//  through the game's rules.
const inTheHumansCities = (set: [string, boolean] | null): void => {
  it('pollutes a square around the city when 2 × points beats the roll', async (): Promise<void> => {
    // 30 shields is 10 points. With no level chosen the game is played at King, so with 1 advance known the roll is out
    //  of 256 − floor(1 × 3 ÷ 2) = 255: 20 beats a roll of 19, but not one of 20.
    const passes = await setUp('human', [19.5 / 256, 0], set);

    passes.processTurn(30);

    expect(passes.polluted().length).to.equal(1);
    expect(passes.events).to.eql([[passes.city, passes.polluted()[0]]]);
    // Rolled once: one rule or the other, never both.
    expect(passes.game.rng.calls()).to.equal(2);

    const fails = await setUp('human', [20.5 / 256, 0], set);

    fails.processTurn(30);

    expect(fails.polluted().length).to.equal(0);
    expect(fails.events.length).to.equal(0);
  });

  it('never pollutes without points', async (): Promise<void> => {
    const { events, processTurn } = await setUp('human', [0, 0], set);

    processTurn(20);

    expect(events.length).to.equal(0);
  });

  it('rolls once a turn, for the shields, not for any other yield', async (): Promise<void> => {
    const { city, events, game, rolls } = await setUp('human', [0, 0], set);

    game.rules.process(ProcessYield, new Trade(100), city, [
      new Production(100),
      new Trade(100),
    ]);

    expect(events.length).to.equal(0);
    expect(rolls).to.eql([0, 0]);
  });

  it("doesn't pollute Ocean, a city or a polluted square, and doesn't roll again", async (): Promise<void> => {
    for (const prepare of [
      (tile: Tile): void => tile.setTerrain(new Ocean()),
      (tile: Tile, { city, game }: { city: City; game: Game }): void =>
        game.cities.register(new City(city.player(), tile, 'B', game.rules)),
      (tile: Tile, { game }: { game: Game }): void =>
        void new Pollution(tile, game.rules),
    ]) {
      const setup = await setUp('human', [0, 0, 0, 0], set),
        [first] = setup.city
          .tiles()
          .entries()
          .filter((tile: Tile): boolean => tile !== setup.city.tile());

      prepare(first, setup);

      const before = setup.polluted().length;

      setup.processTurn(30);

      expect(setup.events.length).to.equal(0);
      expect(setup.polluted().length).to.equal(before);
      expect(setup.rolls).to.eql([0, 0]);
    }
  });
};

describe('pollution in every city (civ-clone/web-renderer#954)', (): void => {
  describe("in a computer player's city too, by default", (): void => {
    it('should be on', (): void => {
      expect(
        loadGame(['civ1-city-improvement']).ruleSets.state(
          POLLUTION_IN_EVERY_CITY
        )
      ).to.equal('on');
    });

    inTheHumansCities(null);

    it("should pollute a computer player's city as the human's (civ-clone/web-renderer#32)", async (): Promise<void> => {
      const { city, events, game, polluted, processTurn } = await setUp(
        'computer',
        [19.5 / 256, 0]
      );

      processTurn(30);

      expect(polluted().length).to.equal(1);
      expect(events).to.eql([[city, polluted()[0]]]);
      expect(game.rng.calls()).to.equal(2);
    });
  });

  (
    [
      ['switched off', [POLLUTION_IN_EVERY_CITY, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void => {
    describe(`only in the human's cities, as v474.05, ${name}`, (): void => {
      inTheHumansCities(set);

      it("should neither pollute nor roll for a computer player's city, however much it pollutes", async (): Promise<void> => {
        const { events, polluted, processTurn, rolls } = await setUp(
          'computer',
          [0, 0],
          set
        );

        processTurn(100);

        expect(polluted().length).to.equal(0);
        expect(events.length).to.equal(0);
        expect(rolls).to.eql([0, 0]);
      });
    });
  });
});
