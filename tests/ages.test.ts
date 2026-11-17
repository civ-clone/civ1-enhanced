import {
  Alphabet,
  CodeOfLaws,
  FusionPower,
  FutureTechnology,
  Literacy,
  TheRepublic,
  Writing,
} from '@civ-clone/civ1-science/Advances';
import { Ancient, Classical, Medieval, researchAges } from '../Ages';
import { AGES, FIXED_RESEARCH_COSTS } from '../RuleSets';
import { AGES_SETTLED_RULE, TIERED_COST_RULE } from '../RuleIds';
import Research from '@civ-clone/core-science/Yields/Research';
import Advance from '@civ-clone/core-science/Advance';
import Cost from '@civ-clone/core-science/Rules/Cost';
import Age from '@civ-clone/base-science-age/Age';
import Player from '@civ-clone/core-player/Player';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import advanceTiers from '../lib/advanceTiers';
import { expect } from 'chai';
import loadGame from './lib/loadGame';
import { playerAge } from '@civ-clone/base-science-age/lib/ageOf';
import Requirement from '@civ-clone/core-requirement/Requirement';

// A game with civ1-science and this package, the ages switched as given, and a player who has `known`. `turn` is the
//  game's turn: 0 while the game is set up. The player is added during it, and unless `settled` is false, a turn has
//  started since, as for a player who has been in the game a while.
const setUp = ({
  on = true as boolean | null,
  turn = 1,
  settled = true,
  known = [] as (typeof Advance)[],
} = {}) => {
  let now = turn;

  const game = loadGame(['civ1-science'], undefined, {
      rng: (): number => 0,
      turn: { value: (): number => now } as unknown as Turn,
    }),
    heard: string[] = [];

  // As a game is set up: its sets before its players.
  if (on !== null) {
    game.ruleSets.set(AGES, on);
  }

  // Another player added and what is heard of their research, told apart by `name`.
  const addPlayer = (name: string = '') => {
      const player = new Player(game.rules),
        playerResearch = game.playerResearch.getByPlayer(player),
        prefix = name === '' ? '' : `${name}: `;

      game.engine.on(
        'player:research-complete',
        (research: PlayerResearch, advance: Advance): void => {
          if (research === playerResearch) {
            heard.push(`${prefix}${advance.sourceClass().name}`);
          }
        }
      );
      game.engine.on(
        'player:age-reached',
        (
          research: PlayerResearch,
          age: typeof Age,
          previous: typeof Age
        ): void => {
          if (research === playerResearch) {
            heard.push(`${prefix}${previous.name} to ${age.name}`);
          }
        }
      );

      return playerResearch;
    },
    // A new turn starting: only the ages' own `Start` rule, as the others want a world.
    startTurn = (value: number = now + 1): void => {
      now = value;
      game.rules.getById(AGES_SETTLED_RULE)!.process(game.turn);
    },
    playerResearch = addPlayer();

  if (settled) {
    startTurn(now);
  }

  known.forEach((Known) => playerResearch.addAdvance(Known));

  return {
    game,
    playerResearch,
    heard,
    addPlayer,
    startTurn,
    age: () => playerAge(playerResearch, game.rules),
  };
};

describe('ages (civ-clone/web-renderer#1076)', (): void => {
  it('should be off to start with: no age, and nothing told', (): void => {
    const { game, heard, age } = setUp({ on: null, known: [CodeOfLaws] });

    expect(game.ruleSets.state(AGES)).to.equal('off');
    expect(age()).to.equal(null);
    expect(heard).to.eql(['CodeOfLaws']);
  });

  it('should put every advance that can be learnt once in one age, never before an advance it needs, and none in no age', (): void => {
    const { game } = setUp(),
      advances = game.advances.filter(
        (AdvanceType: typeof Advance): boolean => !AdvanceType.repeatable
      ),
      tiers = advanceTiers(game);

    expect(advances).to.have.length(67);
    advances.forEach((AdvanceType: typeof Advance): void => {
      expect(researchAges[tiers.get(AdvanceType)!], AdvanceType.name).to.be.a(
        'function'
      );
    });
    // An advance's own prerequisites are in its tier or an earlier one.
    game.requirements
      .entries()
      .filter(
        (entry: Requirement): boolean =>
          entry.relation === 'requires' &&
          advances.includes(entry.subject as typeof Advance)
      )
      .forEach((entry: Requirement): void =>
        entry.targets
          .filter((target) => advances.includes(target as typeof Advance))
          .forEach((target) =>
            expect(
              tiers.get(target as typeof Advance)!,
              `${(target as typeof Advance).name}, for ${
                (entry.subject as typeof Advance).name
              }`
            ).to.be.below(tiers.get(entry.subject as typeof Advance)! + 1)
          )
      );
    expect(
      researchAges.map((AgeType) =>
        advances.some(
          (AdvanceType) => researchAges[tiers.get(AdvanceType)!] === AgeType
        )
      )
    ).to.eql(researchAges.map(() => true));
    expect(tiers.has(FutureTechnology)).false;
  });

  it('should be the age of the latest tier its player knows an advance of, and the first knowing none', (): void => {
    const { age, playerResearch } = setUp();

    expect(age()).to.equal(Ancient);

    playerResearch.addAdvance(Alphabet);

    expect(age()).to.equal(Ancient);

    playerResearch.addAdvance(TheRepublic);

    expect(age()).to.equal(Medieval);

    playerResearch.addAdvance(CodeOfLaws);

    expect(age()).to.equal(Medieval);
  });

  it('should tell of each new age once, after the advance that starts it', (): void => {
    const { heard } = setUp({
      known: [Alphabet, CodeOfLaws, Writing, Literacy, TheRepublic],
    });

    expect(heard).to.eql([
      'Alphabet',
      'CodeOfLaws',
      'Ancient to Classical',
      'Writing',
      'Literacy',
      'TheRepublic',
      'Classical to Medieval',
    ]);
  });

  it('should tell of the later age once when an advance jumps over ages', (): void => {
    const { heard } = setUp({ known: [Alphabet, FusionPower] });

    expect(heard).to.eql(['Alphabet', 'FusionPower', 'Ancient to Space']);
  });

  it('should tell nothing of the advances a civilization starts with, before the first turn', (): void => {
    const { heard, age, playerResearch, startTurn } = setUp({
      turn: 0,
      settled: false,
      known: [CodeOfLaws],
    });

    expect(heard).to.eql(['CodeOfLaws']);
    expect(age()).to.equal(Classical);

    startTurn(1);
    playerResearch.addAdvance(Writing);
    playerResearch.addAdvance(TheRepublic);

    expect(heard).to.eql([
      'CodeOfLaws',
      'Writing',
      'TheRepublic',
      'Classical to Medieval',
    ]);
  });

  it('should tell nothing of what a civilization added part-way through a turn is given, until the next turn starts', (): void => {
    // As `civ1-game-end` brings a civilization back, with the advances it inherits, on turn 40.
    const { heard, addPlayer, startTurn } = setUp({ turn: 40 }),
      comeBack = addPlayer('back');

    [Alphabet, CodeOfLaws, Writing, Literacy, TheRepublic].forEach((Known) =>
      comeBack.addAdvance(Known)
    );

    expect(heard.filter((line) => line.includes(' to '))).to.eql([]);

    startTurn();
    comeBack.addAdvance(FusionPower);

    expect(heard.filter((line) => line.includes(' to '))).to.eql([
      'back: Medieval to Space',
    ]);
  });

  it("should tell of each player's ages for that player alone", (): void => {
    const { heard, playerResearch, addPlayer, startTurn } = setUp(),
      other = addPlayer('other');

    startTurn();
    other.addAdvance(CodeOfLaws);
    playerResearch.addAdvance(Alphabet);
    other.addAdvance(Writing);
    playerResearch.addAdvance(Writing);

    expect(heard).to.eql([
      'other: CodeOfLaws',
      'other: Ancient to Classical',
      'Alphabet',
      'other: Writing',
      'Writing',
      'Ancient to Classical',
    ]);
  });

  it('should tell of an age reached by research, as by any other way', (): void => {
    const { heard, playerResearch } = setUp({ known: [Alphabet] });

    playerResearch.research(CodeOfLaws);
    playerResearch.add(new Research(10000));

    expect(heard).to.eql(['Alphabet', 'CodeOfLaws', 'Ancient to Classical']);
  });

  it('should work alongside the fixed research costs, which leave it as it is', (): void => {
    const { game, age, heard, playerResearch } = setUp();

    game.ruleSets.set(FIXED_RESEARCH_COSTS, true);
    playerResearch.addAdvance(TheRepublic);

    expect(game.rules.getById(TIERED_COST_RULE)!.enabled()).true;
    expect(game.rules.process(Cost, Writing, playerResearch)[0]).to.be.a(
      'number'
    );
    expect(age()).to.equal(Medieval);
    expect(heard).to.eql(['TheRepublic', 'Ancient to Medieval']);
  });
});
