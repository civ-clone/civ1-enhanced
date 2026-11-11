import stealAdvance, {
  stealableAdvances,
} from '@civ-clone/civ1-unit/lib/stealAdvance';
import City from '@civ-clone/core-city/City';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { STEAL_RULE } from '../../RuleIds';
import TechnologyStolen from '@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * A Diplomat takes any advance the victim knows and the thief doesn't, each as likely as the next
 * (civ-clone/web-renderer#58): one draw, and only when there is something to take. v474.05 walks its list of advances
 * from a random one and takes the first it can, so an advance after a run the thief knows is likelier (`civ1-unit`'s
 * `unit/technology-stolen/steal`, which this takes the place of while `EVEN_ADVANCE_STEALING` is on:
 * civ-clone/web-renderer#960). Through `civ1-unit`'s `lib/stealAdvance`, so the theft is otherwise the same.
 */
export const getRules = (
  game: Pick<
    Game,
    'engine' | 'interactions' | 'playerResearch' | 'rng' | 'rules' | 'turn'
  >
): TechnologyStolen[] => [
  new TechnologyStolen(
    STEAL_RULE,
    new Effect((unit: Unit, city: City): boolean => {
      const thief = unit.player(),
        victim = city.player(),
        stealable = stealableAdvances(thief, victim, game.playerResearch);

      if (stealable.length === 0) {
        return false;
      }

      stealAdvance(
        thief,
        victim,
        city,
        stealable[Math.floor(game.rng() * stealable.length)],
        {
          engine: game.engine,
          interactionRegistry: game.interactions,
          playerResearchRegistry: game.playerResearch,
          ruleRegistry: game.rules,
          turn: game.turn,
        }
      );

      return true;
    })
  ),
];

export default getRules;
