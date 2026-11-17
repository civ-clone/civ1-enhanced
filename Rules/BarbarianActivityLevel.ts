import { Choice } from '../BarbarianActivities';
import Rule from '@civ-clone/core-rule/Rule';

/**
 * One member of `BARBARIAN_ACTIVITY_LEVEL` (civ-clone/web-renderer#1008): a level, or the one drawn. One is registered
 *  for each, and the choice leaves only the one chosen switched on, which `BARBARIAN_ACTIVITY_RULE` reads.
 */
export class BarbarianActivityLevel extends Rule<[], Choice> {}

export default BarbarianActivityLevel;
