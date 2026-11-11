/** A Hydro Plant may be built with Mountains or a River on or next to the city's square. */
export declare const HYDRO_PLANT_SITE_RULE =
  'civ1-enhanced:city/build/hydro-plant-site';
/** A barbarian leader killed by a civilization pays it his ransom, however he dies. */
export declare const RANSOM_RULE = 'civ1-enhanced:unit/destroyed/ransom';
/** A discovery that makes what a city is building obsolete drops the build. */
export declare const REVALIDATE_BUILDS_RULE =
  'civ1-enhanced:player/research-complete/revalidate-builds';
/** A city the human captures stops building what it was, and the human chooses. */
export declare const CLEAR_CAPTURED_BUILD_RULE =
  'civ1-enhanced:city/captured/clear-build';
/** Every city may pollute a square around it each turn. */
export declare const POLLUTION_RULE =
  'civ1-enhanced:city/process-yield/pollution';
/** A barbarian city builds any attacking land unit two civilizations can build. */
export declare const RAIDERS_ONLY_RULE =
  'civ1-enhanced:city/build/raiders-only';
/** Each turn any civilization's city may see an uprising of barbarians nearby. */
export declare const LAND_UPRISING_RULE =
  'civ1-enhanced:turn/start/land-uprising';
/** Every other leader is pacified towards the owner of the United Nations, a computer player's too. */
export declare const UNITED_NATIONS_PACIFIED_RULE =
  'civ1-enhanced:player/pacified/united-nations';
/** A Diplomat takes any advance it can, each as likely as the next. */
export declare const STEAL_RULE = 'civ1-enhanced:unit/technology-stolen/steal';
/** Every city near a nuclear detonation loses half its size, but one with SDI Defense. */
export declare const HALVE_CITIES_RULE =
  'civ1-enhanced:unit/detonated/halve-cities';
/** A unit that changes sides keeps its veteran status, and otherwise arrives as a new unit would. */
export declare const KEEP_VETERAN_RULE =
  'civ1-enhanced:unit/transferred/keep-veteran';
/** A city of size 1 doesn't complete Settlers until it is size 2. */
export declare const SETTLERS_WAIT_RULE =
  'civ1-enhanced:city/hold/settlers-until-size-two';
