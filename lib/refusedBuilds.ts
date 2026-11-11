import {
  Relation,
  Requirement,
  Target,
} from '@civ-clone/core-requirement/Requirement';
import Build from '@civ-clone/core-city-build/Rules/Build';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Wonder from '@civ-clone/core-wonder/Wonder';
import buildRulesFor from '@civ-clone/core-city-build/lib/buildRulesFor';

// What `OBSOLETE_BUILDS`' rules share (civ-clone/web-renderer#965): each drops what a city is building once something
//  that has just happened makes it unbuildable, and only for that reason. Whether it is refused, and why, is asked of
//  the game's `requirements`: an entry shares its rule's id, so a build whose refusals include the id of an entry
//  naming what happened was refused because of it. So a plugin's own entries count, a rule set's switched-off rules
//  don't (`rules.get` holds only those switched on), and nothing here names a Civ1 item.

/** The game slots these rules read. */
export type RefusedBuildsGame = Pick<
  Game,
  | 'cities'
  | 'cityBuilds'
  | 'cityImprovements'
  | 'requirements'
  | 'rules'
  | 'wonders'
>;

/**
 * What `city` is building, or `null`: also for a city with no build at all (one a ruleset without `civ1-city` made),
 * as these rules run on every city's yields.
 */
export const buildingIn = (
  game: Pick<Game, 'cityBuilds'>,
  city: City
): { cityBuild: CityBuild; Item: Buildable } | null => {
  let cityBuild: CityBuild;

  try {
    cityBuild = game.cityBuilds.getByCity(city);
  } catch (e) {
    return null;
  }

  const building = cityBuild.building();

  return building === null ? null : { cityBuild, Item: building.item() };
};

/**
 * The ids of the rules that refuse `Item` to `city` now, as `CityBuild#unavailable` gives them, for the one item: none
 * while the city may build it.
 */
export const refusedBy = (
  game: Pick<Game, 'rules'>,
  city: City,
  Item: Buildable
): (string | null)[] =>
  buildRulesFor(game.rules.get(Build), Item)
    .filter((rule: Build): boolean => rule.validate(city, Item))
    .filter((rule: Build): boolean => !rule.process(city, Item).validate())
    .map((rule: Build): string | null => rule.id());

/** The entries of `relation` that name something `thing` is an instance of, or that name `thing` itself. */
export const entriesNaming = (
  game: Pick<Game, 'requirements'>,
  relation: Relation,
  thing: object
): Requirement[] =>
  game.requirements.filter(
    (entry: Requirement): boolean =>
      entry.relation === relation &&
      entry.targets.some(
        (target: Target): boolean =>
          target === thing ||
          (typeof target === 'function' && thing instanceof target)
      )
  );

/**
 * The cities `entry` speaks for, when what it names has changed in `city` (if anywhere in particular) for `player`, as
 * its `range` has it: that city alone, its player's cities, or every city.
 */
export const citiesFor = (
  game: Pick<Game, 'cities'>,
  entry: Requirement,
  city: City | null,
  player: Player
): City[] =>
  entry.range === 'world'
    ? game.cities.entries()
    : entry.range === 'player'
    ? game.cities.getByPlayer(player)
    : city === null
    ? []
    : [city];

/**
 * The cities each of `entries` speaks for, when what it names has changed in `city` for `player`, each with the ids of
 * only those entries whose range takes in that city: an entry's id is never asked about in a city outside its own
 * range, so a `world` entry brings no other entry's id to every city. In the order the cities first come, entry by
 * entry.
 */
export const idsByCity = (
  game: Pick<Game, 'cities'>,
  entries: Requirement[],
  city: City | null,
  player: Player
): Map<City, Set<string>> => {
  const byCity: Map<City, Set<string>> = new Map();

  entries.forEach((entry: Requirement): void =>
    citiesFor(game, entry, city, player).forEach((inRange: City): void => {
      const ids = byCity.get(inRange) ?? new Set<string>();

      ids.add(entry.id);
      byCity.set(inRange, ids);
    })
  );

  return byCity;
};

/**
 * Drops what each city in `idsByCity` is building where its refusals include one of the ids given for that city, in
 * the order the map has them, through `CityBuild#cancel('unavailable')`, as `CityBuild#revalidate` would: the shields
 * are kept, the city's player is told why, and a city on Auto goes on to its queue and chooses again. A destroyed city
 * (a `world` entry's range, `cities.entries()`, still holds them), and `except`, are left alone.
 */
export const dropBuildsRefusedBy = (
  game: Pick<Game, 'cityBuilds' | 'rules'>,
  idsByCity: Map<City, Set<string>>,
  except: City | null = null
): void =>
  idsByCity.forEach((ids: Set<string>, city: City): void => {
    if (city === except || city.destroyed()) {
      return;
    }

    const building = buildingIn(game, city);

    if (
      building !== null &&
      refusedBy(game, city, building.Item).some(
        (id: string | null): boolean => id !== null && ids.has(id)
      )
    ) {
      building.cityBuild.cancel('unavailable');
    }
  });

/**
 * Drops each build that `entries` refuse where what they name has changed in `city` for `player`, each entry only in
 * the cities its own `range` speaks for.
 */
export const dropBuildsFor = (
  game: Pick<Game, 'cities' | 'cityBuilds' | 'rules'>,
  entries: Requirement[],
  city: City | null,
  player: Player,
  except: City | null = null
): void => {
  if (entries.length === 0) {
    return;
  }

  dropBuildsRefusedBy(game, idsByCity(game, entries, city, player), except);
};

/** The improvements (Wonders among them) `city` has: what a city's captor gains. */
export const possessions = (
  game: Pick<Game, 'cityImprovements' | 'wonders'>,
  city: City
): CityImprovement[] =>
  Array.from(
    new Set<CityImprovement>([
      ...game.cityImprovements.getByCity(city),
      ...game.wonders.getByCity(city),
    ])
  );

/** Whether `thing` is a Wonder, or a class of one. */
const isWonder = (thing: object): boolean =>
  thing instanceof Wonder ||
  (typeof thing === 'function' &&
    Object.prototype.isPrototypeOf.call(Wonder, thing));

/**
 * The improvements `city` has that it can lose and still stand: not its Wonders. A Wonder leaves a city only with the
 * city itself (civ1-wonder's `Destroyed` rule, which has no id, unregisters it) or with its capture (the captor then holds it): it can't be sold
 * (`civ1-treasury:city-improvement/sell/value`), sabotaged (`civ1-unit:unit/city-sabotaged/sabotage`) or left unpaid
 * (it has no upkeep), and v474.05 counts one lost with its city as built (ECONOMY.C 94-96, 172, 202), so nothing is
 * dropped for want of one (civ-clone/web-renderer#965).
 */
export const losableImprovements = (
  game: Pick<Game, 'cityImprovements'>,
  city: City
): CityImprovement[] =>
  game.cityImprovements
    .getByCity(city)
    .filter((improvement: CityImprovement): boolean => !isWonder(improvement));

/**
 * The builds that needed what `city` has lost, and can no longer be made for want of it, are dropped: where a
 * `requires` entry naming it refuses them, in the cities its `range` speaks for. `player` is whose it was.
 */
export const dropBuildsThatNeeded = (
  game: Pick<Game, 'cities' | 'cityBuilds' | 'requirements' | 'rules'>,
  lost: CityImprovement[],
  city: City,
  player: Player
): void => {
  // A destroyed city is no source of anything lost: what it held went with it (see `losableImprovements`).
  if (city.destroyed()) {
    return;
  }

  dropBuildsFor(
    game,
    Array.from(
      new Set(
        lost
          .filter(
            (improvement: CityImprovement): boolean => !isWonder(improvement)
          )
          .flatMap((improvement: CityImprovement): Requirement[] =>
            entriesNaming(game, 'requires', improvement)
          )
      )
    ),
    city,
    player
  );
};

/** Whether `target` is a class of improvement a city can lose (`losableImprovements`). */
const isLosable = (target: Target): boolean =>
  typeof target === 'function' &&
  Object.prototype.isPrototypeOf.call(CityImprovement, target) &&
  !isWonder(target);

// Whether any `requires` entry naming a losable improvement speaks for more than its own city, worked out once for each
//  list of `Build` rules and count of entries, both read in O(1): `rules.get` hands back the same array until a rule is
//  registered, unregistered, switched on or off (as `core-city-build`'s `buildRulesFor` relies on), and the
//  requirements' `length` changes as an entry is added, registered to describe a hand-written rule, or removed. Not
//  seen: an entry replaced by another of the same count that makes no rules (a describing entry whose range changed).
const wideNeeds: WeakMap<object, { entries: number; wide: boolean }> =
  new WeakMap();

/**
 * Whether a `requires` entry naming a losable improvement has a range wider than its city (`player`, `world`): a city
 * that loses one may then drop builds in other cities, whatever it builds itself.
 */
export const anyWiderNeed = (
  game: Pick<Game, 'requirements' | 'rules'>
): boolean => {
  const key = game.rules.get(Build),
    entries = game.requirements.length,
    cached = wideNeeds.get(key);

  if (cached !== undefined && cached.entries === entries) {
    return cached.wide;
  }

  const wide = game.requirements.some(
    (entry: Requirement): boolean =>
      entry.relation === 'requires' &&
      entry.range !== 'city' &&
      entry.range !== 'tile' &&
      entry.targets.some(isLosable)
  );

  wideNeeds.set(key, { entries, wide });

  return wide;
};

/**
 * Whether what `city` would lose matters to any build: its own build is the subject of a `requires` entry naming a
 * losable improvement, or some such entry speaks for more than its own city (`anyWiderNeed`). Only those cities are
 * noted: it answers as noting every city would, as a city noted for nothing drops nothing.
 */
export const mayNeedAnImprovement = (
  game: Pick<Game, 'cityBuilds' | 'requirements' | 'rules'>,
  city: City
): boolean => {
  if (anyWiderNeed(game)) {
    return true;
  }

  const building = buildingIn(game, city);

  return (
    building !== null &&
    game.requirements
      .for(building.Item, 'requires')
      .some((entry: Requirement): boolean => entry.targets.some(isLosable))
  );
};

export default dropBuildsRefusedBy;
