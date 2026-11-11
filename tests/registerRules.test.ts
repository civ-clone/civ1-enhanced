import {
  BARBARIAN_LEADER_RANSOM,
  ENHANCED,
  HYDRO_PLANT_SITE,
  OBSOLETE_BUILDS,
} from '../RuleSets';
import { Game } from '@civ-clone/core-game/Game';
import { expect } from 'chai';
import loadGame from './lib/loadGame';
import register from '../registerRules';

// The Civ1 rules this package's sets change, and the rules they change them with (civ-clone/web-renderer#954).
const CIV1_HYDRO_PLANT_SITE =
    'civ1-city-improvement:city/build/hydro-plant-site',
  CIV1_RANSOM = 'civ1-barbarians:unit/defeated/ransom',
  HYDRO_PLANT_SITE_RULE = 'civ1-enhanced:city/build/hydro-plant-site',
  RANSOM_RULE = 'civ1-enhanced:unit/destroyed/ransom',
  REVALIDATE_BUILDS_RULE =
    'civ1-enhanced:player/research-complete/revalidate-builds';

const enabled = (game: Game, id: string): boolean =>
  game.rules.getById(id)!.enabled();

describe('registerRules', (): void => {
  it('should register against a game', (): void => {
    const game = new Game();

    expect((): void => register(game)).not.to.throw();
  });

  it('should hold its three sets under one parent, with the ids exported', (): void => {
    const game = loadGame();

    expect(ENHANCED).to.equal('civ1-enhanced');
    expect(HYDRO_PLANT_SITE).to.equal('civ1-enhanced:hydro-plant-site');
    expect(BARBARIAN_LEADER_RANSOM).to.equal(
      'civ1-enhanced:barbarian-leader-ransom'
    );
    expect(OBSOLETE_BUILDS).to.equal('civ1-enhanced:obsolete-builds');
    expect(game.ruleSets.get(ENHANCED)!.memberIds()).to.eql([
      HYDRO_PLANT_SITE,
      BARBARIAN_LEADER_RANSOM,
      OBSOLETE_BUILDS,
    ]);
    expect(game.ruleSets.get(HYDRO_PLANT_SITE)!.supersedes()).to.eql([
      CIV1_HYDRO_PLANT_SITE,
    ]);
    expect(game.ruleSets.get(BARBARIAN_LEADER_RANSOM)!.supersedes()).to.eql([
      CIV1_RANSOM,
    ]);
    expect(game.ruleSets.get(OBSOLETE_BUILDS)!.supersedes()).to.eql([]);
  });

  it('should start as today: the Hydro Plant as v474.05, the ransom and obsolete builds as civ-clone', (): void => {
    const game = loadGame();

    expect(game.ruleSets.state(ENHANCED)).to.equal('mixed');
    expect(game.ruleSets.state(HYDRO_PLANT_SITE)).to.equal('off');
    expect(game.ruleSets.state(BARBARIAN_LEADER_RANSOM)).to.equal('on');
    expect(game.ruleSets.state(OBSOLETE_BUILDS)).to.equal('on');

    expect(enabled(game, CIV1_HYDRO_PLANT_SITE)).true;
    expect(enabled(game, HYDRO_PLANT_SITE_RULE)).false;
    expect(enabled(game, CIV1_RANSOM)).false;
    expect(enabled(game, RANSOM_RULE)).true;
    expect(enabled(game, REVALIDATE_BUILDS_RULE)).true;

    // Nothing differs from the defaults, so a save keeps nothing.
    expect(game.ruleSets.choices()).to.eql([]);
  });

  it('should show the parent as mixed, and leave exactly the v474.05 rules running for all three when it is switched off', (): void => {
    const game = loadGame();

    expect(game.ruleSets.state(ENHANCED)).to.equal('mixed');

    game.ruleSets.set(ENHANCED, false);

    expect(game.ruleSets.state(ENHANCED)).to.equal('off');
    expect(enabled(game, CIV1_HYDRO_PLANT_SITE)).true;
    expect(enabled(game, HYDRO_PLANT_SITE_RULE)).false;
    expect(enabled(game, CIV1_RANSOM)).true;
    expect(enabled(game, RANSOM_RULE)).false;
    expect(enabled(game, REVALIDATE_BUILDS_RULE)).false;
    expect(game.ruleSets.validate()).to.eql([]);
  });

  it('should switch on every enhanced rule when the parent is switched on, and supersede both Civ1 rules', (): void => {
    const game = loadGame();

    game.ruleSets.set(ENHANCED, true);

    expect(game.ruleSets.state(ENHANCED)).to.equal('on');
    expect(enabled(game, CIV1_HYDRO_PLANT_SITE)).false;
    expect(enabled(game, HYDRO_PLANT_SITE_RULE)).true;
    expect(enabled(game, CIV1_RANSOM)).false;
    expect(enabled(game, RANSOM_RULE)).true;
    expect(enabled(game, REVALIDATE_BUILDS_RULE)).true;
    expect(game.ruleSets.validate()).to.eql([]);
  });

  it('should find no problems with every package loaded, in either state', (): void => {
    const game = loadGame();

    expect(game.ruleSets.validate()).to.eql([]);
    expect((): void => game.ruleSets.check()).not.to.throw();
  });

  it('should find only orphans that do not block, with the superseded Civ1 packages not loaded', (): void => {
    const game = loadGame(['civ1-unit']),
      problems = game.ruleSets.validate();

    expect(
      problems.map(({ kind, ids, blocking }) => ({ kind, ids, blocking }))
    ).to.eql([
      {
        kind: 'unknown-superseded',
        ids: [HYDRO_PLANT_SITE, CIV1_HYDRO_PLANT_SITE],
        blocking: false,
      },
      {
        kind: 'unknown-superseded',
        ids: [BARBARIAN_LEADER_RANSOM, CIV1_RANSOM],
        blocking: false,
      },
    ]);
    expect((): void => game.ruleSets.check()).not.to.throw();
  });

  it('should find only orphans that do not block with no Civ1 package loaded at all', (): void => {
    const game = loadGame([]);

    expect(game.ruleSets.validate().every(({ blocking }) => !blocking)).true;
    expect(
      game.ruleSets
        .validate()
        .every(({ kind }) => kind === 'unknown-superseded')
    ).true;
  });

  it('should keep what was chosen through a save and a new game', (): void => {
    const game = loadGame();

    game.ruleSets.set(HYDRO_PLANT_SITE, true);
    game.ruleSets.set(BARBARIAN_LEADER_RANSOM, false);
    game.ruleSets.set(OBSOLETE_BUILDS, false);

    const choices = game.ruleSets.choices();

    expect(choices).to.eql([
      { id: HYDRO_PLANT_SITE, value: true },
      { id: BARBARIAN_LEADER_RANSOM, value: false },
      { id: OBSOLETE_BUILDS, value: false },
    ]);

    const restored = loadGame();

    expect(restored.ruleSets.restore(choices)).to.eql([]);
    expect(restored.ruleSets.choices()).to.eql(choices);
    expect(enabled(restored, CIV1_HYDRO_PLANT_SITE)).false;
    expect(enabled(restored, HYDRO_PLANT_SITE_RULE)).true;
    expect(enabled(restored, CIV1_RANSOM)).true;
    expect(enabled(restored, RANSOM_RULE)).false;
    expect(enabled(restored, REVALIDATE_BUILDS_RULE)).false;
    expect(restored.ruleSets.validate()).to.eql([]);
  });

  it('should keep the parent switched off as one line through a save', (): void => {
    const game = loadGame();

    game.ruleSets.set(ENHANCED, false);

    const choices = game.ruleSets.choices(),
      restored = loadGame();

    expect(restored.ruleSets.restore(choices)).to.eql([]);
    expect(restored.ruleSets.state(ENHANCED)).to.equal('off');
    expect(enabled(restored, CIV1_RANSOM)).true;
    expect(enabled(restored, RANSOM_RULE)).false;
  });
});
