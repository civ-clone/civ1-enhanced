"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWorld = exports.loadGame = void 0;
const FillGenerator_1 = require("@civ-clone/simple-world-generator/tests/lib/FillGenerator");
const Game_1 = require("@civ-clone/core-game/Game");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const World_1 = require("@civ-clone/core-world/World");
const registerRules_1 = require("@civ-clone/civ1-barbarians/registerRules");
const registerRules_2 = require("@civ-clone/civ1-city-improvement/registerRules");
const registerRules_3 = require("../../registerRules");
const registerRules_4 = require("@civ-clone/civ1-unit/registerRules");
const registers = [
    ['civ1-city-improvement', registerRules_2.default],
    ['civ1-unit', registerRules_4.default],
    ['civ1-barbarians', registerRules_1.default],
];
/**
 * A game with the Civ1 packages named (all three unless told otherwise), then this one, registered against it, in the
 * order the plugin loader takes them, by name.
 */
const loadGame = (packages = registers.map(([name]) => name)) => {
    const game = new Game_1.Game();
    registers
        .filter(([name]) => packages.includes(name))
        .forEach(([, register]) => register(game));
    (0, registerRules_3.default)(game);
    return game;
};
exports.loadGame = loadGame;
/** A 5 × 5 Grassland world, built with the game's rules. */
const buildWorld = async (game) => {
    const world = new World_1.default(new FillGenerator_1.default(5, 5, Terrains_1.Grassland), game.rules);
    await world.build();
    return world;
};
exports.buildWorld = buildWorld;
exports.default = exports.loadGame;
//# sourceMappingURL=loadGame.js.map