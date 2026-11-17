"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.drawnLevel = exports.randomLevel = exports.DRAWN_ACTIVITY = void 0;
const BarbarianActivities_1 = require("../BarbarianActivities");
const PendingEffect_1 = require("@civ-clone/core-pending-effect/PendingEffect");
const level_1 = require("@civ-clone/civ1-difficulty/level");
/**
 * The `PendingEffect` handler name a drawn level is kept under (civ-clone/web-renderer#1008). Nothing discharges it:
 *  it's a record, kept in the game's pending effects because they are saved, so the level drawn stays the game's level
 *  after a load. Only a game that draws one has it.
 */
exports.DRAWN_ACTIVITY = 'civ1-enhanced:barbarian-activity';
/**
 * A level drawn by the difficulty level, as Civilization II draws its own (two of its levels, or three, the harder the
 *  fiercer), taking Civ1's five levels by their place, the same as Civ2's first five: on Chieftain, Dormant or
 *  Sporadic; on Lord, Sporadic or Active; from Prince to Emperor, Sporadic, Active or Fierce. Each is as likely as the
 *  others. `draw(n)` gives a whole number from 0 to n − 1.
 */
const randomLevel = (difficulty, draw) => {
    if (difficulty < 2) {
        return BarbarianActivities_1.LEVELS[draw(2) + difficulty];
    }
    return BarbarianActivities_1.LEVELS[draw(3) + 1];
};
exports.randomLevel = randomLevel;
const isLevel = (value) => BarbarianActivities_1.LEVELS.includes(value);
/**
 * The level drawn for the game: the one kept, or one drawn now, from the game's random numbers, and kept. Asked for
 *  only while the random choice is the one in force, so a game that never chooses it draws nothing.
 */
const drawnLevel = (game) => {
    const [record = null] = game.pendingEffects.getByHandler(exports.DRAWN_ACTIVITY), kept = record === null ? null : record.data().level;
    if (isLevel(kept)) {
        return kept;
    }
    const level = (0, exports.randomLevel)((0, level_1.levelOf)(game.difficulty), (n) => Math.floor(game.rng() * n));
    if (record !== null) {
        record.setData({ level });
    }
    else {
        game.pendingEffects.register(new PendingEffect_1.default(exports.DRAWN_ACTIVITY, null, { level }));
    }
    return level;
};
exports.drawnLevel = drawnLevel;
exports.default = exports.drawnLevel;
//# sourceMappingURL=barbarianActivity.js.map