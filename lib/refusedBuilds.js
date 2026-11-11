"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mayNeedAnImprovement = exports.dropBuildsThatNeeded = exports.losableImprovements = exports.possessions = exports.dropBuildsFor = exports.dropBuildsRefusedBy = exports.idsByCity = exports.citiesFor = exports.entriesNaming = exports.refusedBy = exports.buildingIn = void 0;
const Build_1 = require("@civ-clone/core-city-build/Rules/Build");
const CityImprovement_1 = require("@civ-clone/core-city-improvement/CityImprovement");
const Wonder_1 = require("@civ-clone/core-wonder/Wonder");
const buildRulesFor_1 = require("@civ-clone/core-city-build/lib/buildRulesFor");
/**
 * What `city` is building, or `null`: also for a city with no build at all (one a ruleset without `civ1-city` made),
 * as these rules run on every city's yields.
 */
const buildingIn = (game, city) => {
    let cityBuild;
    try {
        cityBuild = game.cityBuilds.getByCity(city);
    }
    catch (e) {
        return null;
    }
    const building = cityBuild.building();
    return building === null ? null : { cityBuild, Item: building.item() };
};
exports.buildingIn = buildingIn;
/**
 * The ids of the rules that refuse `Item` to `city` now, as `CityBuild#unavailable` gives them, for the one item: none
 * while the city may build it.
 */
const refusedBy = (game, city, Item) => (0, buildRulesFor_1.default)(game.rules.get(Build_1.default), Item)
    .filter((rule) => rule.validate(city, Item))
    .filter((rule) => !rule.process(city, Item).validate())
    .map((rule) => rule.id());
exports.refusedBy = refusedBy;
/** The entries of `relation` that name something `thing` is an instance of, or that name `thing` itself. */
const entriesNaming = (game, relation, thing) => game.requirements.filter((entry) => entry.relation === relation &&
    entry.targets.some((target) => target === thing ||
        (typeof target === 'function' && thing instanceof target)));
exports.entriesNaming = entriesNaming;
/**
 * The cities `entry` speaks for, when what it names has changed in `city` (if anywhere in particular) for `player`, as
 * its `range` has it: that city alone, its player's cities, or every city.
 */
const citiesFor = (game, entry, city, player) => entry.range === 'world'
    ? game.cities.entries()
    : entry.range === 'player'
        ? game.cities.getByPlayer(player)
        : city === null
            ? []
            : [city];
exports.citiesFor = citiesFor;
/**
 * The cities each of `entries` speaks for, when what it names has changed in `city` for `player`, each with the ids of
 * only those entries whose range takes in that city: an entry's id is never asked about in a city outside its own
 * range, so a `world` entry brings no other entry's id to every city. In the order the cities first come, entry by
 * entry.
 */
const idsByCity = (game, entries, city, player) => {
    const byCity = new Map();
    entries.forEach((entry) => (0, exports.citiesFor)(game, entry, city, player).forEach((inRange) => {
        var _a;
        const ids = (_a = byCity.get(inRange)) !== null && _a !== void 0 ? _a : new Set();
        ids.add(entry.id);
        byCity.set(inRange, ids);
    }));
    return byCity;
};
exports.idsByCity = idsByCity;
/**
 * Drops what each city in `idsByCity` is building where its refusals include one of the ids given for that city, in
 * the order the map has them, through `CityBuild#cancel('unavailable')`, as `CityBuild#revalidate` would: the shields
 * are kept, the city's player is told why, and a city on Auto goes on to its queue and chooses again. A destroyed city
 * (a `world` entry's range, `cities.entries()`, still holds them), and `except`, are left alone.
 */
const dropBuildsRefusedBy = (game, idsByCity, except = null) => idsByCity.forEach((ids, city) => {
    if (city === except || city.destroyed()) {
        return;
    }
    const building = (0, exports.buildingIn)(game, city);
    if (building !== null &&
        (0, exports.refusedBy)(game, city, building.Item).some((id) => id !== null && ids.has(id))) {
        building.cityBuild.cancel('unavailable');
    }
});
exports.dropBuildsRefusedBy = dropBuildsRefusedBy;
/**
 * Drops each build that `entries` refuse where what they name has changed in `city` for `player`, each entry only in
 * the cities its own `range` speaks for.
 */
const dropBuildsFor = (game, entries, city, player, except = null) => {
    if (entries.length === 0) {
        return;
    }
    (0, exports.dropBuildsRefusedBy)(game, (0, exports.idsByCity)(game, entries, city, player), except);
};
exports.dropBuildsFor = dropBuildsFor;
/** The improvements (Wonders among them) `city` has: what a city's captor gains. */
const possessions = (game, city) => Array.from(new Set([
    ...game.cityImprovements.getByCity(city),
    ...game.wonders.getByCity(city),
]));
exports.possessions = possessions;
/** Whether `thing` is a Wonder, or a class of one. */
const isWonder = (thing) => thing instanceof Wonder_1.default ||
    (typeof thing === 'function' &&
        Object.prototype.isPrototypeOf.call(Wonder_1.default, thing));
/**
 * The improvements `city` has that it can lose and still stand: not its Wonders. A Wonder leaves a city only with the
 * city itself (`civ1-wonder:city/destroyed`) or with its capture (the captor then holds it): it can't be sold
 * (`civ1-treasury:city-improvement/sell/value`), sabotaged (`civ1-unit:unit/city-sabotaged/sabotage`) or left unpaid
 * (it has no upkeep), and v474.05 counts one lost with its city as built (ECONOMY.C 94-96, 172, 202), so nothing is
 * dropped for want of one (civ-clone/web-renderer#965).
 */
const losableImprovements = (game, city) => game.cityImprovements
    .getByCity(city)
    .filter((improvement) => !isWonder(improvement));
exports.losableImprovements = losableImprovements;
/**
 * The builds that needed what `city` has lost, and can no longer be made for want of it, are dropped: where a
 * `requires` entry naming it refuses them, in the cities its `range` speaks for. `player` is whose it was.
 */
const dropBuildsThatNeeded = (game, lost, city, player) => {
    // A destroyed city is no source of anything lost: what it held went with it (see `losableImprovements`).
    if (city.destroyed()) {
        return;
    }
    (0, exports.dropBuildsFor)(game, Array.from(new Set(lost
        .filter((improvement) => !isWonder(improvement))
        .flatMap((improvement) => (0, exports.entriesNaming)(game, 'requires', improvement)))), city, player);
};
exports.dropBuildsThatNeeded = dropBuildsThatNeeded;
/**
 * Whether what `city` is building is the subject of a `requires` entry that names an improvement other than a Wonder:
 * the only builds a lost one can refuse (`losableImprovements`), so the only cities worth noting what they have.
 */
const mayNeedAnImprovement = (game, city) => {
    const building = (0, exports.buildingIn)(game, city);
    return (building !== null &&
        game.requirements
            .for(building.Item, 'requires')
            .some((entry) => entry.targets.some((target) => typeof target === 'function' &&
            Object.prototype.isPrototypeOf.call(CityImprovement_1.default, target) &&
            !isWonder(target))));
};
exports.mayNeedAnImprovement = mayNeedAnImprovement;
exports.default = exports.dropBuildsRefusedBy;
//# sourceMappingURL=refusedBuilds.js.map