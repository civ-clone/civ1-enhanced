"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const RuleSets_1 = require("./RuleSets");
const RuleIds_1 = require("./RuleIds");
const core_game_1 = require("@civ-clone/core-game");
const RuleIds_2 = require("@civ-clone/civ1-city-improvement/RuleIds");
const RuleIds_3 = require("@civ-clone/civ1-barbarians/RuleIds");
const RuleSet_1 = require("@civ-clone/core-rule/RuleSet");
const build_1 = require("./Rules/City/build");
const researchComplete_1 = require("./Rules/Player/researchComplete");
const destroyed_1 = require("./Rules/Unit/destroyed");
const register = (game) => {
    // The ids superseded are imported from their packages, so renaming one breaks this build rather than leaving both
    //  rules running. The sets before their rules, so each rule is switched as it arrives: the Hydro Plant's starts off. A set of its own
    //  for each game, as a game may add to its sets.
    game.ruleSets.register(new RuleSet_1.default(RuleSets_1.ENHANCED, new RuleSet_1.default(RuleSets_1.HYDRO_PLANT_SITE, {
        enabled: false,
        supersedes: [RuleIds_2.HYDRO_PLANT_SITE_RULE],
    }, RuleIds_1.HYDRO_PLANT_SITE_RULE), new RuleSet_1.default(RuleSets_1.BARBARIAN_LEADER_RANSOM, { supersedes: [RuleIds_3.RANSOM_RULE] }, RuleIds_1.RANSOM_RULE), 
    // A rule added to Civ1's, so nothing to supersede: switched off, v474.05's play is what is left.
    new RuleSet_1.default(RuleSets_1.OBSOLETE_BUILDS, RuleIds_1.REVALIDATE_BUILDS_RULE)));
    game.rules.register(...(0, build_1.default)(), ...(0, researchComplete_1.default)(game.cities, game.cityBuilds), ...(0, destroyed_1.default)(game));
};
exports.register = register;
// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map