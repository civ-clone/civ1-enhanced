import {
  BARBARIAN_LEADER_RANSOM,
  ENHANCED,
  HYDRO_PLANT_SITE,
  OBSOLETE_BUILDS,
} from './RuleSets';
import { Game, defaultGame } from '@civ-clone/core-game';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import cityBuild from './Rules/City/build';
import playerResearchComplete from './Rules/Player/researchComplete';
import unitDestroyed from './Rules/Unit/destroyed';

export const register = (game: Game): void => {
  // The sets before their rules, so each rule is switched as it arrives: the Hydro Plant's starts off. A set of its own
  //  for each game, as a game may add to its sets.
  game.ruleSets.register(
    new RuleSet(
      ENHANCED,
      new RuleSet(
        HYDRO_PLANT_SITE,
        {
          enabled: false,
          supersedes: ['civ1-city-improvement:city/build/hydro-plant-site'],
        },
        'civ1-enhanced:city/build/hydro-plant-site'
      ),
      new RuleSet(
        BARBARIAN_LEADER_RANSOM,
        { supersedes: ['civ1-barbarians:unit/defeated/ransom'] },
        'civ1-enhanced:unit/destroyed/ransom'
      ),
      // A rule added to Civ1's, so nothing to supersede: switched off, v474.05's play is what is left.
      new RuleSet(
        OBSOLETE_BUILDS,
        'civ1-enhanced:player/research-complete/revalidate-builds'
      )
    )
  );

  game.rules.register(
    ...cityBuild(),
    ...playerResearchComplete(game.cities, game.cityBuilds),
    ...unitDestroyed(game)
  );
};

// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
register(defaultGame);

export default register;
