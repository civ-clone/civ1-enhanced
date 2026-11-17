import { DrawnActivityGame } from '../../lib/barbarianActivity';
import Activity from '@civ-clone/civ1-barbarians/Rules/Activity';
import BarbarianActivityLevel from '../BarbarianActivityLevel';
import { Game } from '@civ-clone/core-game/Game';
export type BarbarianActivityGame = DrawnActivityGame & Pick<Game, 'rules'>;
/**
 * The barbarians' activity level (civ-clone/web-renderer#1008): one `BarbarianActivityLevel` rule for each member of
 *  `BARBARIAN_ACTIVITY_LEVEL`, and `BARBARIAN_ACTIVITY_RULE`, which answers `civ1-barbarians`' `Activity` with the
 *  numbers of the one chosen (`BarbarianActivities`), drawing a level for the random choice the first time it is asked.
 *  The answer is `BARBARIAN_ACTIVITY`'s own: switched off, nothing answers, and the barbarians are v474.05's whatever
 *  level is chosen.
 */
export declare const getRules: (
  game: BarbarianActivityGame
) => (BarbarianActivityLevel | Activity)[];
export default getRules;
