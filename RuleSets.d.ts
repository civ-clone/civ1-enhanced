/** Every rule set of this package. */
export declare const ENHANCED = 'civ1-enhanced';
/**
 * A Hydro Plant may be built with Mountains or a River on the city's own square too, as the manual's "on or near" has
 * it. Takes the place of `civ1-city-improvement`'s site rule while it is on. Off to start with.
 */
export declare const HYDRO_PLANT_SITE = 'civ1-enhanced:hydro-plant-site';
/**
 * A barbarian leader killed in a stack pays his ransom too, not only one who defends. Takes the place of
 * `civ1-barbarians`' ransom rule while it is on.
 */
export declare const BARBARIAN_LEADER_RANSOM =
  'civ1-enhanced:barbarian-leader-ransom';
/** A discovery that makes what a city is building obsolete drops the build, and its player chooses again. */
export declare const OBSOLETE_BUILDS = 'civ1-enhanced:obsolete-builds';
/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player's capture does
 * (civ-clone/web-renderer#670). Takes the place of `civ1-city`'s rule that keeps the build while it is on.
 */
export declare const CAPTURED_CITY_BUILD = 'civ1-enhanced:captured-city-build';
/**
 * Every city may pollute, not only the human's (civ-clone/web-renderer#32). Takes the place of
 * `civ1-city-improvement`'s pollution rule while it is on.
 */
export declare const POLLUTION_IN_EVERY_CITY =
  'civ1-enhanced:pollution-in-every-city';
/**
 * A barbarian city builds any attacking land unit two civilizations can build (civ-clone/web-renderer#27). Takes the
 * place of `civ1-barbarians`' build rule while it is on.
 */
export declare const BARBARIAN_CITY_BUILDS =
  'civ1-enhanced:barbarian-city-builds';
/**
 * An uprising may break out near any civilization's city, not only the human's (civ-clone/web-renderer#27). Takes the
 * place of `civ1-barbarians`' uprising rule while it is on.
 */
export declare const BARBARIAN_UPRISINGS = 'civ1-enhanced:barbarian-uprisings';
/**
 * The United Nations pacifies every other leader towards its owner, a computer player's too, so computer players don't
 * go to war with its owner either (civ-clone/web-renderer#30). Takes the place of `civ1-wonder`'s United Nations rule
 * while it is on.
 */
export declare const UNITED_NATIONS_STOPS_COMPUTER_WARS =
  'civ1-enhanced:united-nations-stops-computer-wars';
/**
 * A Diplomat takes any advance it can, each as likely as the next (civ-clone/web-renderer#58). Takes the place of
 * `civ1-unit`'s steal rule while it is on.
 */
export declare const EVEN_ADVANCE_STEALING =
  'civ1-enhanced:even-advance-stealing';
/**
 * A city with SDI Defense keeps its size under a nuclear attack, as well as its units (civ-clone/web-renderer#129).
 * Takes the place of `civ1-unit`'s rule that halves the cities while it is on. Off to start with.
 */
export declare const SDI_DEFENSE_SPARES_CITIES =
  'civ1-enhanced:sdi-defense-spares-cities';
/**
 * A unit that changes sides keeps its veteran status. Takes the place of `civ1-unit`'s rule that starts it afresh
 * while it is on. Off to start with.
 */
export declare const DEFECTORS_STAY_VETERAN =
  'civ1-enhanced:defectors-stay-veteran';
