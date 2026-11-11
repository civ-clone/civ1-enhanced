"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptedRng = exports.buildWorld = exports.loadGame = exports.civ1Packages = exports.pluginOrder = void 0;
const Game_1 = require("@civ-clone/core-game/Game");
const FillGenerator_1 = require("@civ-clone/simple-world-generator/tests/lib/FillGenerator");
const Terrains_1 = require("@civ-clone/civ1-world/Terrains");
const World_1 = require("@civ-clone/core-world/World");
const registerRules_1 = require("@civ-clone/civ1-barbarians/registerRules");
const registerRules_2 = require("@civ-clone/civ1-city/registerRules");
const registerRules_3 = require("@civ-clone/civ1-city-improvement/registerRules");
const registerRules_4 = require("../../registerRules");
const registerRules_5 = require("@civ-clone/civ1-unit/registerRules");
const registerRules_6 = require("@civ-clone/civ1-wonder/registerRules");
const registers = {
    'civ1-barbarians': registerRules_1.default,
    'civ1-city': registerRules_2.default,
    'civ1-city-improvement': registerRules_3.default,
    'civ1-enhanced': registerRules_4.default,
    'civ1-unit': registerRules_5.default,
    'civ1-wonder': registerRules_6.default,
};
/** The order the plugin loader registers packages in: by name. */
exports.pluginOrder = Object.keys(registers).sort();
/** Every Civ1 package whose rules this one's sets change. */
exports.civ1Packages = [
    'civ1-barbarians',
    'civ1-city',
    'civ1-city-improvement',
    'civ1-unit',
    'civ1-wonder',
];
/**
 * A game with the Civ1 packages named (all of them unless told otherwise) and this one registered against it, in the
 * order given: the plugin loader's, by name, unless told otherwise. `slots` are the game's own, such as its `rng`.
 */
const loadGame = (packages = exports.civ1Packages, order = exports.pluginOrder, slots = {}) => {
    const game = new Game_1.Game(slots);
    order
        .filter((name) => name === 'civ1-enhanced' || packages.includes(name))
        .forEach((name) => registers[name](game));
    return game;
};
exports.loadGame = loadGame;
/** A Grassland world, 5 × 5 unless told otherwise, built with the game's rules. */
const buildWorld = async (game, size = 5) => {
    const world = new World_1.default(new FillGenerator_1.default(size, size, Terrains_1.Grassland), game.rules);
    await world.build();
    return world;
};
exports.buildWorld = buildWorld;
exports.default = exports.loadGame;
/**
 * A random number generator for a game's `rng` that returns `rolls` in turn, then `then`. `rolls` is the array itself,
 * so a test can add to it, and see what is left.
 */
const scriptedRng = (rolls, then = 0) => {
    let calls = 0;
    return Object.assign(() => {
        calls++;
        return rolls.length > 0 ? rolls.shift() : then;
    }, {
        calls: () => calls,
        restore: () => { },
        seed: () => 0,
    });
};
exports.scriptedRng = scriptedRng;
//# sourceMappingURL=loadGame.js.map