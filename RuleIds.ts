// The ids of this package's rules that another package is expected to name (civ-clone/web-renderer#954): a set that
//  supersedes one, or a host that switches or describes it. Imported, a rename breaks the other package's build.

/** A Hydro Plant may be built with Mountains or a River on or next to the city's square. */
export const HYDRO_PLANT_SITE_RULE =
  'civ1-enhanced:city/build/hydro-plant-site';

/** A barbarian leader killed by a civilization pays it his ransom, however he dies. */
export const RANSOM_RULE = 'civ1-enhanced:unit/destroyed/ransom';

/** A discovery that makes what a city is building obsolete drops the build. */
export const REVALIDATE_BUILDS_RULE =
  'civ1-enhanced:player/research-complete/revalidate-builds';

/** Selling an improvement drops a build in its city that needed it. */
export const DROP_BUILDS_NEEDING_SOLD_RULE =
  'civ1-enhanced:city-improvement/sold/drop-builds-that-needed-it';

/** Notes what a city has before it is sabotaged, for `DROP_BUILDS_NEEDING_SABOTAGED_RULE`. */
export const NOTE_SABOTAGED_RULE =
  'civ1-enhanced:unit/city-sabotaged/note-improvements';

/** An improvement sabotaged drops a build in its city that needed it. */
export const DROP_BUILDS_NEEDING_SABOTAGED_RULE =
  'civ1-enhanced:unit/city-sabotaged/drop-builds-that-needed-them';

/** Notes what a city has before its yields are processed, for `DROP_BUILDS_NEEDING_UNSUPPORTED_RULE`. */
export const NOTE_UNSUPPORTED_RULE =
  'civ1-enhanced:city/process-yield/note-improvements';

/** An improvement lost as its city's yields are processed (its upkeep unpaid) drops a build that needed it. */
export const DROP_BUILDS_NEEDING_UNSUPPORTED_RULE =
  'civ1-enhanced:city/process-yield/drop-builds-that-needed-them';

/** Completing something drops the player's builds it now excludes, as the Hoover Dam does plants. */
export const DROP_EXCLUDED_BUILDS_COMPLETE_RULE =
  'civ1-enhanced:city/building-complete/drop-excluded-builds';

/** Capturing a city drops the captor's builds that what it holds now excludes, as the Hoover Dam does plants. */
export const DROP_EXCLUDED_BUILDS_CAPTURED_RULE =
  'civ1-enhanced:city/captured/drop-excluded-builds';

/** Every rule of `OBSOLETE_BUILDS`, in the order they are registered. */
export const OBSOLETE_BUILDS_RULES = [
  REVALIDATE_BUILDS_RULE,
  DROP_BUILDS_NEEDING_SOLD_RULE,
  NOTE_SABOTAGED_RULE,
  DROP_BUILDS_NEEDING_SABOTAGED_RULE,
  NOTE_UNSUPPORTED_RULE,
  DROP_BUILDS_NEEDING_UNSUPPORTED_RULE,
  DROP_EXCLUDED_BUILDS_COMPLETE_RULE,
  DROP_EXCLUDED_BUILDS_CAPTURED_RULE,
];

/** A city the human captures stops building what it was, and the human chooses. */
export const CLEAR_CAPTURED_BUILD_RULE =
  'civ1-enhanced:city/captured/clear-build';

/** Every city may pollute a square around it each turn. */
export const POLLUTION_RULE = 'civ1-enhanced:city/process-yield/pollution';

/** A barbarian city builds any attacking land unit two civilizations can build. */
export const RAIDERS_ONLY_RULE = 'civ1-enhanced:city/build/raiders-only';

/** Each turn any civilization's city may see an uprising of barbarians nearby. */
export const LAND_UPRISING_RULE = 'civ1-enhanced:turn/start/land-uprising';

/** Every other leader is pacified towards the owner of the United Nations, a computer player's too. */
export const UNITED_NATIONS_PACIFIED_RULE =
  'civ1-enhanced:player/pacified/united-nations';

/** A Diplomat takes any advance it can, each as likely as the next. */
export const STEAL_RULE = 'civ1-enhanced:unit/technology-stolen/steal';

/** Every city near a nuclear detonation loses half its size, but one with SDI Defense. */
export const HALVE_CITIES_RULE = 'civ1-enhanced:unit/detonated/halve-cities';

/** A unit that changes sides keeps its veteran status, and otherwise arrives as a new unit would. */
export const KEEP_VETERAN_RULE = 'civ1-enhanced:unit/transferred/keep-veteran';

/** A city of size 1 doesn't complete Settlers until it is size 2. */
export const SETTLERS_WAIT_RULE =
  'civ1-enhanced:city/hold/settlers-until-size-two';
