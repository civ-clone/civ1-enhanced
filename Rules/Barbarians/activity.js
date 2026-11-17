"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BarbarianActivities_1 = require("../../BarbarianActivities");
const barbarianActivity_1 = require("../../lib/barbarianActivity");
const Activity_1 = require("@civ-clone/civ1-barbarians/Rules/Activity");
const RuleIds_1 = require("../../RuleIds");
const BarbarianActivityLevel_1 = require("../BarbarianActivityLevel");
const Effect_1 = require("@civ-clone/core-rule/Effect");
/**
 * The barbarians' activity level (civ-clone/web-renderer#1008): one `BarbarianActivityLevel` rule for each member of
 *  `BARBARIAN_ACTIVITY_LEVEL`, and `BARBARIAN_ACTIVITY_RULE`, which answers `civ1-barbarians`' `Activity` with the
 *  numbers of the one chosen (`BarbarianActivities`), drawing a level for the random choice the first time it is asked.
 *  The answer is `BARBARIAN_ACTIVITY`'s own: switched off, nothing answers, and the barbarians are v474.05's whatever
 *  level is chosen.
 */
const getRules = (game) => [
    ...BarbarianActivities_1.CHOICES.map((choice) => new BarbarianActivityLevel_1.default((0, BarbarianActivities_1.memberId)(choice), new Effect_1.default(() => choice))),
    new Activity_1.default(RuleIds_1.BARBARIAN_ACTIVITY_RULE, new Effect_1.default(() => {
        const [choice = 'active'] = game.rules.process(BarbarianActivityLevel_1.default), level = choice === BarbarianActivities_1.RANDOM ? (0, barbarianActivity_1.default)(game) : choice;
        return BarbarianActivities_1.default[level];
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=activity.js.map