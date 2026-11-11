import { Game, defaultGame } from '@civ-clone/core-game';

export const register = (game: Game): void => {};

// The plugin loader imports each package for this side effect, as it does `registerRules` elsewhere.
register(defaultGame);

export default register;
