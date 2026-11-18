import { Railroad, Road } from '@civ-clone/civ1-world/TileImprovements';
import loadGame, { buildWorld } from './lib/loadGame';
import BuildOnCitySquare from '@civ-clone/civ1-unit/Rules/BuildOnCitySquare';
import { Game } from '@civ-clone/core-game/Game';
import { Move } from '@civ-clone/civ1-unit/Actions';
import Player from '@civ-clone/core-player/Player';
import { RAILROADS_IN_CITIES } from '../RuleSets';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import { Warrior } from '@civ-clone/civ1-unit/Units';
import World from '@civ-clone/core-world/World';
import { expect } from 'chai';

// What a move from (1, 1), with `from`, to (2, 1), with `to`, costs a land unit.
const moveCost = (
  game: Game,
  world: World,
  from: (typeof TileImprovement)[],
  to: (typeof TileImprovement)[]
): number => {
  from.forEach((Improvement): void =>
    game.tileImprovements.register(new Improvement(world.get(1, 1), game.rules))
  );
  to.forEach((Improvement): void =>
    game.tileImprovements.register(new Improvement(world.get(2, 1), game.rules))
  );

  const unit = new Warrior(
    null,
    new Player(game.rules),
    world.get(1, 1),
    game.rules
  );

  return new Move(
    unit.tile(),
    world.get(2, 1),
    unit,
    game.rules
  ).movementCost();
};

// Whether a Railroad may be built on a city's square, by the `BuildOnCitySquare` rules in force.
const railroadOnCitySquare = async (game: Game): Promise<boolean> => {
  const world = await buildWorld(game);

  return game.rules
    .process(
      BuildOnCitySquare,
      Railroad,
      world.get(1, 1),
      new Player(game.rules)
    )
    .every((allowed: boolean): boolean => allowed);
};

describe('railroads in cities (civ-clone/web-renderer#1029)', (): void => {
  it('should be on to start with, so cities take a Railroad and a train needs one on both squares, as they always have', async (): Promise<void> => {
    const game = loadGame(['civ1-unit']);

    expect(game.ruleSets.state(RAILROADS_IN_CITIES)).to.equal('on');
    expect(await railroadOnCitySquare(game)).true;

    expect(
      moveCost(game, await buildWorld(game), [Road, Railroad], [Road, Railroad])
    ).to.equal(0);

    // Into a city with no Railroad, or off the end of the line: a road move.
    const other = loadGame(['civ1-unit']);

    expect(
      moveCost(other, await buildWorld(other), [Road, Railroad], [Road])
    ).to.approximately(1 / 3, 0.0001);
  });

  it("should refuse a city's Railroad, and run a train on to a Road, when it's off, as v474.05 does", async (): Promise<void> => {
    const off = (): Game => {
      const game = loadGame(['civ1-unit']);

      game.ruleSets.set(RAILROADS_IN_CITIES, false);

      return game;
    };

    expect(await railroadOnCitySquare(off())).false;

    const game = off();

    expect(
      moveCost(game, await buildWorld(game), [Road, Railroad], [Road])
    ).to.equal(0);

    const other = off();

    expect(
      moveCost(other, await buildWorld(other), [Road], [Road, Railroad])
    ).to.approximately(1 / 3, 0.0001);
  });
});
