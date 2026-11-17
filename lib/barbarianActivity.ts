import { LEVELS, Level } from '../BarbarianActivities';
import { Game } from '@civ-clone/core-game/Game';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import { levelOf } from '@civ-clone/civ1-difficulty/level';

export type DrawnActivityGame = Pick<
  Game,
  'difficulty' | 'pendingEffects' | 'rng'
>;

/**
 * The `PendingEffect` handler name a drawn level is kept under (civ-clone/web-renderer#1008). Nothing discharges it:
 *  it's a record, kept in the game's pending effects because they are saved, so the level drawn stays the game's level
 *  after a load. Only a game that draws one has it.
 */
export const DRAWN_ACTIVITY = 'civ1-enhanced:barbarian-activity';

/**
 * A level drawn by the difficulty level, as Civilization II draws its own (two of its levels, or three, the harder the
 *  fiercer), taking Civ1's five levels by their place, the same as Civ2's first five: on Chieftain, Dormant or
 *  Sporadic; on Lord, Sporadic or Active; from Prince to Emperor, Sporadic, Active or Fierce. Each is as likely as the
 *  others. `draw(n)` gives a whole number from 0 to n − 1.
 */
export const randomLevel = (
  difficulty: number,
  draw: (n: number) => number
): Level => {
  if (difficulty < 2) {
    return LEVELS[draw(2) + difficulty];
  }

  return LEVELS[draw(3) + 1];
};

const isLevel = (value: unknown): value is Level =>
  LEVELS.includes(value as Level);

/**
 * The level drawn for the game: the one kept, or one drawn now, from the game's random numbers, and kept. Asked for
 *  only while the random choice is the one in force, so a game that never chooses it draws nothing.
 */
export const drawnLevel = (game: DrawnActivityGame): Level => {
  const [record = null] = game.pendingEffects.getByHandler(DRAWN_ACTIVITY),
    kept = record === null ? null : record.data().level;

  if (isLevel(kept)) {
    return kept;
  }

  const level = randomLevel(levelOf(game.difficulty), (n: number): number =>
    Math.floor(game.rng() * n)
  );

  if (record !== null) {
    record.setData({ level });
  } else {
    game.pendingEffects.register(
      new PendingEffect(DRAWN_ACTIVITY, null, { level })
    );
  }

  return level;
};

export default drawnLevel;
