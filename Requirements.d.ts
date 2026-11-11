import {
  Condition,
  Requirement,
} from '@civ-clone/core-requirement/Requirement';
/** Mountains or a River on or next to the city's square, which `Rules/City/build`'s own rule decides. */
export declare const mountainsOrRiverOnOrNearby: Condition;
/**
 * A Hydro Plant is only built with Mountains or a River on or next to the city's square. The rule is written by hand;
 * this entry names it for the civilopedia. It takes the place of `civ1-city-improvement`'s `hydroPlantSite` entry
 * while `HYDRO_PLANT_SITE` is on, as the rules do: each entry is in force while its own rule is switched on.
 */
export declare const hydroPlantSite: Requirement;
/** The entries that only describe: no rule is made from them. */
export declare const describedRequirements: Requirement[];
export default describedRequirements;
