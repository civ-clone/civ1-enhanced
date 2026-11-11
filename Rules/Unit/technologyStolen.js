"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const stealAdvance_1 = require("@civ-clone/civ1-unit/lib/stealAdvance");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const TechnologyStolen_1 = require("@civ-clone/base-unit-action-steal-technology/Rules/TechnologyStolen");
/**
 * A Diplomat takes any advance the victim knows and the thief doesn't, each as likely as the next
 * (civ-clone/web-renderer#58): one draw, and only when there is something to take. v474.05 walks its list of advances
 * from a random one and takes the first it can, so an advance after a run the thief knows is likelier (`civ1-unit`'s
 * `unit/technology-stolen/steal`, which this takes the place of while `EVEN_ADVANCE_STEALING` is on:
 * civ-clone/web-renderer#960). Through `civ1-unit`'s `lib/stealAdvance`, so the theft is otherwise the same.
 */
const getRules = (game) => [
    new TechnologyStolen_1.default(RuleIds_1.STEAL_RULE, new Effect_1.default((unit, city) => {
        const thief = unit.player(), victim = city.player(), stealable = (0, stealAdvance_1.stealableAdvances)(thief, victim, game.playerResearch);
        if (stealable.length === 0) {
            return false;
        }
        (0, stealAdvance_1.default)(thief, victim, city, stealable[Math.floor(game.rng() * stealable.length)], {
            engine: game.engine,
            interactionRegistry: game.interactions,
            playerResearchRegistry: game.playerResearch,
            ruleRegistry: game.rules,
            turn: game.turn,
        });
        return true;
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=technologyStolen.js.map