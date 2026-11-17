import {
  Alphabet,
  BronzeWorking,
  CeremonialBurial,
  Masonry,
  TheWheel,
} from '@civ-clone/civ1-science/Advances';
import {
  FIXED_RESEARCH_COSTS,
  RESEARCH_COST_BY_AGE,
  STARTING_ADVANCES_COUNT,
} from '../RuleSets';
import Client from '@civ-clone/core-client/Client';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Player from '@civ-clone/core-player/Player';
import { Prince } from '@civ-clone/civ1-difficulty/Difficulties';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Year from '@civ-clone/core-game-year/Year';
import advanceCount from '@civ-clone/core-science/advanceCount';
import { expect } from 'chai';
import loadGame from './lib/loadGame';

// The human at Prince (10 a step), BC, having started with two advances and gained two in play.
const setUp = (counted: boolean = true) => {
  const game = loadGame(['civ1-science'], undefined, {
      rng: (): number => 0,
      turn: { value: (): number => 1 } as unknown as Turn,
      year: { value: (): number => -4000 } as unknown as Year,
    }),
    player = new Player(game.rules),
    playerResearch = game.playerResearch.getByPlayer(player);

  game.ruleSets.set(STARTING_ADVANCES_COUNT, counted);
  game.difficulty.set(Prince);
  game.clients.register(new Client(player));
  playerResearch.addAdvance(CeremonialBurial, { starting: true });
  playerResearch.addAdvance(Masonry, { starting: true });
  playerResearch.addAdvance(Alphabet);
  playerResearch.addAdvance(BronzeWorking);

  return { game, playerResearch };
};

describe('starting advances count (civ-clone/web-renderer#973)', (): void => {
  it('should be on to start with, so the advances a player started with count, as they always have', (): void => {
    const game = loadGame(['civ1-science']);

    expect(game.ruleSets.state(STARTING_ADVANCES_COUNT)).to.equal('on');

    const { game: onGame, playerResearch } = setUp();

    expect(advanceCount(playerResearch, onGame.rules)).to.equal(4);
    // The fifth advance: 5 × 10.
    expect(onGame.rules.process(Cost, TheWheel, playerResearch)[0]).to.equal(
      50
    );
  });

  it("should count only the advances gained in play when it's off, as v474.05 does", (): void => {
    const { game, playerResearch } = setUp(false);

    expect(advanceCount(playerResearch, game.rules)).to.equal(2);
    // 3 × 10.
    expect(game.rules.process(Cost, TheWheel, playerResearch)[0]).to.equal(30);
  });

  it('should sit beside the other research sets, all on or all off, with nothing to block', (): void => {
    [true, false].forEach((on: boolean): void => {
      const game = loadGame(['civ1-science']);

      game.ruleSets.set(STARTING_ADVANCES_COUNT, on);
      game.ruleSets.set(FIXED_RESEARCH_COSTS, on);
      game.ruleSets.set(RESEARCH_COST_BY_AGE, on);

      expect(
        game.ruleSets.validate().filter(({ blocking }) => blocking),
        String(on)
      ).to.eql([]);
    });
  });
});
