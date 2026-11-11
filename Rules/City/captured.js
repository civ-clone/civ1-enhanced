"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.CAPTURED_BUILD_PRIORITY = void 0;
const Captured_1 = require("@civ-clone/core-city/Rules/Captured");
const RuleIds_1 = require("../../RuleIds");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const capturedBuild_1 = require("@civ-clone/civ1-city/lib/capturedBuild");
const isHuman_1 = require("@civ-clone/civ1-difficulty/isHuman");
/** Between `High` (1000) and `Normal` (2000). */
exports.CAPTURED_BUILD_PRIORITY = 1500;
/**
 * A city the human captures stops building what it was, and the human chooses, as a computer player chooses again
 * (`civ1-city`'s `city/captured/clear-build`): the item was its previous owner's choice, one the human may not be able
 * to build, or want (civ-clone/web-renderer#670, #500). v474.05 leaves the human building it (`civ1-city`'s
 * `city/captured/keep-build`, which this takes the place of while `CAPTURED_CITY_BUILD` is on:
 * civ-clone/web-renderer#954). Cleared through `civ1-city`'s `lib/capturedBuild`, as a computer player's is.
 *
 * `CAPTURED_BUILD_PRIORITY` runs it after the `High` `Captured` rules and before the `Normal` ones, whatever order the
 * packages load in: where `civ1-city`'s own rule cleared the build, before the city shrinks and `city:captured` is
 * raised, so a listener sees the build already cleared. That is ahead of `civ1-city`'s `reset-build-progress` and
 * `stop-auto` too, so it takes the city off Auto itself, as `stop-auto` would, before the `BuildingCancelled` rules
 * could choose for it. Clearing keeps the shields, which `reset-build-progress` then empties, as before.
 */
const getRules = (game) => [
    new Captured_1.default(RuleIds_1.CLEAR_CAPTURED_BUILD_RULE, new Priority_1.default(exports.CAPTURED_BUILD_PRIORITY), new Criterion_1.default((capturedCity, capturingPlayer) => (0, isHuman_1.default)(capturingPlayer, game.clients)), new Effect_1.default((capturedCity) => {
        const cityBuild = game.cityBuilds.getByCity(capturedCity);
        cityBuild.setAuto(false);
        (0, capturedBuild_1.default)(cityBuild);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=captured.js.map