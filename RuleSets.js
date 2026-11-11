"use strict";
// The ids of the rule sets this package registers (civ-clone/web-renderer#954), for whatever switches them. Each is a
//  departure from v474.05, and all are beneath `ENHANCED`, so a game can switch them as one.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BARBARIAN_UPRISINGS = exports.BARBARIAN_CITY_BUILDS = exports.POLLUTION_IN_EVERY_CITY = exports.CAPTURED_CITY_BUILD = exports.OBSOLETE_BUILDS = exports.BARBARIAN_LEADER_RANSOM = exports.HYDRO_PLANT_SITE = exports.ENHANCED = void 0;
/** Every rule set of this package. */
exports.ENHANCED = 'civ1-enhanced';
/**
 * A Hydro Plant may be built with Mountains or a River on the city's own square too, as the manual's "on or near" has
 * it. Takes the place of `civ1-city-improvement`'s site rule while it is on. Off to start with.
 */
exports.HYDRO_PLANT_SITE = 'civ1-enhanced:hydro-plant-site';
/**
 * A barbarian leader killed in a stack pays his ransom too, not only one who defends. Takes the place of
 * `civ1-barbarians`' ransom rule while it is on.
 */
exports.BARBARIAN_LEADER_RANSOM = 'civ1-enhanced:barbarian-leader-ransom';
/** A discovery that makes what a city is building obsolete drops the build, and its player chooses again. */
exports.OBSOLETE_BUILDS = 'civ1-enhanced:obsolete-builds';
/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player's capture does
 * (civ-clone/web-renderer#670). Takes the place of `civ1-city`'s rule that keeps the build while it is on.
 */
exports.CAPTURED_CITY_BUILD = 'civ1-enhanced:captured-city-build';
/**
 * Every city may pollute, not only the human's (civ-clone/web-renderer#32). Takes the place of
 * `civ1-city-improvement`'s pollution rule while it is on.
 */
exports.POLLUTION_IN_EVERY_CITY = 'civ1-enhanced:pollution-in-every-city';
/**
 * A barbarian city builds any attacking land unit two civilizations can build (civ-clone/web-renderer#27). Takes the
 * place of `civ1-barbarians`' build rule while it is on.
 */
exports.BARBARIAN_CITY_BUILDS = 'civ1-enhanced:barbarian-city-builds';
/**
 * An uprising may break out near any civilization's city, not only the human's (civ-clone/web-renderer#27). Takes the
 * place of `civ1-barbarians`' uprising rule while it is on.
 */
exports.BARBARIAN_UPRISINGS = 'civ1-enhanced:barbarian-uprisings';
//# sourceMappingURL=RuleSets.js.map