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
  AGES_JOINED_RULE,
  AGES_SETTLED_RULE,
  REACH_AGE_RULE,
} from '../../RuleIds';
import Added from '@civ-clone/core-player/Rules/Added';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import joining from '@civ-clone/base-science-age/lib/joining';

/** The parts of a game the ages are read from and told to. */
export type AgesGame = Pick<
  Game,
  'advances' | 'engine' | 'requirements' | 'rules' | 'turn'
>;

export const getRules = (
  game: AgesGame
): (AgeOf | Added | Start | Complete | AgeReached)[] => {
  const held = joining();

  return [
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
    // A civilization added, as the game is set up or when one comes back part-way through a turn with the advances it
    //  inherits, tells of no age for what it is given until the next turn starts (`lib/joining`).
    new Added(AGES_JOINED_RULE, new Effect(held.joined)),
    new Start(AGES_SETTLED_RULE, new Effect(held.settled)),
    // After `civ1-science`'s rule tells of the advance itself.
    new Complete(
      REACH_AGE_RULE,
      new Low(),
      new Effect(
        reachAge(
          game.rules,
          (playerResearch) =>
            game.turn.value() > 0 && held.ready(playerResearch)
        )
      )
    ),
    new AgeReached(AGE_REACHED_RULE, new Effect(emitAgeReached(game.engine))),
  ];
};

export default getRules;
