import { ENHANCED, UNITED_NATIONS_STOPS_COMPUTER_WARS } from '../RuleSets';
import { GreatWall, UnitedNations } from '@civ-clone/civ1-wonder/Wonders';
import loadGame, { buildWorld } from './lib/loadGame';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import AdvanceRegistry from '@civ-clone/core-science/AdvanceRegistry';
import City from '@civ-clone/core-city/City';
import Client from '@civ-clone/core-client/Client';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { expect } from 'chai';
import isPacified from '@civ-clone/library-diplomacy/lib/isPacified';

type Seat = 'human' | 'computer';

// An owner of `WonderType`, in a seat of `ownerSeat`, and a computer player, in a game with civ1-wonder's rules and
//  this package's, with `set` switched as given (left as it starts unless told).
const setUp = async (
  WonderType: typeof Wonder,
  ownerSeat: Seat,
  set: [string, boolean] | null = null
) => {
  const game = loadGame(['civ1-wonder']),
    world = await buildWorld(game),
    owner = new Player(game.rules),
    rival = new Player(game.rules);

  if (set !== null) {
    game.ruleSets.set(...set);
  }

  game.players.register(owner, rival);
  [owner, rival].forEach((player: Player): void =>
    game.playerResearch.register(
      new PlayerResearch(player, new AdvanceRegistry(), game.rules)
    )
  );
  game.clients.register(
    ownerSeat === 'human' ? new Client(owner) : new AIClient(owner),
    new AIClient(rival)
  );

  const city = new City(owner, world.get(2, 2), 'Test', game.rules);

  game.cities.register(city);
  game.wonders.register(new WonderType(city, game.rules));

  return {
    owner,
    rival,
    // Whether `player` is pacified towards `other`, as `civ1-diplomacy` asks in a parley and between computer players.
    pacified: (player: Player, other: Player): boolean =>
      isPacified(player, other, game.rules),
  };
};

// What holds whichever United Nations rule is in force.
const asV47405 = (set: [string, boolean] | null): void => {
  it("should pacify a computer player's leader towards a human owner of the United Nations, and not the owner", async (): Promise<void> => {
    const { owner, rival, pacified } = await setUp(UnitedNations, 'human', set);

    expect(pacified(rival, owner)).true;
    expect(pacified(owner, rival)).false;
    expect(pacified(owner, owner)).false;
  });

  it("should leave the Great Wall's rule as it is, a computer owner's too", async (): Promise<void> => {
    for (const seat of ['human', 'computer'] as Seat[]) {
      const { owner, rival, pacified } = await setUp(GreatWall, seat, set);

      expect(pacified(rival, owner), seat).true;
    }
  });
};

describe('the United Nations stops computer wars (civ-clone/web-renderer#960)', (): void => {
  describe('between computer players too, by default', (): void => {
    it('should be on', (): void => {
      expect(
        loadGame(['civ1-wonder']).ruleSets.state(
          UNITED_NATIONS_STOPS_COMPUTER_WARS
        )
      ).to.equal('on');
    });

    asV47405(null);

    // civ1-wonder's test of it, as it was (civ-clone/web-renderer#30).
    it("should pacify other leaders towards a computer player that owns the United Nations, so they don't go to war with it", async (): Promise<void> => {
      const { owner, rival, pacified } = await setUp(UnitedNations, 'computer');

      expect(pacified(rival, owner)).true;
      expect(pacified(owner, rival)).false;
      expect(pacified(owner, owner)).false;
    });
  });

  (
    [
      ['switched off', [UNITED_NATIONS_STOPS_COMPUTER_WARS, false]],
      ['with the parent switched off', [ENHANCED, false]],
    ] as [string, [string, boolean]][]
  ).forEach(([name, set]): void => {
    describe(`only towards a human owner, as v474.05, ${name}`, (): void => {
      asV47405(set);

      it('should not pacify anyone towards a computer player that owns the United Nations', async (): Promise<void> => {
        const { owner, rival, pacified } = await setUp(
          UnitedNations,
          'computer',
          set
        );

        expect(pacified(rival, owner)).false;
      });
    });
  });
});
