"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const startAfresh_1 = require("@civ-clone/civ1-unit/lib/startAfresh");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const Priority_1 = require("@civ-clone/core-rule/Priority");
const Transferred_1 = require("@civ-clone/core-unit/Rules/Transferred");
/**
 * A unit that changes sides, bribed or with a city, keeps its veteran status. Otherwise it arrives as a new unit
 * would, as in v474.05: not fortified, with no moves until its new owner's turn and, an aircraft, with its fuel full.
 * v474.05 makes a new unit, so it is no veteran either (`civ1-unit`'s `unit/transferred/start-afresh`, which this takes
 * the place of while `DEFECTORS_STAY_VETERAN` is on: civ-clone/web-renderer#960). Through `civ1-unit`'s
 * `lib/startAfresh`, at its `START_AFRESH_PRIORITY`, before the client is told, whichever package loads first.
 */
const getRules = (game) => [
    new Transferred_1.default(RuleIds_1.KEEP_VETERAN_RULE, new Priority_1.default(startAfresh_1.START_AFRESH_PRIORITY), new Effect_1.default((unit) => (0, startAfresh_1.default)(unit, true, game.unitImprovements, game.strategyNotes))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=transferred.js.map