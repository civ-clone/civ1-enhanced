import { RansomGame } from '@civ-clone/civ1-barbarians/lib/ransom';
import Destroyed from '@civ-clone/core-unit/Rules/Destroyed';
/**
 * Ransom (civ-clone/web-renderer#171): a barbarian leader (the group's Diplomat) killed by a civilization pays it 100
 * gold, however he dies, so a leader killed in a stack that another unit defended pays too. v474.05 pays only for a
 * leader who defends and loses (`civ1-barbarians`' `unit/defeated/ransom`, which this takes the place of while
 * `BARBARIAN_LEADER_RANSOM` is on: civ-clone/web-renderer#954). On `Destroyed` rather than `Defeated`, as the units
 * dying with a defender are only destroyed. Disbanding passes no player, so a leader who gives up pays nothing.
 */
export declare const getRules: (game: RansomGame) => Destroyed[];
export default getRules;
