import { Game } from '@civ-clone/core-game';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
/**
 * A unit that changes sides, bribed or with a city, keeps its veteran status. Otherwise it arrives as a new unit
 * would, as in v474.05: not fortified, with no moves until its new owner's turn and, an aircraft, with its fuel full.
 * v474.05 makes a new unit, so it is no veteran either (`civ1-unit`'s `unit/transferred/start-afresh`, which this takes
 * the place of while `DEFECTORS_STAY_VETERAN` is on: civ-clone/web-renderer#960). Through `civ1-unit`'s
 * `lib/startAfresh`, at its `START_AFRESH_PRIORITY`, before the client is told, whichever package loads first.
 */
export declare const getRules: (
  game: Pick<Game, 'strategyNotes' | 'unitImprovements'>
) => Transferred[];
export default getRules;
