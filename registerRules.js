"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = void 0;
const RuleSets_1 = require("./RuleSets");
const core_game_1 = require("@civ-clone/core-game");
const RuleSet_1 = require("@civ-clone/core-rule/RuleSet");
const build_1 = require("./Rules/City/build");
const researchComplete_1 = require("./Rules/Player/researchComplete");
const destroyed_1 = require("./Rules/Unit/destroyed");
const register = (game) => {
    // The sets before their rules, so each rule is switched as it arrives: the Hydro Plant's starts off. A set of its own
    //  for each game, as a game may add to its sets.
    game.ruleSets.register(new RuleSet_1.default(RuleSets_1.ENHANCED, new RuleSet_1.default(RuleSets_1.HYDRO_PLANT_SITE, {
        enabled: false,
        supersedes: ['civ1-city-improvement:city/build/hydro-plant-site'],
    }, 'civ1-enhanced:city/build/hydro-plant-site'), new RuleSet_1.default(RuleSets_1.BARBARIAN_LEADER_RANSOM, { supersedes: ['civ1-barbarians:unit/defeated/ransom'] }, 'civ1-enhanced:unit/destroyed/ransom'), 
    // A rule added to Civ1's, so nothing to supersede: switched off, v474.05's play is what is left.
    new RuleSet_1.default(RuleSets_1.OBSOLETE_BUILDS, 'civ1-enhanced:player/research-complete/revalidate-builds')));
    game.rules.register(...(0, build_1.default)(), ...(0, researchComplete_1.default)(game.cities, game.cityBuilds), ...(0, destroyed_1.default)(game));
};
exports.register = register;
// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
(0, exports.register)(core_game_1.defaultGame);
exports.default = exports.register;
//# sourceMappingURL=registerRules.js.map