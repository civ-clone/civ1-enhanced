"use strict";
// The ids of this package's rules that another package is expected to name (civ-clone/web-renderer#954): a set that
//  supersedes one, or a host that switches or describes it. Imported, a rename breaks the other package's build.
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEEP_VETERAN_RULE = exports.HALVE_CITIES_RULE = exports.STEAL_RULE = exports.UNITED_NATIONS_PACIFIED_RULE = exports.LAND_UPRISING_RULE = exports.RAIDERS_ONLY_RULE = exports.POLLUTION_RULE = exports.CLEAR_CAPTURED_BUILD_RULE = exports.REVALIDATE_BUILDS_RULE = exports.RANSOM_RULE = exports.HYDRO_PLANT_SITE_RULE = void 0;
/** A Hydro Plant may be built with Mountains or a River on or next to the city's square. */
exports.HYDRO_PLANT_SITE_RULE = 'civ1-enhanced:city/build/hydro-plant-site';
/** A barbarian leader killed by a civilization pays it his ransom, however he dies. */
exports.RANSOM_RULE = 'civ1-enhanced:unit/destroyed/ransom';
/** A discovery that makes what a city is building obsolete drops the build. */
exports.REVALIDATE_BUILDS_RULE = 'civ1-enhanced:player/research-complete/revalidate-builds';
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
//# sourceMappingURL=RuleIds.js.map