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

/** A city the human captures stops building what it was, and the human chooses. */
export const CLEAR_CAPTURED_BUILD_RULE =
  'civ1-enhanced:city/captured/clear-build';

/** Every city may pollute a square around it each turn. */
export const POLLUTION_RULE = 'civ1-enhanced:city/process-yield/pollution';

/** A barbarian city builds any attacking land unit two civilizations can build. */
export const RAIDERS_ONLY_RULE = 'civ1-enhanced:city/build/raiders-only';

/** Each turn any civilization's city may see an uprising of barbarians nearby. */
export const LAND_UPRISING_RULE = 'civ1-enhanced:turn/start/land-uprising';
