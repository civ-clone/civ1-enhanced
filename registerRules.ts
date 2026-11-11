import {
  BARBARIAN_LEADER_RANSOM,
  ENHANCED,
  HYDRO_PLANT_SITE,
  OBSOLETE_BUILDS,
} from './RuleSets';
import {
  HYDRO_PLANT_SITE_RULE,
  RANSOM_RULE,
  REVALIDATE_BUILDS_RULE,
} from './RuleIds';
import { Game, defaultGame } from '@civ-clone/core-game';
import { HYDRO_PLANT_SITE_RULE as CIV1_HYDRO_PLANT_SITE_RULE } from '@civ-clone/civ1-city-improvement/RuleIds';
import { RANSOM_RULE as CIV1_RANSOM_RULE } from '@civ-clone/civ1-barbarians/RuleIds';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import cityBuild from './Rules/City/build';
import { describedRequirements } from './Requirements';
import playerResearchComplete from './Rules/Player/researchComplete';
import unitDestroyed from './Rules/Unit/destroyed';

export const register = (game: Game): void => {
  // The ids superseded are imported from their packages, so renaming one breaks this build rather than leaving both
  //  rules running. The sets before their rules, so each rule is switched as it arrives: the Hydro Plant's starts off.
  //  A set of its own for each game, as a game may add to its sets.
  game.ruleSets.register(
    new RuleSet(
      ENHANCED,
      new RuleSet(
        HYDRO_PLANT_SITE,
        {
          enabled: false,
          supersedes: [CIV1_HYDRO_PLANT_SITE_RULE],
        },
        HYDRO_PLANT_SITE_RULE
      ),
      new RuleSet(
        BARBARIAN_LEADER_RANSOM,
        { supersedes: [CIV1_RANSOM_RULE] },
        RANSOM_RULE
      ),
      // A rule added to Civ1's, so nothing to supersede: switched off, v474.05's play is what is left.
      new RuleSet(OBSOLETE_BUILDS, REVALIDATE_BUILDS_RULE)
    )
  );

  game.rules.register(
    ...cityBuild(),
    ...playerResearchComplete(game.cities, game.cityBuilds),
    ...unitDestroyed(game)
  );

  // The entry for the Hydro Plant's site rule, which is written by hand: in force while the rule is on, as the
  //  civilopedia and the reasons a city can't build something follow the rule with the entry's id.
  game.requirements.add(null, ...describedRequirements);
};

// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
register(defaultGame);

export default register;
