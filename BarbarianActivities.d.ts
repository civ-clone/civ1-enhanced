import { BarbarianActivity } from '@civ-clone/civ1-barbarians/lib/activity';
/** The levels, quietest first: each one's key is the last part of its member's id. */
export declare const LEVELS: readonly [
  'dormant',
  'sporadic',
  'active',
  'fierce'
];
export type Level = (typeof LEVELS)[number];
/** The member that draws one of the levels by the difficulty level (`lib/barbarianActivity`). */
export declare const RANDOM = 'random';
export type Choice = Level | typeof RANDOM;
/** Every choice, in the order they are offered: the levels, quietest first, then the one drawn. */
export declare const CHOICES: Choice[];
/** Each choice's member of `BARBARIAN_ACTIVITY_LEVEL`, by key. */
export declare const memberId: (choice: Choice) => string;
/** Every member of `BARBARIAN_ACTIVITY_LEVEL`, in the order of `CHOICES`. */
export declare const MEMBERS: string[];
/** The member chosen to start with: Active, v474.05's. */
export declare const DEFAULT_MEMBER: string;
export declare const activities: {
  [level in Level]: Readonly<BarbarianActivity>;
};
export default activities;
