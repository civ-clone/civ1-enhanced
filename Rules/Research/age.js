"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const AgeOf_1 = require("@civ-clone/base-science-age/Rules/AgeOf");
const AgeReached_1 = require("@civ-clone/base-science-age/Rules/AgeReached");
const Complete_1 = require("@civ-clone/core-science/Rules/Complete");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const advanceTiers_1 = require("../../lib/advanceTiers");
const events_1 = require("@civ-clone/base-science-age/lib/events");
const latestAge_1 = require("@civ-clone/base-science-age/lib/latestAge");
const reached_1 = require("@civ-clone/base-science-age/lib/reached");
const Ages_1 = require("../../Ages");
const RuleIds_1 = require("../../RuleIds");
const getRules = (game) => [
    // A civilization is in the age of the latest tier it knows an advance of, and in the first knowing none.
    new AgeOf_1.default(RuleIds_1.AGE_BY_TIER_RULE, new Effect_1.default((0, latestAge_1.latestAge)(Ages_1.default, (AdvanceType) => {
        const tier = (0, advanceTiers_1.advanceTiers)(game).get(AdvanceType);
        return tier === undefined ? undefined : Ages_1.default[tier];
    }))),
    // After `civ1-science`'s rule tells of the advance itself, and not while the game is set up: the advances a
    //  civilization starts with are given before the first turn, at turn 0.
    new Complete_1.default(RuleIds_1.REACH_AGE_RULE, new Low_1.default(), new Effect_1.default((0, reached_1.reachAge)(game.rules, () => game.turn.value() > 0))),
    new AgeReached_1.default(RuleIds_1.AGE_REACHED_RULE, new Effect_1.default((0, events_1.emitAgeReached)(game.engine))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=age.js.map