import Advance from '@civ-clone/core-science/Advance';
import AgeOf from '@civ-clone/base-science-age/Rules/AgeOf';
import AgeReached from '@civ-clone/base-science-age/Rules/AgeReached';
import Complete from '@civ-clone/core-science/Rules/Complete';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game/Game';
import Low from '@civ-clone/core-rule/Priorities/Low';
import { advanceTiers } from '../../lib/advanceTiers';
import { emitAgeReached } from '@civ-clone/base-science-age/lib/events';
import { latestAge } from '@civ-clone/base-science-age/lib/latestAge';
import { reachAge } from '@civ-clone/base-science-age/lib/reached';
import researchAges from '../../Ages';
import {
  AGE_BY_TIER_RULE,
  AGE_REACHED_RULE,
  REACH_AGE_RULE,
} from '../../RuleIds';

/** The parts of a game the ages are read from and told to. */
export type AgesGame = Pick<
  Game,
  'advances' | 'engine' | 'requirements' | 'rules' | 'turn'
>;

export const getRules = (game: AgesGame): (AgeOf | Complete | AgeReached)[] => [
  // A civilization is in the age of the latest tier it knows an advance of, and in the first knowing none.
  new AgeOf(
    AGE_BY_TIER_RULE,
    new Effect(
      latestAge(researchAges, (AdvanceType: typeof Advance) => {
        const tier = advanceTiers(game).get(AdvanceType);

        return tier === undefined ? undefined : researchAges[tier];
      })
    )
  ),
  // After `civ1-science`'s rule tells of the advance itself, and not while the game is set up: the advances a
  //  civilization starts with are given before the first turn, at turn 0.
  new Complete(
    REACH_AGE_RULE,
    new Low(),
    new Effect(reachAge(game.rules, () => game.turn.value() > 0))
  ),
  new AgeReached(AGE_REACHED_RULE, new Effect(emitAgeReached(game.engine))),
];

export default getRules;
