import {
  BARBARIAN_ACTIVITY,
  BARBARIAN_ACTIVITY_LEVEL,
  ENHANCED,
} from '../RuleSets';
import activities, {
  CHOICES,
  DEFAULT_MEMBER,
  Level,
  MEMBERS,
  memberId,
} from '../BarbarianActivities';
import activityOf, {
  CLASSIC_ACTIVITY,
} from '@civ-clone/civ1-barbarians/lib/activity';
import {
  Chieftain,
  Emperor,
  King,
  Lord,
  Prince,
} from '@civ-clone/civ1-difficulty/Difficulties';
import drawnLevel, {
  DRAWN_ACTIVITY,
  randomLevel,
} from '../lib/barbarianActivity';
import { Diplomat, Horseman, Sail, Swordman } from '@civ-clone/civ1-unit/Units';
import { Grassland, Ocean } from '@civ-clone/civ1-world/Terrains';
import {
  landingDue,
  raidersAtSeaAt,
} from '@civ-clone/civ1-barbarians/Rules/Turn/start';
import loadGame, { Civ1Package, scriptedRng } from './lib/loadGame';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import { BARBARIAN_ACTIVITY_RULE } from '../RuleIds';
import City from '@civ-clone/core-city/City';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Client from '@civ-clone/core-client/Client';
import Created from '@civ-clone/core-unit/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';
import FillGenerator from '@civ-clone/simple-world-generator/tests/lib/FillGenerator';
import { Game } from '@civ-clone/core-game/Game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';
import { firstSpawnTurnAt } from '@civ-clone/civ1-barbarians/Rules/Turn/spawning';
import { gameForLoad } from '@civ-clone/core-save-game/gameForLoad';
import { hydrate } from '@civ-clone/core-save-game/hydrate';
import { registerClasses } from '@civ-clone/core-save-game/registerClasses';
import { save } from '@civ-clone/core-save-game/save';
import spawning from '@civ-clone/civ1-barbarians/lib/spawning';

// A game with civ1-barbarians' rules and this package's, the barbarian activity set switched on (unless told) and the
//  level chosen.
const atLevel = (
  level: Level | 'random' | null,
  {
    packages = ['civ1-barbarians'],
    rolls = [],
    on = true,
  }: { packages?: Civ1Package[]; rolls?: number[]; on?: boolean } = {}
): Game => {
  const game = loadGame(packages, undefined, { rng: scriptedRng(rolls) });

  if (on) {
    game.ruleSets.set(BARBARIAN_ACTIVITY, true);
  }

  if (level !== null) {
    game.ruleSets.choose(BARBARIAN_ACTIVITY_LEVEL, memberId(level));
  }

  return game;
};

// Land on the top `land` rows of a 20 × 20 world, sea beneath.
class LandAndSea extends FillGenerator {
  generate(): Promise<Terrain[]> {
    return Promise.resolve(
      new Array(20 * 20)
        .fill(0)
        .map(
          (_, i: number): Terrain =>
            Math.floor(i / 20) < 10 ? new Grassland() : new Ocean()
        )
    );
  }
}

// A human's city of size 1 with 100 gold behind it at (5, 5) on Emperor, the barbarians already in the game, and the
//  events said.
const withCity = async (game: Game) => {
  const world = new World(new LandAndSea(20, 20, Grassland), game.rules),
    player = new Player(game.rules),
    barbarians = new Player(game.rules),
    said: [string, ...unknown[]][] = [];

  await world.build();

  game.difficulty.set(Emperor);
  game.rules.register(
    new Created(new Effect((unit: Unit): void => game.units.register(unit)))
  );
  barbarians.setCivilization(new Barbarian());
  game.players.register(player, barbarians);
  game.clients.register(new Client(player));

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

  ['barbarians:raiders-at-sea', 'barbarians:uprising'].forEach(
    (event: string): void => {
      game.engine.on(event, (...args: unknown[]): void => {
        said.push([event, ...args]);
      });
    }
  );

  return {
    barbarians,
    city,
    player,
    said,
    startTurn: (turn: number): void => {
      game.turn.set(turn);
      game.rules.process(Start, game.turn);
    },
    world,
  };
};

const units = (game: Game, player: Player): (typeof Unit)[] =>
  game.units
    .getByPlayer(player)
    .map((unit: Unit) => unit.constructor as typeof Unit);

// Slot 0 (the city), a chance roll of 0, then one try for the square: x + 6, y + 0, and a group roll that gives the
//  fewest, 3 (as `barbarianUprisings.test.ts`).
const rising = (): number[] => [0, 0, 12.5 / 13, 6.5 / 13, 0.9];

describe('the barbarian activity (civ-clone/web-renderer#1008)', (): void => {
  it('should be a set beneath the parent, off to start with, holding the rule that answers and a choice of five, Active to start with', (): void => {
    const game = loadGame();

    expect(game.ruleSets.get(BARBARIAN_ACTIVITY)!.memberIds()).to.eql([
      BARBARIAN_ACTIVITY_RULE,
      BARBARIAN_ACTIVITY_LEVEL,
    ]);
    expect(MEMBERS).to.eql([
      'civ1-enhanced:barbarian-activity/level/dormant',
      'civ1-enhanced:barbarian-activity/level/sporadic',
      'civ1-enhanced:barbarian-activity/level/active',
      'civ1-enhanced:barbarian-activity/level/fierce',
      'civ1-enhanced:barbarian-activity/level/random',
    ]);
    expect(game.ruleSets.get(BARBARIAN_ACTIVITY_LEVEL)!.memberIds()).to.eql(
      MEMBERS
    );
    expect(game.ruleSets.state(BARBARIAN_ACTIVITY)).to.equal('off');
    expect(game.ruleSets.chosen(BARBARIAN_ACTIVITY_LEVEL)).to.equal(
      DEFAULT_MEMBER
    );
    expect(DEFAULT_MEMBER).to.equal(memberId('active'));
    expect(game.rules.getById(BARBARIAN_ACTIVITY_RULE)!.enabled()).false;
    expect(
      game.ruleSets
        .validate()
        .filter(({ ids }) =>
          ids.some((id: string): boolean => id.startsWith(BARBARIAN_ACTIVITY))
        )
    ).to.eql([]);
    expect(game.ruleSets.choices()).to.eql([]);
  });

  it("should play v474.05's numbers while it is off, whatever level is chosen, and while the parent is off", (): void => {
    const game = atLevel('fierce', { on: false });

    expect(activityOf(game.rules)).to.equal(CLASSIC_ACTIVITY);

    game.ruleSets.set(BARBARIAN_ACTIVITY, true);

    expect(activityOf(game.rules)).to.equal(activities.fierce);

    game.ruleSets.set(ENHANCED, false);

    expect(activityOf(game.rules)).to.equal(CLASSIC_ACTIVITY);
    // The choice keeps its pick, for when it is switched on again.
    expect(game.ruleSets.chosen(BARBARIAN_ACTIVITY_LEVEL)).to.equal(
      memberId('fierce')
    );
  });

  it("should play v474.05's numbers at Active", (): void => {
    expect(activities.active).to.equal(CLASSIC_ACTIVITY);
    expect(activityOf(atLevel('active').rules)).to.equal(CLASSIC_ACTIVITY);
  });

  it('should answer with each level chosen', (): void => {
    (['dormant', 'sporadic', 'active', 'fierce'] as Level[]).forEach(
      (level: Level): void => {
        expect(activityOf(atLevel(level).rules), level).to.equal(
          activities[level]
        );
      }
    );
  });

  describe('the onset', (): void => {
    const levels = [Chieftain, Lord, Prince, King, Emperor];

    (
      [
        ['dormant', [Infinity, Infinity, Infinity, Infinity, Infinity]],
        ['sporadic', [165, 132, 99, 66, 33]],
        ['active', [150, 120, 90, 60, 30]],
        ['fierce', [135, 108, 81, 54, 27]],
      ] as [Level, number[]][]
    ).forEach(([level, turns]): void => {
      it(`should be ${turns.join(
        ', '
      )} from Chieftain to Emperor at ${level}`, (): void => {
        const game = atLevel(level);

        expect(
          levels.map((Difficulty, index: number): number => {
            game.difficulty.set(Difficulty);

            return firstSpawnTurnAt(index, activityOf(game.rules));
          })
        ).to.eql(turns);

        // The game's own gate, on Emperor, either side of the onset: our turn V plays v474.05's count V − 2.
        game.difficulty.set(Emperor);

        if (turns[4] === Infinity) {
          game.turn.set(1000);

          expect(spawning(game.rules, game.turn), 'turn 1000').false;

          return;
        }

        game.turn.set(turns[4] + 1);

        expect(spawning(game.rules, game.turn), 'just before').false;

        game.turn.set(turns[4] + 2);

        expect(spawning(game.rules, game.turn), 'from it').true;
      });
    });
  });

  it('should land every 16th turn at Sporadic, every 8th at Active and Fierce, and never at Dormant', (): void => {
    const counts = new Array(64).fill(0).map((_, count: number) => count),
      due = (level: Level): number[] =>
        counts.filter((count: number): boolean =>
          landingDue(count, activityOf(atLevel(level).rules))
        );

    expect(due('dormant')).to.eql([]);
    expect(due('sporadic')).to.eql([15, 31, 47, 63]);
    expect(due('active')).to.eql([7, 15, 23, 31, 39, 47, 55, 63]);
    expect(due('fierce')).to.eql(due('active'));
  });

  it('should send more raiders the fiercer it is, never more than a Frigate holds', (): void => {
    const counts = [0, 99, 100, 149, 150, 199, 200, 299, 300, 399, 400],
      raiders = (level: Level): number[] =>
        counts.map((count: number): number =>
          raidersAtSeaAt(count, activityOf(atLevel(level).rules))
        );

    expect(raiders('sporadic')).to.eql([1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3]);
    expect(raiders('active')).to.eql([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3]);
    expect(raiders('fierce')).to.eql([2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3]);
  });

  it('should put Fierce raiders aboard with their leader', async (): Promise<void> => {
    const game = atLevel('fierce', {
        packages: ['civ1-barbarians', 'civ1-unit'],
        rolls: [0, 0.999],
      }),
      { barbarians, said, startTurn } = await withCity(game);

    // Count 39: 1 raider, and Fierce's one more.
    startTurn(41);

    const [[, , ship]] = said.filter(
      ([event]) => event === 'barbarians:raiders-at-sea'
    ) as [string, Player, Unit][];

    expect(ship).to.be.instanceOf(Sail);
    expect(units(game, barbarians)).to.eql([
      Sail,
      Swordman,
      Swordman,
      Diplomat,
    ]);
    expect((ship as any).cargo()).to.have.length(3);
  });

  it('should raise uprisings one unit stronger at Fierce, and half as often at Sporadic', async (): Promise<void> => {
    const fierce = atLevel('fierce', { rolls: rising() }),
      { barbarians, said, startTurn } = await withCity(fierce);

    startTurn(34);

    expect(said).to.have.length(1);
    expect(units(fierce, barbarians)).to.eql([
      Horseman,
      Horseman,
      Horseman,
      Diplomat,
    ]);

    // The city's gold share is 50 (100 gold, 1 citizen of 1): a roll of 30 rises at Active, and not at Sporadic's 25.
    for (const [level, rises] of [
      ['active', true],
      ['sporadic', false],
    ] as [Level, boolean][]) {
      const game = atLevel(level, {
          rolls: [0, 0.3, 12.5 / 13, 6.5 / 13, 0.9],
        }),
        { said, startTurn } = await withCity(game);

      // Sporadic's onset on Emperor is count 33.
      startTurn(36);

      expect(said, level).to.have.length(rises ? 1 : 0);
    }
  });

  it('should raise nothing at Dormant, under either uprising rule, nor draw for it, but goody huts still release barbarians', async (): Promise<void> => {
    for (const uprisingsAnywhere of [true, false]) {
      const game = atLevel('dormant', {
          packages: ['civ1-barbarians', 'civ1-unit'],
        }),
        { barbarians, player, said, startTurn, world } = await withCity(game);

      game.ruleSets.set('civ1-enhanced:barbarian-uprisings', uprisingsAnywhere);

      for (let turn = 2; turn < 400; turn++) {
        startTurn(turn);
      }

      // Names and counts only: chai compares engine objects through the whole game.
      expect(said.map(([event]) => event)).to.eql([]);
      expect(game.rng.calls()).to.equal(0);
      expect(game.units.getByPlayer(barbarians)).to.have.length(0);

      game.rules
        .getById('civ1-barbarians:goody-hut/barbarians/horde')!
        .process(
          { tile: (): Tile => world.get(12, 5) },
          { player: (): Player => player }
        );

      expect(units(game, barbarians)).to.eql([Horseman, Horseman, Horseman]);
    }
  });

  describe('drawn at random', (): void => {
    it("should draw by the difficulty level, as Civilization II's does", (): void => {
      const draws = (difficulty: number): Level[] =>
        [0, 1, 2].map(
          (n: number): Level =>
            randomLevel(difficulty, (k: number): number => Math.min(n, k - 1))
        );

      expect(draws(0)).to.eql(['dormant', 'sporadic', 'sporadic']);
      expect(draws(1)).to.eql(['sporadic', 'active', 'active']);
      [2, 3, 4].forEach((difficulty: number): void => {
        expect(draws(difficulty), `${difficulty}`).to.eql([
          'sporadic',
          'active',
          'fierce',
        ]);
      });
    });

    it('should draw once, when first asked, and keep it with the game', (): void => {
      const game = atLevel('random', { rolls: [0.9, 0.1] });

      game.difficulty.set(Emperor);

      expect(game.pendingEffects.getByHandler(DRAWN_ACTIVITY)).to.eql([]);
      expect(game.rng.calls()).to.equal(0);

      // A roll of 0.9 in 3 is the third: Fierce.
      expect(activityOf(game.rules)).to.equal(activities.fierce);
      expect(activityOf(game.rules)).to.equal(activities.fierce);
      expect(game.rng.calls()).to.equal(1);

      const [record] = game.pendingEffects.getByHandler(DRAWN_ACTIVITY);

      expect(record.target()).to.be.null;
      expect(record.data()).to.eql({ level: 'fierce' });
    });

    it('should draw nothing while it is not chosen, or while the set is off', (): void => {
      [atLevel('active'), atLevel('random', { on: false })].forEach(
        (game: Game): void => {
          activityOf(game.rules);

          expect(game.rng.calls()).to.equal(0);
          expect(game.pendingEffects.entries()).to.eql([]);
        }
      );
    });

    it('should keep the level drawn through a save, and draw no other after the load', (): void => {
      const game = atLevel('random', { rolls: [0.1] });

      game.engine.registerPlugins({ '@civ-clone/civ1-enhanced': 'test' });
      registerClasses(game);
      // No level set, which plays at King: one of three.

      expect(activityOf(game.rules)).to.equal(activities.sporadic);

      const file = JSON.parse(
          JSON.stringify(save(game, { name: 'ab2', createdAt: 0 }))
        ),
        loaded = gameForLoad({
          classes: game.classes,
          engine: game.engine,
          rules: game.rules,
        });

      expect(file.ruleSets.choices).to.eql([
        { id: BARBARIAN_ACTIVITY, value: true },
        { id: BARBARIAN_ACTIVITY_LEVEL, value: memberId('random') },
      ]);

      hydrate(file, loaded);

      const [record] = loaded.pendingEffects.getByHandler(DRAWN_ACTIVITY);

      expect(record === game.pendingEffects.entries()[0]).false;
      expect(record.target()).to.be.null;
      expect(record.data()).to.eql({ level: 'sporadic' });

      // The loaded game's level is the record's, and nothing is drawn for it.
      expect(
        drawnLevel({
          difficulty: loaded.difficulty,
          pendingEffects: loaded.pendingEffects,
          rng: (() => {
            throw new Error('drew');
          }) as any,
        })
      ).to.equal('sporadic');
    });
  });

  it('should offer every level and the random one', (): void => {
    expect(CHOICES).to.eql([
      'dormant',
      'sporadic',
      'active',
      'fierce',
      'random',
    ]);
  });
});
