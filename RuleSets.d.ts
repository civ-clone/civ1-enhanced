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
