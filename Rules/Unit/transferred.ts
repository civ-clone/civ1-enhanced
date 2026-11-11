import startAfresh, {
  START_AFRESH_PRIORITY,
} from '@civ-clone/civ1-unit/lib/startAfresh';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { KEEP_VETERAN_RULE } from '../../RuleIds';
import Priority from '@civ-clone/core-rule/Priority';
import Transferred from '@civ-clone/core-unit/Rules/Transferred';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * A unit that changes sides, bribed or with a city, keeps its veteran status. Otherwise it arrives as a new unit
 * would, as in v474.05: not fortified, with no moves until its new owner's turn and, an aircraft, with its fuel full.
 * v474.05 makes a new unit, so it is no veteran either (`civ1-unit`'s `unit/transferred/start-afresh`, which this takes
 * the place of while `DEFECTORS_STAY_VETERAN` is on: civ-clone/web-renderer#960). Through `civ1-unit`'s
 * `lib/startAfresh`, at its `START_AFRESH_PRIORITY`, before the client is told, whichever package loads first.
 */
export const getRules = (
  game: Pick<Game, 'strategyNotes' | 'unitImprovements'>
): Transferred[] => [
  new Transferred(
    KEEP_VETERAN_RULE,
    new Priority(START_AFRESH_PRIORITY),
    new Effect((unit: Unit): void =>
      startAfresh(unit, true, game.unitImprovements, game.strategyNotes)
    )
  ),
];

export default getRules;
