import {
  BarbarianActivity,
  CLASSIC_ACTIVITY,
} from '@civ-clone/civ1-barbarians/lib/activity';
import { BARBARIAN_ACTIVITY_LEVEL } from './RuleSets';

// The barbarians' activity levels (civ-clone/web-renderer#1008), in the spirit of Civilization II's four, each a set of
//  the numbers `civ1-barbarians` plays by (`lib/activity`). Active is v474.05's. The others move each number about as
//  far as Civ2 moves its own from one level to the next:
//
//  - the onset, the turns per difficulty level before the first barbarians, by 3 a level, as Civ2's (3 − a) × 3 does;
//  - the sea landings every 16th turn at Sporadic, and every 8th from Active up, as Civ2's;
//  - the raiders at sea one more every 250 − 50 × level turns, as Civ2's (150 at Active, v474.05's own), with one more
//    at Fierce, as Civ2 adds one at its highest level, up to the 3 a Frigate holds with their leader;
//  - uprisings half as likely at Sporadic, and one unit stronger at Fierce.
//
//  Dormant has no sea landings or uprisings, and a goody hut still releases a horde, as at Civ2's lowest level.

/** The levels, quietest first: each one's key is the last part of its member's id. */
export const LEVELS = ['dormant', 'sporadic', 'active', 'fierce'] as const;

export type Level = (typeof LEVELS)[number];

/** The member that draws one of the levels by the difficulty level (`lib/barbarianActivity`). */
export const RANDOM = 'random';

export type Choice = Level | typeof RANDOM;

/** Every choice, in the order they are offered: the levels, quietest first, then the one drawn. */
export const CHOICES: Choice[] = [...LEVELS, RANDOM];

/** Each choice's member of `BARBARIAN_ACTIVITY_LEVEL`, by key. */
export const memberId = (choice: Choice): string =>
  `${BARBARIAN_ACTIVITY_LEVEL}/${choice}`;

/** Every member of `BARBARIAN_ACTIVITY_LEVEL`, in the order of `CHOICES`. */
export const MEMBERS: string[] = CHOICES.map(memberId);

/** The member chosen to start with: Active, v474.05's. */
export const DEFAULT_MEMBER = memberId('active');

export const activities: { [level in Level]: Readonly<BarbarianActivity> } = {
  dormant: Object.freeze({
    onset: Infinity,
    landingEvery: 0,
    raidersEvery: 150,
    extra: 0,
    uprisingChance: 0,
  }),
  sporadic: Object.freeze({
    onset: 33,
    landingEvery: 16,
    raidersEvery: 200,
    extra: 0,
    uprisingChance: 0.5,
  }),
  active: CLASSIC_ACTIVITY,
  fierce: Object.freeze({
    onset: 27,
    landingEvery: 8,
    raidersEvery: 100,
    extra: 1,
    uprisingChance: 1,
  }),
};

export default activities;
