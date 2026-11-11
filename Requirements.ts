import {
  Condition,
  Requirement,
} from '@civ-clone/core-requirement/Requirement';
import { HYDRO_PLANT_SITE_RULE } from './RuleIds';
import { HydroPlant } from '@civ-clone/civ1-city-improvement/CityImprovements';

// What this package's rules need, as entries in the game's `requirements`, for the civilopedia and for saying why a
//  city can't build something (civ-clone/web-renderer#37). `registerRules` adds them. An entry shares its rule's id,
//  so it is in force exactly while that rule is switched on (civ-clone/web-renderer#954, #958).

/** Mountains or a River on or next to the city's square, which `Rules/City/build`'s own rule decides. */
export const mountainsOrRiverOnOrNearby = new Condition(
  'civ1-enhanced:mountains-or-river-on-or-nearby'
);

/**
 * A Hydro Plant is only built with Mountains or a River on or next to the city's square. The rule is written by hand;
 * this entry names it for the civilopedia. It takes the place of `civ1-city-improvement`'s `hydroPlantSite` entry
 * while `HYDRO_PLANT_SITE` is on, as the rules do: each entry is in force while its own rule is switched on.
 */
export const hydroPlantSite = new Requirement({
  id: HYDRO_PLANT_SITE_RULE,
  subject: HydroPlant,
  relation: 'requires',
  targets: [mountainsOrRiverOnOrNearby],
  range: 'city',
});

/** The entries that only describe: no rule is made from them. */
export const describedRequirements: Requirement[] = [hydroPlantSite];

export default describedRequirements;
