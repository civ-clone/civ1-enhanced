import activities, {
  CHOICES,
  Choice,
  Level,
  RANDOM,
  memberId,
} from '../../BarbarianActivities';
import drawnLevel, { DrawnActivityGame } from '../../lib/barbarianActivity';
import Activity from '@civ-clone/civ1-barbarians/Rules/Activity';
import { BARBARIAN_ACTIVITY_RULE } from '../../RuleIds';
import { BarbarianActivity } from '@civ-clone/civ1-barbarians/lib/activity';
import BarbarianActivityLevel from '../BarbarianActivityLevel';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';

export type BarbarianActivityGame = DrawnActivityGame & Pick<Game, 'rules'>;

/**
 * The barbarians' activity level (civ-clone/web-renderer#1008): one `BarbarianActivityLevel` rule for each member of
 *  `BARBARIAN_ACTIVITY_LEVEL`, and `BARBARIAN_ACTIVITY_RULE`, which answers `civ1-barbarians`' `Activity` with the
 *  numbers of the one chosen (`BarbarianActivities`), drawing a level for the random choice the first time it is asked.
 *  The answer is `BARBARIAN_ACTIVITY`'s own: switched off, nothing answers, and the barbarians are v474.05's whatever
 *  level is chosen.
 */
export const getRules = (
  game: BarbarianActivityGame
): (BarbarianActivityLevel | Activity)[] => [
  ...CHOICES.map(
    (choice: Choice): BarbarianActivityLevel =>
      new BarbarianActivityLevel(
        memberId(choice),
        new Effect((): Choice => choice)
      )
  ),
  new Activity(
    BARBARIAN_ACTIVITY_RULE,
    new Effect((): BarbarianActivity => {
      const [choice = 'active'] = game.rules.process(BarbarianActivityLevel),
        level: Level = choice === RANDOM ? drawnLevel(game) : choice;

      return activities[level];
    })
  ),
];

export default getRules;
