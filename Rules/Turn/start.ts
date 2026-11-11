import landUprising, {
  LandUprisingGame,
} from '@civ-clone/civ1-barbarians/lib/landUprising';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { LAND_UPRISING_RULE } from '../../RuleIds';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import spawning from '@civ-clone/civ1-barbarians/lib/spawning';

/**
 * Each turn one of 128 city slots is drawn, and any civilization's city there may rise, not only the human's
 * (civ-clone/web-renderer#27), through `civ1-barbarians`' `lib/landUprising`, so the units and `barbarians:uprising`
 * are the same. v474.05 lets only the human's rise (`civ1-barbarians`' `turn/start/land-uprising`, which this takes the
 * place of while `BARBARIAN_UPRISINGS` is on: civ-clone/web-renderer#954).
 */
export const getRules = (game: LandUprisingGame): Start[] => [
  new Start(
    LAND_UPRISING_RULE,
    new Criterion((turn: Turn): boolean => spawning(game.rules, turn)),
    new Effect((): void => landUprising(game, (): boolean => true))
  ),
];

export default getRules;
