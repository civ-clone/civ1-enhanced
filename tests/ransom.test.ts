import {
  Diplomat,
  Horseman,
  Swordman,
  Trireme,
} from '@civ-clone/civ1-unit/Units';
import loadGame, { buildWorld } from './lib/loadGame';
import Action from '@civ-clone/core-unit/Action';
import { BARBARIAN_LEADER_RANSOM } from '../RuleSets';
import Barbarian from '@civ-clone/base-civilization-barbarian/Barbarian';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import { Game } from '@civ-clone/core-game/Game';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import { Ocean } from '@civ-clone/civ1-world/Terrains';
import Player from '@civ-clone/core-player/Player';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

type Battle = {
  game: Game;
  player: Player;
  barbarians: Player;
  /** A barbarian unit on the square under attack, at (2, 2). */
  barbarian: (UnitType: typeof Unit) => Unit;
  /** A unit of `owner`'s next to it, at (1, 2). */
  unit: (owner: Player, UnitType: typeof Unit) => Unit;
  ransoms: unknown[][];
  /** Ends a battle as `Attack` does: `Defeated` for the defender that lost, with the attack, whose unit attacked. */
  win: (attacker: Unit, defender: Unit) => void;
  world: World;
};

// A civilization and the barbarians, each with a treasury, in a game with civ1-unit's combat rules, civ1-barbarians'
//  ransom and this package's.
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
  [player, barbarians].forEach((owner: Player): void =>
    game.playerTreasuries.register(
      new PlayerTreasury(owner, Gold, game.cityBuilds, game.rules)
    )
  );

  game.engine.on('barbarians:ransom', (...args: unknown[]): void => {
    ransoms.push(args);
  });

  const make = (owner: Player, UnitType: typeof Unit, x: number): Unit => {
    const unit = new (UnitType as unknown as new (...args: unknown[]) => Unit)(
      null,
      owner,
      world.get(x, 2),
      game.rules,
      game.transports
    );

    game.units.register(unit);

    return unit;
  };

  return {
    game,
    player,
    barbarians,
    barbarian: (UnitType: typeof Unit): Unit => make(barbarians, UnitType, 2),
    unit: (owner: Player, UnitType: typeof Unit): Unit =>
      make(owner, UnitType, 1),
    ransoms,
    win: (attacker: Unit, defender: Unit): void => {
      game.rules.process(Defeated, defender, attacker, {
        unit: (): Unit => attacker,
      } as unknown as Action);
    },
    world,
  };
};

const gold = ({ game }: Battle, player: Player): number =>
  game.playerTreasuries.getByPlayerAndType(player, Gold).value();

// What happens whichever ransom rule is in force.
const eitherWay = (on: boolean): void => {
  it('should pay once for a lone leader beaten by a civilization', async (): Promise<void> => {
    const battle = await setUp(on),
      leader = battle.barbarian(Diplomat);

    battle.win(battle.unit(battle.player, Horseman), leader);

    expect(gold(battle, battle.player)).to.equal(100);
    expect(battle.ransoms).to.eql([[battle.player, leader, 100]]);
  });

  it('should pay nothing for a leader who disbands, nor for a barbarian who is not a leader', async (): Promise<void> => {
    const battle = await setUp(on),
      horseman = battle.barbarian(Horseman);

    battle.game.rules.process(Destroyed, battle.barbarian(Diplomat), null);
    battle.win(battle.unit(battle.player, Horseman), horseman);

    expect(gold(battle, battle.player)).to.equal(0);
    expect(battle.ransoms).to.eql([]);
  });

  it('should pay nothing to a barbarian who beats a barbarian leader', async (): Promise<void> => {
    const battle = await setUp(on),
      leader = battle.barbarian(Diplomat);

    battle.win(battle.unit(battle.barbarians, Horseman), leader);

    expect(leader.destroyed()).true;
    expect(gold(battle, battle.barbarians)).to.equal(0);
    expect(battle.ransoms).to.eql([]);
  });
};

describe("a barbarian leader's ransom (civ-clone/web-renderer#954)", (): void => {
  describe('paid for a leader however he dies, by default', (): void => {
    it('should be on', (): void => {
      expect(loadGame().ruleSets.state(BARBARIAN_LEADER_RANSOM)).to.equal('on');
    });

    eitherWay(true);

    it('should pay once for a leader killed in a stack another unit defended', async (): Promise<void> => {
      const battle = await setUp(),
        defender = battle.barbarian(Swordman),
        leader = battle.barbarian(Diplomat);

      battle.win(battle.unit(battle.player, Horseman), defender);

      expect(leader.destroyed()).true;
      expect(gold(battle, battle.player)).to.equal(100);
      expect(battle.ransoms).to.eql([[battle.player, leader, 100]]);
    });

    it('should pay for each of two leaders together, the one who defends and the one killed with him', async (): Promise<void> => {
      const battle = await setUp(),
        defender = battle.barbarian(Diplomat),
        other = battle.barbarian(Diplomat);

      battle.win(battle.unit(battle.player, Horseman), defender);

      expect(other.destroyed()).true;
      expect(gold(battle, battle.player)).to.equal(200);
      expect(battle.ransoms).to.eql([
        [battle.player, defender, 100],
        [battle.player, other, 100],
      ]);
    });

    it('should pay once for a leader destroyed twice: as cargo of a sunk Trireme, and again in its stack', async (): Promise<void> => {
      const battle = await setUp();

      battle.world.get(2, 2).setTerrain(new Ocean());

      const defender = battle.barbarian(Trireme),
        // Before the leader on the square, so the stack rule sinks it, and the leader with it, before reaching him.
        transport = battle.barbarian(Trireme),
        leader = battle.barbarian(Diplomat);

      expect(
        (transport as unknown as { stow(unit: Unit): boolean }).stow(leader)
      ).true;

      battle.win(battle.unit(battle.player, Trireme), defender);

      expect(transport.destroyed()).true;
      expect(leader.destroyed()).true;
      expect(gold(battle, battle.player)).to.equal(100);
      expect(battle.ransoms).to.eql([[battle.player, leader, 100]]);
    });
  });

  describe('paid only for a leader who defends, as v474.05, switched off', (): void => {
    eitherWay(false);

    it('should pay nothing for a leader killed in a stack another unit defended', async (): Promise<void> => {
      const battle = await setUp(false),
        defender = battle.barbarian(Swordman),
        leader = battle.barbarian(Diplomat);

      battle.win(battle.unit(battle.player, Horseman), defender);

      expect(leader.destroyed()).true;
      expect(gold(battle, battle.player)).to.equal(0);
      expect(battle.ransoms).to.eql([]);
    });

    it('should pay once for two leaders together: for the one who defends, and not the one killed with him', async (): Promise<void> => {
      const battle = await setUp(false),
        defender = battle.barbarian(Diplomat),
        other = battle.barbarian(Diplomat);

      battle.win(battle.unit(battle.player, Horseman), defender);

      expect(other.destroyed()).true;
      expect(gold(battle, battle.player)).to.equal(100);
      expect(battle.ransoms).to.eql([[battle.player, defender, 100]]);
    });
  });
});
