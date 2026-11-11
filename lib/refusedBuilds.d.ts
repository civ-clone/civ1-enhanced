import { Relation, Requirement } from '@civ-clone/core-requirement/Requirement';
import { IBuildable as Buildable } from '@civ-clone/core-city-build/Buildable';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
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
export declare const buildingIn: (
  game: Pick<Game, 'cityBuilds'>,
  city: City
) => {
  cityBuild: CityBuild;
  Item: Buildable;
} | null;
/**
 * The ids of the rules that refuse `Item` to `city` now, as `CityBuild#unavailable` gives them, for the one item: none
 * while the city may build it.
 */
export declare const refusedBy: (
  game: Pick<Game, 'rules'>,
  city: City,
  Item: Buildable
) => (string | null)[];
/** The entries of `relation` that name something `thing` is an instance of, or that name `thing` itself. */
export declare const entriesNaming: (
  game: Pick<Game, 'requirements'>,
  relation: Relation,
  thing: object
) => Requirement[];
/**
 * The cities `entry` speaks for, when what it names has changed in `city` (if anywhere in particular) for `player`, as
 * its `range` has it: that city alone, its player's cities, or every city.
 */
export declare const citiesFor: (
  game: Pick<Game, 'cities'>,
  entry: Requirement,
  city: City | null,
  player: Player
) => City[];
/**
 * The cities each of `entries` speaks for, when what it names has changed in `city` for `player`, each with the ids of
 * only those entries whose range takes in that city: an entry's id is never asked about in a city outside its own
 * range, so a `world` entry brings no other entry's id to every city. In the order the cities first come, entry by
 * entry.
 */
export declare const idsByCity: (
  game: Pick<Game, 'cities'>,
  entries: Requirement[],
  city: City | null,
  player: Player
) => Map<City, Set<string>>;
/**
 * Drops what each city in `idsByCity` is building where its refusals include one of the ids given for that city, in
 * the order the map has them, through `CityBuild#cancel('unavailable')`, as `CityBuild#revalidate` would: the shields
 * are kept, the city's player is told why, and a city on Auto goes on to its queue and chooses again. A destroyed city
 * (a `world` entry's range, `cities.entries()`, still holds them), and `except`, are left alone.
 */
export declare const dropBuildsRefusedBy: (
  game: Pick<Game, 'cityBuilds' | 'rules'>,
  idsByCity: Map<City, Set<string>>,
  except?: City | null
) => void;
/**
 * Drops each build that `entries` refuse where what they name has changed in `city` for `player`, each entry only in
 * the cities its own `range` speaks for.
 */
export declare const dropBuildsFor: (
  game: Pick<Game, 'cities' | 'cityBuilds' | 'rules'>,
  entries: Requirement[],
  city: City | null,
  player: Player,
  except?: City | null
) => void;
/** The improvements (Wonders among them) `city` has: what a city's captor gains. */
export declare const possessions: (
  game: Pick<Game, 'cityImprovements' | 'wonders'>,
  city: City
) => CityImprovement[];
/**
 * The improvements `city` has that it can lose and still stand: not its Wonders. A Wonder leaves a city only with the
 * city itself (civ1-wonder's `Destroyed` rule, which has no id, unregisters it) or with its capture (the captor then holds it): it can't be sold
 * (`civ1-treasury:city-improvement/sell/value`), sabotaged (`civ1-unit:unit/city-sabotaged/sabotage`) or left unpaid
 * (it has no upkeep), and v474.05 counts one lost with its city as built (ECONOMY.C 94-96, 172, 202), so nothing is
 * dropped for want of one (civ-clone/web-renderer#965).
 */
export declare const losableImprovements: (
  game: Pick<Game, 'cityImprovements'>,
  city: City
) => CityImprovement[];
/**
 * The builds that needed what `city` has lost, and can no longer be made for want of it, are dropped: where a
 * `requires` entry naming it refuses them, in the cities its `range` speaks for. `player` is whose it was.
 */
export declare const dropBuildsThatNeeded: (
  game: Pick<Game, 'cities' | 'cityBuilds' | 'requirements' | 'rules'>,
  lost: CityImprovement[],
  city: City,
  player: Player
) => void;
/**
 * Whether a `requires` entry naming a losable improvement has a range wider than its city (`player`, `world`): a city
 * that loses one may then drop builds in other cities, whatever it builds itself.
 */
export declare const anyWiderNeed: (
  game: Pick<Game, 'requirements' | 'rules'>
) => boolean;
/**
 * Whether what `city` would lose matters to any build: its own build is the subject of a `requires` entry naming a
 * losable improvement, or some such entry speaks for more than its own city (`anyWiderNeed`). Only those cities are
 * noted: it answers as noting every city would, as a city noted for nothing drops nothing.
 */
export declare const mayNeedAnImprovement: (
  game: Pick<Game, 'cityBuilds' | 'requirements' | 'rules'>,
  city: City
) => boolean;
export default dropBuildsRefusedBy;
