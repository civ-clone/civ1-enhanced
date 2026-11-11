"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const RuleSets_1 = require("./RuleSets");
const RuleIds_1 = require("./RuleIds");
const RuleIds_2 = require("@civ-clone/civ1-city-improvement/RuleIds");
const RuleIds_3 = require("@civ-clone/civ1-barbarians/RuleIds");
const core_game_1 = require("@civ-clone/core-game");
const RuleIds_4 = require("@civ-clone/civ1-city/RuleIds");
const RuleSet_1 = require("@civ-clone/core-rule/RuleSet");
const build_1 = require("./Rules/City/build");
const captured_1 = require("./Rules/City/captured");
const processYield_1 = require("./Rules/City/processYield");
const Requirements_1 = require("./Requirements");
const researchComplete_1 = require("./Rules/Player/researchComplete");
const start_1 = require("./Rules/Turn/start");
const destroyed_1 = require("./Rules/Unit/destroyed");
// civ-clone/web-renderer#960
const RuleSets_2 = require("./RuleSets");
const RuleIds_5 = require("./RuleIds");
const RuleIds_6 = require("@civ-clone/civ1-unit/RuleIds");
const RuleIds_7 = require("@civ-clone/civ1-wonder/RuleIds");
const pacified_1 = require("./Rules/Player/pacified");
const detonated_1 = require("./Rules/Unit/detonated");
const technologyStolen_1 = require("./Rules/Unit/technologyStolen");
const transferred_1 = require("./Rules/Unit/transferred");
const register = (game) => {
    // The ids superseded are imported from their packages, so renaming one breaks this build rather than leaving both
    //  rules running. The sets before their rules, so each rule is switched as it arrives: the Hydro Plant's starts off.
    //  A set of its own for each game, as a game may add to its sets.
    game.ruleSets.register(new RuleSet_1.default(RuleSets_1.ENHANCED, new RuleSet_1.default(RuleSets_1.HYDRO_PLANT_SITE, {
        enabled: false,
        supersedes: [RuleIds_2.HYDRO_PLANT_SITE_RULE],
    }, RuleIds_1.HYDRO_PLANT_SITE_RULE), new RuleSet_1.default(RuleSets_1.BARBARIAN_LEADER_RANSOM, { supersedes: [RuleIds_3.RANSOM_RULE] }, RuleIds_1.RANSOM_RULE), 
    // A rule added to Civ1's, so nothing to supersede: switched off, v474.05's play is what is left.
    new RuleSet_1.default(RuleSets_1.OBSOLETE_BUILDS, RuleIds_1.REVALIDATE_BUILDS_RULE), 
    // Only the human's capture: v474.05 already has a computer player choose again, as `civ1-city`'s rule does.
    new RuleSet_1.default(RuleSets_1.CAPTURED_CITY_BUILD, { supersedes: [RuleIds_4.KEEP_BUILD_RULE] }, RuleIds_1.CLEAR_CAPTURED_BUILD_RULE), new RuleSet_1.default(RuleSets_1.POLLUTION_IN_EVERY_CITY, { supersedes: [RuleIds_2.POLLUTION_RULE] }, RuleIds_1.POLLUTION_RULE), new RuleSet_1.default(RuleSets_1.BARBARIAN_CITY_BUILDS, { supersedes: [RuleIds_3.RAIDERS_ONLY_RULE] }, RuleIds_1.RAIDERS_ONLY_RULE), new RuleSet_1.default(RuleSets_1.BARBARIAN_UPRISINGS, { supersedes: [RuleIds_3.LAND_UPRISING_RULE] }, RuleIds_1.LAND_UPRISING_RULE), 
    // civ-clone/web-renderer#960: two as play was, and two new, off to start with.
    new RuleSet_1.default(RuleSets_2.UNITED_NATIONS_STOPS_COMPUTER_WARS, { supersedes: [RuleIds_7.UNITED_NATIONS_PACIFIED_RULE] }, RuleIds_5.UNITED_NATIONS_PACIFIED_RULE), new RuleSet_1.default(RuleSets_2.EVEN_ADVANCE_STEALING, { supersedes: [RuleIds_6.STEAL_RULE] }, RuleIds_5.STEAL_RULE), new RuleSet_1.default(RuleSets_2.SDI_DEFENSE_SPARES_CITIES, { enabled: false, supersedes: [RuleIds_6.HALVE_CITIES_RULE] }, RuleIds_5.HALVE_CITIES_RULE), new RuleSet_1.default(RuleSets_2.DEFECTORS_STAY_VETERAN, { enabled: false, supersedes: [RuleIds_6.START_AFRESH_RULE] }, RuleIds_5.KEEP_VETERAN_RULE)));
    game.rules.register(...(0, build_1.default)(game), ...(0, captured_1.default)(game), ...(0, processYield_1.default)(game), ...(0, researchComplete_1.default)(game.cities, game.cityBuilds), ...(0, start_1.default)(game), ...(0, destroyed_1.default)(game), 
    // civ-clone/web-renderer#960
    ...(0, pacified_1.default)(game), ...(0, technologyStolen_1.default)(game), ...(0, detonated_1.default)(game), ...(0, transferred_1.default)(game));
    // The entry for the Hydro Plant's site rule, which is written by hand: in force while the rule is on, as the
    //  civilopedia and the reasons a city can't build something follow the rule with the entry's id.
    game.requirements.add(null, ...Requirements_1.describedRequirements);
};
exports.register = register;
// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map