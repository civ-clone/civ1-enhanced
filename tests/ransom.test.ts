import { Diplomat, Horseman, Swordman } from '@civ-clone/civ1-unit/Units';
import loadGame, { buildWorld } from './lib/loadGame';
import Action from '@civ-clone/core-unit/Action';
import { BARBARIAN_LEADER_RANSOM } from '../RuleSets';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import { Game } from '@civ-clone/core-game/Game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

type Battle = {
  game: Game;
  player: Player;
  attacker: Unit;
  barbarian: (UnitType: typeof Unit) => Unit;
  ransoms: unknown[][];
  /** Ends a battle as `Attack` does: `Defeated` for the defender that lost, with the attack, whose unit attacked. */
  win: (defender: Unit) => void;
};

// A civilization's Horseman next to a square where barbarians stand, in a game with civ1-unit's combat rules,
//  civ1-barbarians' ransom and this package's.
const setUp = async (on?: boolean): Promise<Battle> => {
  const game = loadGame(),
    world: World = await buildWorld(game),
    player = new Player(game.rules),
    barbarians = new Player(game.rules),
    ransoms: unknown[][] = [];

  if (on !== undefined) {
    game.ruleSets.set(BARBARIAN_LEADER_RANSOM, on);
  }

  barbarians.setCivilization(new Barbarian());
  game.players.register(player, barbarians);
  game.playerTreasuries.register(
    new PlayerTreasury(player, Gold, game.cityBuilds, game.rules)
  );

  game.engine.on('barbarians:ransom', (...args: unknown[]): void => {
    ransoms.push(args);
  });

  const make = (owner: Player, UnitType: typeof Unit, x: number): Unit => {
      const unit = new (UnitType as unknown as new (
        ...args: unknown[]
      ) => Unit)(null, owner, world.get(x, 2), game.rules);

      game.units.register(unit);

      return unit;
    },
    attacker = make(player, Horseman, 1);

  return {
    game,
    player,
    attacker,
    barbarian: (UnitType: typeof Unit): Unit => make(barbarians, UnitType, 2),
    ransoms,
    win: (defender: Unit): void => {
      game.rules.process(Defeated, defender, attacker, {
        unit: (): Unit => attacker,
      } as unknown as Action);
    },
  };
};

const gold = ({ game, player }: Battle): number =>
  game.playerTreasuries.getByPlayerAndType(player, Gold).value();

describe("a barbarian leader's ransom (civ-clone/web-renderer#954)", (): void => {
  describe('paid for a leader however he dies, by default', (): void => {
    it('should be on', (): void => {
      expect(loadGame().ruleSets.state(BARBARIAN_LEADER_RANSOM)).to.equal('on');
    });

    it('should pay once for a leader killed in a stack another unit defended', async (): Promise<void> => {
      const battle = await setUp(),
        defender = battle.barbarian(Swordman),
        leader = battle.barbarian(Diplomat);

      battle.win(defender);

      expect(leader.destroyed()).true;
      expect(gold(battle)).to.equal(100);
      expect(battle.ransoms).to.eql([[battle.player, leader, 100]]);
    });

    it('should pay once for a lone leader, and once for one who defends his stack', async (): Promise<void> => {
      const battle = await setUp(),
        lone = battle.barbarian(Diplomat);

      battle.win(lone);

      const leader = battle.barbarian(Diplomat);

      battle.barbarian(Swordman);
      battle.win(leader);

      expect(gold(battle)).to.equal(200);
      expect(battle.ransoms).to.eql([
        [battle.player, lone, 100],
        [battle.player, leader, 100],
      ]);
    });
  });

  describe('paid only for a leader who defends, as v474.05, switched off', (): void => {
    it('should pay nothing for a leader killed in a stack another unit defended', async (): Promise<void> => {
      const battle = await setUp(false),
        defender = battle.barbarian(Swordman),
        leader = battle.barbarian(Diplomat);

      battle.win(defender);

      expect(leader.destroyed()).true;
      expect(gold(battle)).to.equal(0);
      expect(battle.ransoms).to.eql([]);
    });

    it('should pay once for a lone leader, and once for one who defends his stack', async (): Promise<void> => {
      const battle = await setUp(false),
        lone = battle.barbarian(Diplomat);

      battle.win(lone);

      const leader = battle.barbarian(Diplomat);

      battle.barbarian(Swordman);
      battle.win(leader);

      expect(gold(battle)).to.equal(200);
      expect(battle.ransoms).to.eql([
        [battle.player, lone, 100],
        [battle.player, leader, 100],
      ]);
    });
  });
});
