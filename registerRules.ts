import {
  BARBARIAN_CITY_BUILDS,
  BARBARIAN_LEADER_RANSOM,
  BARBARIAN_UPRISINGS,
  CAPTURED_CITY_BUILD,
  ENHANCED,
  HYDRO_PLANT_SITE,
  OBSOLETE_BUILDS,
  POLLUTION_IN_EVERY_CITY,
} from './RuleSets';
import {
  CLEAR_CAPTURED_BUILD_RULE,
  HYDRO_PLANT_SITE_RULE,
  LAND_UPRISING_RULE,
  POLLUTION_RULE,
  RAIDERS_ONLY_RULE,
  RANSOM_RULE,
  REVALIDATE_BUILDS_RULE,
} from './RuleIds';
import {
  HYDRO_PLANT_SITE_RULE as CIV1_HYDRO_PLANT_SITE_RULE,
  POLLUTION_RULE as CIV1_POLLUTION_RULE,
} from '@civ-clone/civ1-city-improvement/RuleIds';
import {
  LAND_UPRISING_RULE as CIV1_LAND_UPRISING_RULE,
  RAIDERS_ONLY_RULE as CIV1_RAIDERS_ONLY_RULE,
  RANSOM_RULE as CIV1_RANSOM_RULE,
} from '@civ-clone/civ1-barbarians/RuleIds';
import { Game, defaultGame } from '@civ-clone/core-game';
import { KEEP_BUILD_RULE as CIV1_KEEP_BUILD_RULE } from '@civ-clone/civ1-city/RuleIds';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import cityBuild from './Rules/City/build';
import cityCaptured from './Rules/City/captured';
import cityProcessYield from './Rules/City/processYield';
import { describedRequirements } from './Requirements';
import playerResearchComplete from './Rules/Player/researchComplete';
import turnStart from './Rules/Turn/start';
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
      new RuleSet(OBSOLETE_BUILDS, REVALIDATE_BUILDS_RULE),
      // Only the human's capture: v474.05 already has a computer player choose again, as `civ1-city`'s rule does.
      new RuleSet(
        CAPTURED_CITY_BUILD,
        { supersedes: [CIV1_KEEP_BUILD_RULE] },
        CLEAR_CAPTURED_BUILD_RULE
      ),
      new RuleSet(
        POLLUTION_IN_EVERY_CITY,
        { supersedes: [CIV1_POLLUTION_RULE] },
        POLLUTION_RULE
      ),
      new RuleSet(
        BARBARIAN_CITY_BUILDS,
        { supersedes: [CIV1_RAIDERS_ONLY_RULE] },
        RAIDERS_ONLY_RULE
      ),
      new RuleSet(
        BARBARIAN_UPRISINGS,
        { supersedes: [CIV1_LAND_UPRISING_RULE] },
        LAND_UPRISING_RULE
      )
    )
  );

  game.rules.register(
    ...cityBuild(game),
    ...cityCaptured(game),
    ...cityProcessYield(game),
    ...playerResearchComplete(game.cities, game.cityBuilds),
    ...turnStart(game),
    ...unitDestroyed(game)
  );

  // The entry for the Hydro Plant's site rule, which is written by hand: in force while the rule is on, as the
  //  civilopedia and the reasons a city can't build something follow the rule with the entry's id.
  game.requirements.add(null, ...describedRequirements);
};

// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
register(defaultGame);

export default register;
