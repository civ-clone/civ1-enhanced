import { BARBARIAN_UPRISINGS, ENHANCED } from '../RuleSets';
import { Diplomat, Horseman } from '@civ-clone/civ1-unit/Units';
import loadGame, { buildWorld, scriptedRng } from './lib/loadGame';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Client from '@civ-clone/core-client/Client';
import Created from '@civ-clone/core-unit/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';
import { Emperor } from '@civ-clone/civ1-difficulty/Difficulties';
import { Game } from '@civ-clone/core-game/Game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';

type Owner = 'human' | 'computer';

// A city of size 1 with 100 gold behind it at (5, 5) on a 20 × 20 Grassland world, of `owner`'s, in a game on Emperor
//  with civ1-barbarians' rules and this package's, with `set` switched as given (left as it starts unless told). The
//  barbarians are already in the game. The game's random number generator returns `rolls`, in turn, then 0.
const setUp = async (
  owner: Owner,
  rolls: number[],
  set: [string, boolean] | null = null
) => {
  const game: Game = loadGame(['civ1-barbarians'], undefined, {
      rng: scriptedRng(rolls),
    }),
    world = await buildWorld(game, 20),
    player = new Player(game.rules),
    barbarians = new Player(game.rules),
    uprisings: [Player, City, Tile, boolean][] = [];

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  game.difficulty.set(Emperor);
  game.rules.register(
    new Created(new Effect((unit: Unit): void => game.units.register(unit)))
  );
  barbarians.setCivilization(new Barbarian());
  game.players.register(player, barbarians);
  game.clients.register(
    owner === 'human' ? new Client(player) : new AIClient(player)
  );

  const treasury = new PlayerTreasury(
    player,
    Gold,
    game.cityBuilds,
    game.rules
  );

  treasury.add(100);
  game.playerTreasuries.register(treasury);

  const city = new City(player, world.get(5, 5), 'Test', game.rules);

  game.cities.register(city);
  game.cityGrowth.register(new CityGrowth(city, game.rules));

  game.engine.on(
    'barbarians:uprising',
    (...args: [Player, City, Tile, boolean]): void => {
      uprisings.push(args);
    }
  );

  return {
    barbarians,
    city,
    game,
    rolls,
    startTurn: (turn: number): void => {
      game.turn.set(turn);
      game.rules.process(Start, game.turn);
    },
    uprisings,
  };
};

// Slot 0 (the city), a chance roll of 0 against its gold of 100 × 1 ÷ 2 = 50, then one try for the square: x + 6,
//  y + 0, and a group roll that gives the fewest, 3.
const rising = (): number[] => [0, 0, 12.5 / 13, 6.5 / 13, 0.9];

// What happens in the human's cities whichever uprising rule is in force: civ1-barbarians' tests of it, here through
//  the game's rules.
const nearTheHumansCities = (set: [string, boolean] | null): void => {
  it("should rise near the human's city, at least 6 away, with Horsemen and a Diplomat, and roll once for it", async (): Promise<void> => {
    const { barbarians, city, game, startTurn, uprisings } = await setUp(
      'human',
      rising(),
      set
    );

    startTurn(34);

    expect(uprisings).to.have.length(1);

    const [[player, target, tile, guerrilla]] = uprisings;

    expect(player).to.equal(barbarians);
    expect(target).to.equal(city);
    expect([tile.x(), tile.y()]).to.eql([11, 5]);
    expect(guerrilla).false;
    expect(
      game.units.getByPlayer(barbarians).map((unit: Unit) => unit.constructor)
    ).to.eql([Horseman, Horseman, Diplomat]);
    // One rule or the other, never both.
    expect(game.rng.calls()).to.equal(5);
  });

  it("should not rise before the barbarians' first turn, (5 − level) × 30, nor roll for it", async (): Promise<void> => {
    const { game, startTurn, uprisings } = await setUp('human', rising(), set);

    // Turn 29 in v474.05's count, on Emperor.
    startTurn(31);

    expect(uprisings).to.have.length(0);
    expect(game.rng.calls()).to.equal(0);
  });

  it("should rise with a chance of the city's gold in 100, drawn from 128 slots", async (): Promise<void> => {
    // Slot 1 of 128: no city there.
    const empty = await setUp('human', [1.5 / 128, 0], set);

    empty.startTurn(34);

    expect(empty.uprisings).to.have.length(0);
    expect(empty.rolls).to.eql([0]);

    // Slot 0, but a roll of 50 against gold 50.
    const unlucky = await setUp('human', [0, 0.5, 0.999], set);

    unlucky.startTurn(34);

    expect(unlucky.uprisings).to.have.length(0);
    expect(unlucky.rolls).to.eql([0.999]);
  });
};

describe('barbarian uprisings (civ-clone/web-renderer#954)', (): void => {
  describe("near any civilization's city, by default", (): void => {
    it('should be on', (): void => {
      expect(
        loadGame(['civ1-barbarians']).ruleSets.state(BARBARIAN_UPRISINGS)
      ).to.equal('on');
    });

    nearTheHumansCities(null);

    it("should rise near a computer player's city as the human's (civ-clone/web-renderer#27)", async (): Promise<void> => {
      const { city, startTurn, uprisings } = await setUp('computer', rising());

      startTurn(34);

      expect(uprisings).to.have.length(1);
      expect(uprisings[0][1]).to.equal(city);
    });
  });

  (
    [
      ['switched off', [BARBARIAN_UPRISINGS, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void => {
    describe(`near the human's cities only, as v474.05, ${name}`, (): void => {
      nearTheHumansCities(set);

      it("should never rise near a computer player's city, nor roll again once its slot is drawn", async (): Promise<void> => {
        const { game, startTurn, uprisings, rolls } = await setUp(
          'computer',
          rising(),
          set
        );

        startTurn(34);

        expect(uprisings).to.have.length(0);
        expect(game.units.entries()).to.have.length(0);
        expect(rolls).to.eql(rising().slice(1));
      });
    });
  });
});
