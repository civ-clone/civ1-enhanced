import { Game } from '@civ-clone/core-game/Game';
import { expect } from 'chai';
import register from '../registerRules';

describe('registerRules', (): void => {
  it('should register against a game', (): void => {
    const game = new Game();

    expect((): void => register(game)).not.to.throw();
  });
});
