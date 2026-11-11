// The ids of the rule sets this package registers (civ-clone/web-renderer#954), for whatever switches them. Each is a
//  departure from v474.05, and all are beneath `ENHANCED`, so a game can switch them as one.

/** Every rule set of this package. */
export const ENHANCED = 'civ1-enhanced';

/**
 * A Hydro Plant may be built with Mountains or a River on the city's own square too, as the manual's "on or near" has
 * it. Takes the place of `civ1-city-improvement`'s site rule while it is on. Off to start with.
 */
export const HYDRO_PLANT_SITE = 'civ1-enhanced:hydro-plant-site';

/**
 * A barbarian leader killed in a stack pays his ransom too, not only one who defends. Takes the place of
 * `civ1-barbarians`' ransom rule while it is on.
 */
export const BARBARIAN_LEADER_RANSOM = 'civ1-enhanced:barbarian-leader-ransom';

/**
 * A city stops building what it can no longer build, and its player chooses again, as it happens: when a discovery
 * makes the item obsolete, when the city loses an improvement the item needs, or when its player gains something that
 * excludes it (the Hoover Dam, plants). Switched off, the city finishes it, as v474.05's does (civ-clone/web-renderer#693,
 * #965).
 */
export const OBSOLETE_BUILDS = 'civ1-enhanced:obsolete-builds';

/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player's capture does
 * (civ-clone/web-renderer#670). Takes the place of `civ1-city`'s rule that keeps the build while it is on.
 */
export const CAPTURED_CITY_BUILD = 'civ1-enhanced:captured-city-build';

/**
 * Every city may pollute, not only the human's (civ-clone/web-renderer#32). Takes the place of
 * `civ1-city-improvement`'s pollution rule while it is on.
 */
export const POLLUTION_IN_EVERY_CITY = 'civ1-enhanced:pollution-in-every-city';

/**
 * A barbarian city builds any attacking land unit two civilizations can build (civ-clone/web-renderer#27). Takes the
 * place of `civ1-barbarians`' build rule while it is on.
 */
export const BARBARIAN_CITY_BUILDS = 'civ1-enhanced:barbarian-city-builds';

/**
 * An uprising may break out near any civilization's city, not only the human's (civ-clone/web-renderer#27). Takes the
 * place of `civ1-barbarians`' uprising rule while it is on.
 */
export const BARBARIAN_UPRISINGS = 'civ1-enhanced:barbarian-uprisings';

/**
 * The United Nations pacifies every other leader towards its owner, a computer player's too, so computer players don't
 * go to war with its owner either (civ-clone/web-renderer#30). Takes the place of `civ1-wonder`'s United Nations rule
 * while it is on.
 */
export const UNITED_NATIONS_STOPS_COMPUTER_WARS =
  'civ1-enhanced:united-nations-stops-computer-wars';

/**
 * A Diplomat takes any advance it can, each as likely as the next (civ-clone/web-renderer#58). Takes the place of
 * `civ1-unit`'s steal rule while it is on.
 */
export const EVEN_ADVANCE_STEALING = 'civ1-enhanced:even-advance-stealing';

/**
 * A city with SDI Defense keeps its size under a nuclear attack, as well as its units (civ-clone/web-renderer#129).
 * Takes the place of `civ1-unit`'s rule that halves the cities while it is on. Off to start with.
 */
export const SDI_DEFENSE_SPARES_CITIES =
  'civ1-enhanced:sdi-defense-spares-cities';

/**
 * A unit that changes sides keeps its veteran status. Takes the place of `civ1-unit`'s rule that starts it afresh
 * while it is on. Off to start with.
 */
export const DEFECTORS_STAY_VETERAN = 'civ1-enhanced:defectors-stay-veteran';

/**
 * A city of size 1 holds Settlers until it is size 2, at every level, rather than being removed for them
 * (civ-clone/web-renderer#959). Takes the place of `civ1-unit`'s Chieftain rule while it is on.
 */
export const SETTLERS_WAIT_FOR_SIZE_TWO =
  'civ1-enhanced:settlers-wait-for-size-two';
