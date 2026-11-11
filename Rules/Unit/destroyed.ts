import payRansom, { RansomGame } from '@civ-clone/civ1-barbarians/lib/ransom';
import Criterion from '@civ-clone/core-rule/Criterion';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
import { Diplomat } from '@civ-clone/civ1-unit/Units';
import Effect from '@civ-clone/core-rule/Effect';
import { RANSOM_RULE } from '../../RuleIds';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * Ransom (civ-clone/web-renderer#171): a barbarian leader (the group's Diplomat) killed by a civilization pays it 100
 * gold, however he dies, so a leader killed in a stack that another unit defended pays too. v474.05 pays only for a
 * leader who defends and loses (`civ1-barbarians`' `unit/defeated/ransom`, which this takes the place of while
 * `BARBARIAN_LEADER_RANSOM` is on: civ-clone/web-renderer#954). On `Destroyed` rather than `Defeated`, as the units
 * dying with a defender are only destroyed. Disbanding passes no player, so a leader who gives up pays nothing.
 */
export const getRules = (game: RansomGame): Destroyed[] => [
  new Destroyed(
    RANSOM_RULE,
    new Criterion(
      (unit: Unit): boolean =>
        unit instanceof Diplomat && isBarbarian(unit.player())
    ),
    new Criterion(
      (unit: Unit, player: Player | null): boolean =>
        player !== null && !isBarbarian(player)
    ),
    // Once: a leader aboard a ship goes down with it, and then comes up again in the defeated stack, as
    //  `civ1-unit`'s count-loss rule allows for.
    new Criterion((unit: Unit): boolean => !unit.destroyed()),
    new Effect((unit: Unit, player: Player | null): void =>
      payRansom(game, player as Player, unit)
    )
  ),
];

export default getRules;
