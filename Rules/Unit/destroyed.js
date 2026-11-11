"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ransom_1 = require("@civ-clone/civ1-barbarians/lib/ransom");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Destroyed_1 = require("@civ-clone/core-unit/Rules/Destroyed");
const Units_1 = require("@civ-clone/civ1-unit/Units");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * Ransom (civ-clone/web-renderer#171): a barbarian leader (the group's Diplomat) killed by a civilization pays it 100
 * gold, however he dies, so a leader killed in a stack that another unit defended pays too. v474.05 pays only for a
 * leader who defends and loses (`civ1-barbarians`' `unit/defeated/ransom`, which this takes the place of while
 * `BARBARIAN_LEADER_RANSOM` is on: civ-clone/web-renderer#954). On `Destroyed` rather than `Defeated`, as the units
 * dying with a defender are only destroyed. Disbanding passes no player, so a leader who gives up pays nothing.
 */
const getRules = (game) => [
    new Destroyed_1.default(RuleIds_1.RANSOM_RULE, new Criterion_1.default((unit) => unit instanceof Units_1.Diplomat && (0, isBarbarian_1.default)(unit.player())), new Criterion_1.default((unit, player) => player !== null && !(0, isBarbarian_1.default)(player)), 
    // Once: a leader aboard a ship goes down with it, and then comes up again in the defeated stack, as
    //  `civ1-unit`'s count-loss rule allows for.
    new Criterion_1.default((unit) => !unit.destroyed()), new Effect_1.default((unit, player) => (0, ransom_1.default)(game, player, unit))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=destroyed.js.map