"use strict";
// The ids of this package's rules that another package is expected to name (civ-clone/web-renderer#954): a set that
//  supersedes one, or a host that switches or describes it. Imported, a rename breaks the other package's build.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVERY_ADVANCE_COUNT_RULE = exports.CATCH_UP_FROM_RENAISSANCE_RULE = exports.RATE_MULTIPLIER_BY_AGE_RULE = exports.AGE_REACHED_RULE = exports.REACH_AGE_RULE = exports.AGES_SETTLED_RULE = exports.AGES_JOINED_RULE = exports.AGE_BY_TIER_RULE = exports.TIERED_COST_RULE = exports.SETTLERS_WAIT_RULE = exports.KEEP_VETERAN_RULE = exports.HALVE_CITIES_RULE = exports.STEAL_RULE = exports.UNITED_NATIONS_PACIFIED_RULE = exports.LAND_UPRISING_RULE = exports.RAIDERS_ONLY_RULE = exports.POLLUTION_RULE = exports.CLEAR_CAPTURED_BUILD_RULE = exports.OBSOLETE_BUILDS_RULES = exports.DROP_EXCLUDED_BUILDS_CAPTURED_RULE = exports.DROP_EXCLUDED_BUILDS_COMPLETE_RULE = exports.DROP_BUILDS_NEEDING_UNSUPPORTED_RULE = exports.NOTE_UNSUPPORTED_RULE = exports.DROP_BUILDS_NEEDING_SABOTAGED_RULE = exports.NOTE_SABOTAGED_RULE = exports.DROP_BUILDS_NEEDING_SOLD_RULE = exports.REVALIDATE_BUILDS_RULE = exports.RANSOM_RULE = exports.HYDRO_PLANT_SITE_RULE = void 0;
/** A Hydro Plant may be built with Mountains or a River on or next to the city's square. */
exports.HYDRO_PLANT_SITE_RULE = 'civ1-enhanced:city/build/hydro-plant-site';
/** A barbarian leader killed by a civilization pays it his ransom, however he dies. */
exports.RANSOM_RULE = 'civ1-enhanced:unit/destroyed/ransom';
/** A discovery that makes what a city is building obsolete drops the build. */
exports.REVALIDATE_BUILDS_RULE = 'civ1-enhanced:player/research-complete/revalidate-builds';
/** Selling an improvement drops a build in its city that needed it. */
exports.DROP_BUILDS_NEEDING_SOLD_RULE = 'civ1-enhanced:city-improvement/sold/drop-builds-that-needed-it';
/** Notes what a city has before it is sabotaged, for `DROP_BUILDS_NEEDING_SABOTAGED_RULE`. */
exports.NOTE_SABOTAGED_RULE = 'civ1-enhanced:unit/city-sabotaged/note-improvements';
/** An improvement sabotaged drops a build in its city that needed it. */
exports.DROP_BUILDS_NEEDING_SABOTAGED_RULE = 'civ1-enhanced:unit/city-sabotaged/drop-builds-that-needed-them';
/** Notes what a city has before its yields are processed, for `DROP_BUILDS_NEEDING_UNSUPPORTED_RULE`. */
exports.NOTE_UNSUPPORTED_RULE = 'civ1-enhanced:city/process-yield/note-improvements';
/** An improvement lost as its city's yields are processed (its upkeep unpaid) drops a build that needed it. */
exports.DROP_BUILDS_NEEDING_UNSUPPORTED_RULE = 'civ1-enhanced:city/process-yield/drop-builds-that-needed-them';
/** Completing something drops the player's builds it now excludes, as the Hoover Dam does plants. */
exports.DROP_EXCLUDED_BUILDS_COMPLETE_RULE = 'civ1-enhanced:city/building-complete/drop-excluded-builds';
/** Capturing a city drops the captor's builds that what it holds now excludes, as the Hoover Dam does plants. */
exports.DROP_EXCLUDED_BUILDS_CAPTURED_RULE = 'civ1-enhanced:city/captured/drop-excluded-builds';
/** Every rule of `OBSOLETE_BUILDS`, in the order they are registered. */
exports.OBSOLETE_BUILDS_RULES = [
    exports.REVALIDATE_BUILDS_RULE,
    exports.DROP_BUILDS_NEEDING_SOLD_RULE,
    exports.NOTE_SABOTAGED_RULE,
    exports.DROP_BUILDS_NEEDING_SABOTAGED_RULE,
    exports.NOTE_UNSUPPORTED_RULE,
    exports.DROP_BUILDS_NEEDING_UNSUPPORTED_RULE,
    exports.DROP_EXCLUDED_BUILDS_COMPLETE_RULE,
    exports.DROP_EXCLUDED_BUILDS_CAPTURED_RULE,
];
/** A city the human captures stops building what it was, and the human chooses. */
exports.CLEAR_CAPTURED_BUILD_RULE = 'civ1-enhanced:city/captured/clear-build';
/** Every city may pollute a square around it each turn. */
exports.POLLUTION_RULE = 'civ1-enhanced:city/process-yield/pollution';
/** A barbarian city builds any attacking land unit two civilizations can build. */
exports.RAIDERS_ONLY_RULE = 'civ1-enhanced:city/build/raiders-only';
/** Each turn any civilization's city may see an uprising of barbarians nearby. */
exports.LAND_UPRISING_RULE = 'civ1-enhanced:turn/start/land-uprising';
/** Every other leader is pacified towards the owner of the United Nations, a computer player's too. */
exports.UNITED_NATIONS_PACIFIED_RULE = 'civ1-enhanced:player/pacified/united-nations';
/** A Diplomat takes any advance it can, each as likely as the next. */
exports.STEAL_RULE = 'civ1-enhanced:unit/technology-stolen/steal';
/** Every city near a nuclear detonation loses half its size, but one with SDI Defense. */
exports.HALVE_CITIES_RULE = 'civ1-enhanced:unit/detonated/halve-cities';
/** A unit that changes sides keeps its veteran status, and otherwise arrives as a new unit would. */
exports.KEEP_VETERAN_RULE = 'civ1-enhanced:unit/transferred/keep-veteran';
/** A city of size 1 doesn't complete Settlers until it is size 2. */
exports.SETTLERS_WAIT_RULE = 'civ1-enhanced:city/hold/settlers-until-size-two';
/** An advance costs its tier's weight times the rate, whatever its player knows. */
exports.TIERED_COST_RULE = 'civ1-enhanced:research/cost/by-tier';
/** A civilization's age is that of the latest research tier it knows an advance of (civ-clone/web-renderer#1076). */
exports.AGE_BY_TIER_RULE = 'civ1-enhanced:research/age/by-tier';
/** A civilization added tells of no age for what it is given, until the next turn starts. */
exports.AGES_JOINED_RULE = 'civ1-enhanced:player/added/hold-ages';
/** As a turn starts, the civilizations added before it tell of their ages. */
exports.AGES_SETTLED_RULE = 'civ1-enhanced:turn/start/settle-ages';
/** An advance gained that starts a new age for its player reaches it. */
exports.REACH_AGE_RULE = 'civ1-enhanced:research/complete/reach-age';
/** A player reaching an age is told to the engine's listeners (`player:age-reached`). */
exports.AGE_REACHED_RULE = 'civ1-enhanced:player/age-reached/emit';
/** The rate of research cost is multiplied by the player's age's (civ-clone/web-renderer#1077). */
exports.RATE_MULTIPLIER_BY_AGE_RULE = 'civ1-enhanced:research/rate-multiplier/by-age';
/** The rate rises when the leader is ahead of schedule, for a player in the Renaissance or later. */
exports.CATCH_UP_FROM_RENAISSANCE_RULE = 'civ1-enhanced:research/catch-up/from-renaissance';
/** A player is counted as knowing every advance it knows, those it started with too (civ-clone/web-renderer#973). */
exports.EVERY_ADVANCE_COUNT_RULE = 'civ1-enhanced:research/advance-count/every-advance-known';
//# sourceMappingURL=RuleIds.js.map