"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Pacified_1 = require("@civ-clone/library-diplomacy/Rules/Player/Pacified");
const RuleIds_1 = require("../../RuleIds");
const Wonders_1 = require("@civ-clone/civ1-wonder/Wonders");
const hasWonder_1 = require("@civ-clone/civ1-wonder/Rules/lib/hasWonder");
/**
 * Every other leader is pacified towards the owner of the United Nations, a computer player's too, so two computer
 * players that meet never go to war over it either (civ-clone/web-renderer#30). v474.05 pacifies a leader only towards
 * a human owner, in the human's parley (`civ1-wonder`'s `player/pacified/united-nations`, which this takes the place of
 * while `UNITED_NATIONS_STOPS_COMPUTER_WARS` is on: civ-clone/web-renderer#960). The Great Wall's rule is v474.05's
 * already, between computer players too.
 */
const getRules = (game) => [
    new Pacified_1.default(RuleIds_1.UNITED_NATIONS_PACIFIED_RULE, new Criterion_1.default((player, other) => player !== other &&
        (0, hasWonder_1.playerOwnsWonder)(other, Wonders_1.UnitedNations, game.wonders, game.playerResearch, game.requirements)), new Effect_1.default(() => true)),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=pacified.js.map